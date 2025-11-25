import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import sharp from "sharp"

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'product' or 'logo'

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`.split('.')[0] + ".webp"

    try {
        const subDir = type === 'logo' ? 'logos' : 'products'
        const uploadDir = path.join(process.cwd(), "public/uploads", subDir)

        // Ensure directory exists
        try {
            await fs.access(uploadDir)
        } catch {
            await fs.mkdir(uploadDir, { recursive: true })
        }

        // Resize and save
        // Logos might need different sizing, but keeping 800x800 max is safe for now
        await sharp(buffer)
            .resize(800, 800, { fit: "inside", withoutEnlargement: true })
            .toFormat("webp")
            .toFile(path.join(uploadDir, filename))

        return NextResponse.json({ url: `/uploads/${subDir}/${filename}` })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
