import { Queue } from "bullmq"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

// Parse Redis URL to connection options if needed, or pass URL directly if supported (BullMQ usually takes connection object)
// ioredis handles redis:// URLs automatically in the connection object
const connection = {
    url: redisUrl
}

export const emailQueue = new Queue("email-queue", {
    connection: {
        url: redisUrl
    }
})
