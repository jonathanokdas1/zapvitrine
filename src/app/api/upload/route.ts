import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { s3Client, BUCKET_NAME } from "@/lib/storage"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'product' or 'logo'

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    // Create a unique filename
    const extension = "webp"
    const filename = `${uuidv4()}.${extension}`
    const subDir = type === 'logo' ? 'logos' : 'products'
    const key = `${subDir}/${filename}`

    try {
        // Resize and convert to buffer
        const processedBuffer = await sharp(buffer)
            .resize(800, 800, { fit: "inside", withoutEnlargement: true })
            .toFormat(extension)
            .toBuffer()

        // Upload to S3/MinIO
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: processedBuffer,
            ContentType: `image/${extension}`,
            // ACL: "public-read" // Not always needed depending on bucket policy, but good for public files if supported
        }))

        // Return the full URL
        // In production this would be the CDN URL or S3 URL
        // For MinIO local: http://localhost:9000/bucket/key
        const endpoint = process.env.S3_ENDPOINT || "http://localhost:9000"
        const url = `${endpoint}/${BUCKET_NAME}/${key}`

        return NextResponse.json({ url })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
