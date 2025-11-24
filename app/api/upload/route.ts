import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${crypto.randomUUID()}.webp`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // ignore
    }

    const filepath = path.join(uploadDir, filename);

    await sharp(buffer)
        .resize(800) // Resize to 800px width
        .webp({ quality: 80 }) // Convert to WebP, Quality 80
        .toFile(filepath);

    return NextResponse.json({ url: `/uploads/${filename}` });
}
