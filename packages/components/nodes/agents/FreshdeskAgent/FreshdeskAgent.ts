import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { initializeAgentExecutorWithOptions, AgentExecutor } from 'langchain/agents'
import { getBaseClasses, mapChatHistory } from '../../../src/utils'
import { flatten } from 'lodash'
import { BaseChatMemory } from 'langchain/memory'
import { ConsoleCallbackHandler, CustomChainHandler, additionalCallbacks } from '../../../src/handler'
import { DynamicTool } from 'langchain/tools'
import { FreshdeskOperations } from './FreshdeskOperations.js'
import { getCredentialData, getCredentialParam } from '../../../src/utils'

const defaultMessage = `Do your best to answer the questions. Feel free to use any tools available to look up relevant information, only if necessary.`

class FreshdeskAgent_Agents implements INode {
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
        this.label = 'Freshdesk Agent'
        this.name = 'freshdeskAgent'
        this.version = 1.0
        this.type = 'AgentExecutor'
        this.category = 'Agents'
        this.icon = 'freshdesk.svg'
        // this.description = `An agent optimized for retrieval during conversation, answering questions based on past dialogue, all using OpenAI's Function Calling`
        this.description = `An agent optimized for performing Freshdesk operations using Freshdesk APIs.`
        this.baseClasses = [this.type, ...getBaseClasses(AgentExecutor)]
        this.credential = {
            label: 'Freshdesk Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['freshdesk']
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
        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        let freshdeskApiKey = getCredentialParam('freshdeskApiKey', credentialData, nodeData)
        let helpdeskDomainName = getCredentialParam('helpdeskDomainName', credentialData, nodeData)

        let tools = [
            new DynamicTool({
                name: 'list-all-tickets',
                description: 'Call this to list out all the Freshdesk tickets. Return a numbered list.',
                func: async () => {
                    return new FreshdeskOperations(freshdeskApiKey, helpdeskDomainName).listAllTickets()
                }
            }),
            new DynamicTool({
                name: 'create-ticket',
                description:
                    'Call this to create a new Freshdesk ticket. There must be following inputs, subject: a string, description: a string, email: a string, type: a string, priority: a number and status: a number.',
                func: async (inputValues: string) => {
                    return new FreshdeskOperations(freshdeskApiKey, helpdeskDomainName).createTicket(JSON.parse(inputValues))
                }
            }),
            new DynamicTool({
                name: 'view-ticket',
                description: 'Call this to get details of or show a ticket. Take ticketId (a number) as an input.',
                func: async (ticketId: string) => {
                    return new FreshdeskOperations(freshdeskApiKey, helpdeskDomainName).viewTicket(Number(ticketId))
                }
            }),
            new DynamicTool({
                name: 'delete-ticket',
                description: 'Call this to delete a ticket. Take ticketId (a number) as an input.',
                func: async (ticketId: string) => {
                    return new FreshdeskOperations(freshdeskApiKey, helpdeskDomainName).deleteTicket(Number(ticketId))
                }
            }),
            new DynamicTool({
                name: 'restore-ticket',
                description: 'Call this to restore a ticket. Take ticketId (a number) as an input.',
                func: async (ticketId: string) => {
                    return new FreshdeskOperations(freshdeskApiKey, helpdeskDomainName).restoreTicket(Number(ticketId))
                }
            }),
            new DynamicTool({
                name: 'get-associated-tickets',
                description:
                    'Call this to get or list associated tickets of a ticket. Take ticketId (a number) as an input. Return a numbered list.',
                func: async (ticketId: string) => {
                    return new FreshdeskOperations(freshdeskApiKey, helpdeskDomainName).getAssociatedTickets(Number(ticketId))
                }
            }),
            new DynamicTool({
                name: 'list-all-conversations',
                description:
                    'Call this to list all the conversations of or on a ticket. Take ticketId (a number) as an input. Return a numbered list.',
                func: async (ticketId: string) => {
                    return new FreshdeskOperations(freshdeskApiKey, helpdeskDomainName).listAllConversations(Number(ticketId))
                }
            }),
            new DynamicTool({
                name: 'delete-multiple-tickets',
                description: 'Call this to delete multiple tickets. Take a list of ticket ids as an input.',
                func: async (ticketIds: string) => {
                    return new FreshdeskOperations(freshdeskApiKey, helpdeskDomainName).deleteMultipleTickets(
                        ticketIds.replace('[', '').replace(']', '').split(',').map(Number)
                    )
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

module.exports = { nodeClass: FreshdeskAgent_Agents }
