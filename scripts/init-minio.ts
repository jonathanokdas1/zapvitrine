import { CreateBucketCommand, ListBucketsCommand, PutBucketPolicyCommand, S3Client } from "@aws-sdk/client-s3"
import dotenv from "dotenv"

dotenv.config()

const s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
    },
    forcePathStyle: true,
})

const BUCKET_NAME = process.env.S3_BUCKET || "zap-uploads"

async function init() {
    try {
        console.log("Checking MinIO connection...")
        const { Buckets } = await s3Client.send(new ListBucketsCommand({}))

        const exists = Buckets?.some(b => b.Name === BUCKET_NAME)

        if (exists) {
            console.log(`Bucket '${BUCKET_NAME}' already exists.`)
        } else {
            console.log(`Creating bucket '${BUCKET_NAME}'...`)
            await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }))
            console.log(`Bucket '${BUCKET_NAME}' created successfully.`)
        }

        // Set public policy
        console.log("Setting public read policy...")
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "PublicReadGetObject",
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
                }
            ]
        }

        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(policy)
        }))
        console.log("Public read policy set.")

    } catch (error) {
        console.error("Error initializing MinIO:", error)
    }
}

init()
