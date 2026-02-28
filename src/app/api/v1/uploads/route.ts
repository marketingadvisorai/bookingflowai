import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { requireSession } from '@/lib/auth/require-session';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_SIZE = 5 * 1024 * 1024;

async function optimizeImage(buffer: Buffer): Promise<{ optimized: Buffer; contentType: string; ext: string }> {
  try {
    const sharp = (await import('sharp')).default;
    const optimized = await sharp(buffer)
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    return { optimized, contentType: 'image/webp', ext: 'webp' };
  } catch (err) {
    console.warn('sharp optimization failed, saving original:', err);
    return { optimized: buffer, contentType: 'image/webp', ext: 'webp' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth; // 401
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only jpg, png, webp, avif allowed.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 5MB.' },
        { status: 400 },
      );
    }

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const originalSize = originalBuffer.length;

    const { optimized, contentType } = await optimizeImage(originalBuffer);
    const optimizedName = file.name.replace(/\.[a-z0-9]+$/i, '') + '.webp';
    const url = await uploadFile(optimized, optimizedName, contentType);

    return NextResponse.json({ url, originalSize, optimizedSize: optimized.length });
  } catch (err) {
    console.error('Upload error:', err);
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json(
      { error: `Upload failed: ${msg}` },
      { status: 500 },
    );
  }
}
