import {
    CreateBucketCommand,
    DeleteBucketCommand,
    DeleteObjectCommand,
    GetBucketAclCommand,
    GetBucketPolicyCommand,
    GetObjectCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
    S3Client
} from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'

dotenv.config()

export class S3Operations {
    awsAccessKeyId
    awsSecretAccessKey
    awsRegion
    client: S3Client

    constructor(awsAccessKeyId?: any, awsSecretAccessKey?: any, awsRegion?: any) {
        this.awsAccessKeyId = awsAccessKeyId
        this.awsSecretAccessKey = awsSecretAccessKey
        this.awsRegion = awsRegion
        this.client = new S3Client({
            region: this.awsRegion,
            credentials: {
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            }
        })
    }

    // Create a new bucket.
    async createBucket(bucketName: string) {
        const command = new CreateBucketCommand({
            Bucket: bucketName
        })

        try {
            const { Location } = await this.client.send(command)
            console.log(`Bucket created with location ${Location}.`)
            return `Bucket created with location ${Location}.`
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Delete a bucket.
    async deleteBucket(bucketName: string) {
        const command = new DeleteBucketCommand({
            Bucket: bucketName
        })

        try {
            const response = await this.client.send(command)
            console.log(response)
            return `${bucketName} successfully deleted.`
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // List buckets.
    async listBuckets() {
        const command = new ListBucketsCommand({})

        try {
            const { Owner, Buckets } = await this.client.send(command)
            if (Owner && Buckets) {
                console.log(`${Owner.DisplayName} owns ${Buckets.length} bucket${Buckets.length === 1 ? '' : 's'}:`)
                console.log(Buckets.map((b: any) => b.Name))
                // return JSON.stringify(Buckets.map((b: any) => ` ${b.Name}`).join('\n'))
                return JSON.stringify(Buckets.map((b: any) => b.Name))
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // List objects.
    async listObjects(bucketName: string) {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            // The default and maximum number of keys returned is 1000. This limits it to
            // one for demonstration purposes.
            MaxKeys: 500
        })

        try {
            let isTruncated: any | undefined = true

            console.log(`The bucket ${bucketName} contains the following objects:\n`)
            let contents = ''

            while (isTruncated) {
                const { Contents, IsTruncated, NextContinuationToken } = await this.client.send(command)
                const contentsList = Contents?.map((c: any) => ` • ${c.Key}`).join('\n')
                contents += contentsList + '\n'
                isTruncated = IsTruncated
                command.input.ContinuationToken = NextContinuationToken
            }
            console.log(contents)
            return contents
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Delete an object.
    async deleteObject(bucketName: string, objectName: string) {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectName
        })

        try {
            const response = await this.client.send(command)
            console.log(response)
            return `The object '${objectName}' has been successfully deleted from the '${bucketName}' S3 bucket.`
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get the policy for an Amazon S3 bucket.
    async getbucketPolicy(bucketName: string) {
        const command = new GetBucketPolicyCommand({
            Bucket: bucketName
        })
        try {
            const { Policy }: any = await this.client.send(command)
            console.log(JSON.parse(Policy))
            return JSON.parse(Policy)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get the ACL of a bucket.
    async getBucketAcl(bucketName: string) {
        const command = new GetBucketAclCommand({
            Bucket: bucketName
        })

        try {
            const response = await this.client.send(command)
            console.log(response)
            return response
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get an object from a bucket.
    async getObject(bucketName: string, objectName: string) {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectName
        })

        try {
            const response: any = await this.client.send(command)
            // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
            const str = await response.Body.transformToString()
            console.log(str)
            return str
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get size of a bucket.
    async getBucketSize(bucketName: string) {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            // The default and maximum number of keys returned is 1000. This limits it to
            // one for demonstration purposes.
            MaxKeys: 1000
        })

        try {
            let isTruncated: any | undefined = true

            let sizeInBytes: number = 0

            while (isTruncated) {
                const { Contents, IsTruncated, NextContinuationToken } = await this.client.send(command)
                sizeInBytes += Contents?.map((c: any) => c.Size).reduce((sum, ele) => {
                    return sum + ele
                }, 0)
                isTruncated = IsTruncated
                command.input.ContinuationToken = NextContinuationToken
            }

            if (sizeInBytes >= 1024) {
                const sizeInKilobytes = sizeInBytes / 1024

                if (sizeInKilobytes >= 1024) {
                    const sizeInMegabytes = sizeInKilobytes / 1024

                    if (sizeInMegabytes >= 1024) {
                        const sizeInGigabytes = sizeInMegabytes / 1024

                        console.log(`Size of the bucket ${bucketName}: ${sizeInGigabytes.toFixed(2)} GB`)
                        return `Size of the bucket ${bucketName}: ${sizeInGigabytes.toFixed(2)} GB`
                    } else {
                        console.log(`Size of the bucket ${bucketName}: ${sizeInMegabytes.toFixed(2)} MB`)
                        return `Size of the bucket ${bucketName}: ${sizeInMegabytes.toFixed(2)} MB`
                    }
                } else {
                    console.log(`Size of the bucket ${bucketName}: ${sizeInKilobytes.toFixed(2)} KB`)
                    return `Size of the bucket ${bucketName}: ${sizeInKilobytes.toFixed(2)} KB`
                }
            } else {
                console.log(`Size of the bucket ${bucketName}: ${sizeInBytes} B`)
                return `Size of the bucket ${bucketName}: ${sizeInBytes} B`
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }
}

export const main = async () => {
    // new S3Operations().createBucket("aws-sdk-s3-bucket-test");
    // new S3Operations().listBuckets();
    // new S3Operations().listObjects("mlangles");
    // new S3Operations().deleteBucket("aws-sdk-s3-bucket-test");
}

// await main();
