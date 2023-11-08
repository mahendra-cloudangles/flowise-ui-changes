import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { initializeAgentExecutorWithOptions, AgentExecutor } from 'langchain/agents'
import { getBaseClasses, mapChatHistory } from '../../../src/utils'
import { flatten } from 'lodash'
import { BaseChatMemory } from 'langchain/memory'
import { ConsoleCallbackHandler, CustomChainHandler, additionalCallbacks } from '../../../src/handler'
import { DynamicTool } from 'langchain/tools'
import { S3Operations } from './S3Operations.js'
import { getCredentialData, getCredentialParam } from '../../../src/utils'

const defaultMessage = `Do your best to answer the questions. Feel free to use any tools available to look up relevant information, only if necessary.`

class S3OperationsAgent implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    credential: INodeParams

    constructor() {
        this.label = 'S3 Operations Agent'
        this.name = 's3OperationsAgent'
        this.version = 1.0
        this.type = 'AgentExecutor'
        this.category = 'Agents'
        this.icon = 's3.svg'
        // this.description = `An agent optimized for retrieval during conversation, answering questions based on past dialogue, all using OpenAI's Function Calling`
        this.description = `An agent optimized for performing S3 operations using AWS SDK.`
        this.baseClasses = [this.type, ...getBaseClasses(AgentExecutor)]
        this.credential = {
            label: 'AWS Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['awsApi']
        }
        this.inputs = [
            {
                label: 'Memory',
                name: 'memory',
                type: 'BaseChatMemory'
            },
            {
                label: 'OpenAI Chat Model',
                name: 'model',
                type: 'ChatOpenAI'
            },
            {
                label: 'Region',
                name: 'region',
                type: 'options',
                options: [
                    { label: 'af-south-1', name: 'af-south-1' },
                    { label: 'ap-east-1', name: 'ap-east-1' },
                    { label: 'ap-northeast-1', name: 'ap-northeast-1' },
                    { label: 'ap-northeast-2', name: 'ap-northeast-2' },
                    { label: 'ap-northeast-3', name: 'ap-northeast-3' },
                    { label: 'ap-south-1', name: 'ap-south-1' },
                    { label: 'ap-south-2', name: 'ap-south-2' },
                    { label: 'ap-southeast-1', name: 'ap-southeast-1' },
                    { label: 'ap-southeast-2', name: 'ap-southeast-2' },
                    { label: 'ap-southeast-3', name: 'ap-southeast-3' },
                    { label: 'ap-southeast-4', name: 'ap-southeast-4' },
                    { label: 'ap-southeast-5', name: 'ap-southeast-5' },
                    { label: 'ap-southeast-6', name: 'ap-southeast-6' },
                    { label: 'ca-central-1', name: 'ca-central-1' },
                    { label: 'ca-west-1', name: 'ca-west-1' },
                    { label: 'cn-north-1', name: 'cn-north-1' },
                    { label: 'cn-northwest-1', name: 'cn-northwest-1' },
                    { label: 'eu-central-1', name: 'eu-central-1' },
                    { label: 'eu-central-2', name: 'eu-central-2' },
                    { label: 'eu-north-1', name: 'eu-north-1' },
                    { label: 'eu-south-1', name: 'eu-south-1' },
                    { label: 'eu-south-2', name: 'eu-south-2' },
                    { label: 'eu-west-1', name: 'eu-west-1' },
                    { label: 'eu-west-2', name: 'eu-west-2' },
                    { label: 'eu-west-3', name: 'eu-west-3' },
                    { label: 'il-central-1', name: 'il-central-1' },
                    { label: 'me-central-1', name: 'me-central-1' },
                    { label: 'me-south-1', name: 'me-south-1' },
                    { label: 'sa-east-1', name: 'sa-east-1' },
                    { label: 'us-east-1', name: 'us-east-1' },
                    { label: 'us-east-2', name: 'us-east-2' },
                    { label: 'us-gov-east-1', name: 'us-gov-east-1' },
                    { label: 'us-gov-west-1', name: 'us-gov-west-1' },
                    { label: 'us-west-1', name: 'us-west-1' },
                    { label: 'us-west-2', name: 'us-west-2' }
                ],
                default: 'us-east-1'
            },
            {
                label: 'System Message',
                name: 'systemMessage',
                type: 'string',
                default: defaultMessage,
                rows: 4,
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const model = nodeData.inputs?.model
        const memory = nodeData.inputs?.memory as BaseChatMemory
        const systemMessage = nodeData.inputs?.systemMessage as string
        const region = nodeData.inputs?.region as string
        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        let accessKeyId = getCredentialParam('awsKey', credentialData, nodeData)
        let secretAccessKey = getCredentialParam('awsSecret', credentialData, nodeData)

        /* console.log('init()')
        console.log(`sessionStorage: ${sessionStorage}`)

        if (accessKeyId === undefined) {
            accessKeyId = localStorage.getItem('awsAccessKey')
            secretAccessKey = localStorage.getItem('awsSecretAccessKey')
        } */

        let tools = [
            new DynamicTool({
                name: 'create-bucket',
                description:
                    'Call this to create a new S3 bucket. Input should be a string that specifies the name of the bucket to be created.',
                func: async (bucketName: string) => {
                    return new S3Operations(accessKeyId, secretAccessKey, region).createBucket(bucketName)
                }
            }),
            new DynamicTool({
                name: 'delete-bucket',
                description:
                    'Call this to delete an S3 bucket. Input should be a string that specifies the name of the bucket to be deleted.',
                func: async (bucketName: string) => {
                    return new S3Operations(accessKeyId, secretAccessKey, region).deleteBucket(bucketName)
                }
            }),
            new DynamicTool({
                name: 'list-buckets',
                description: 'Call this to list out all the S3 buckets. Return a numbered list.',
                func: async () => {
                    return new S3Operations(accessKeyId, secretAccessKey, region).listBuckets()
                }
            }),
            new DynamicTool({
                name: 'list-objects',
                description:
                    'Call this to list out all the objects of an S3 buckets. Input should be a string that specifies the name of the bucket whose objects are to be listed.',
                func: async (bucketName: string) => {
                    return new S3Operations(accessKeyId, secretAccessKey, region).listObjects(bucketName)
                }
            }),
            new DynamicTool({
                name: 'delete-an-object',
                description: 'Call this to delete an object from a given bucket. There should be two inputs objectnName and bucketName.',
                func: async (inputValues: string) => {
                    const inputValuesJson = JSON.parse(inputValues)
                    // console.log(inputValues);
                    // console.log(inputValuesJson);
                    // console.log(Object.keys(inputValuesJson));
                    const bucketName = inputValuesJson.bucketName
                    const objectName = inputValuesJson.objectName
                    return new S3Operations(accessKeyId, secretAccessKey, region).deleteObject(bucketName, objectName)
                }
            }),
            new DynamicTool({
                name: 'get-bucket-policy',
                description:
                    'Call this to get the policy for an Amazon S3 bucket. Input should be a string that specifies the name of the bucket.',
                func: async (bucketName: string) => {
                    return new S3Operations().getbucketPolicy(bucketName)
                }
            }),
            new DynamicTool({
                name: 'get-bucket-acl',
                description:
                    'Call this to get the ACL (Access Control List) of an S3 bucket. Input should be a string that specifies the name of the bucket.',
                func: async (bucketName: string) => {
                    new S3Operations().getBucketAcl(bucketName)
                    return ''
                }
            }),
            new DynamicTool({
                name: 'get-an-object',
                description: 'Call this to get an object from a given bucket. There should be two inputs objectnName and bucketName.',
                func: async (inputValues: string) => {
                    const inputValuesJson = JSON.parse(inputValues)
                    const bucketName = inputValuesJson.bucketName
                    const objectName = inputValuesJson.objectName
                    console.log(inputValuesJson)
                    return new S3Operations().getObject(bucketName, objectName)
                }
            }),
            new DynamicTool({
                name: 'get-bucket-size',
                description: 'Call this to get the size of an S3 buckets. Input should be a string that specifies the name of the bucket.',
                func: async (bucketName: string) => {
                    return new S3Operations().getBucketSize(bucketName)
                }
            })
        ]
        tools = flatten(tools)

        const executor = await initializeAgentExecutorWithOptions(tools, model, {
            agentType: 'zero-shot-react-description',
            verbose: /* process.env.DEBUG === 'true' ? true : false, */ true,
            agentArgs: {
                prefix: systemMessage ?? defaultMessage
            },
            returnIntermediateSteps: true
        })
        executor.memory = memory
        return executor
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const executor = nodeData.instance as AgentExecutor

        if (executor.memory) {
            ;(executor.memory as any).memoryKey = 'chat_history'
            ;(executor.memory as any).outputKey = 'output'
            const chatHistoryClassName = (executor.memory as any).chatHistory.constructor.name
            // Only replace when its In-Memory
            if (chatHistoryClassName && chatHistoryClassName === 'ChatMessageHistory') {
                ;(executor.memory as any).chatHistory = mapChatHistory(options)
            }
        }

        const loggerHandler = new ConsoleCallbackHandler(options.logger)
        const callbacks = await additionalCallbacks(nodeData, options)

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const result = await executor.call({ input }, [loggerHandler, handler, ...callbacks])
            return result?.output
        } else {
            const result = await executor.call({ input }, [loggerHandler, ...callbacks])
            return result?.output
        }
    }
}

module.exports = { nodeClass: S3OperationsAgent }
