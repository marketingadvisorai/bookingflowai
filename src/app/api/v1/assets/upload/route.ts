import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * Base64 image upload fallback for when S3 presigned URLs aren't available.
 * Stores image data URL directly on the game record.
 * Limited to ~400KB images (file size limit).
 */

const MAX_BYTES = 400 * 1024; // 400KB database limit safety margin

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, gameId, kind, dataUrl } = body as {
      orgId?: string;
      gameId?: string;
      kind?: string;
      dataUrl?: string;
    };

    if (!orgId || !gameId || !kind || !dataUrl) {
      return NextResponse.json({ ok: false, error: 'missing_fields', message: 'Missing required fields.' }, { status: 400 });
    }

    if (!['hero', 'hero_thumb', 'gallery'].includes(kind)) {
      return NextResponse.json({ ok: false, error: 'invalid_kind', message: 'Invalid image kind.' }, { status: 400 });
    }

    if (!dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ ok: false, error: 'invalid_data', message: 'Must be a data:image/ URL.' }, { status: 400 });
    }

    // Check size (rough estimate: base64 is ~4/3 of binary)
    if (dataUrl.length > MAX_BYTES * 1.4) {
      return NextResponse.json({ ok: false, error: 'too_large', message: 'Image is too large. Please use a smaller image (under 300KB).' }, { status: 400 });
    }

    const db = getDb();
    const game = await db.getGame(orgId, gameId);
    if (!game) {
      return NextResponse.json({ ok: false, error: 'game_not_found', message: 'Game not found.' }, { status: 404 });
    }

    // Store the data URL directly on the game record
    if (kind === 'hero') {
      game.heroImageUrl = dataUrl;
    } else if (kind === 'hero_thumb') {
      game.heroImageThumbUrl = dataUrl;
    } else if (kind === 'gallery') {
      if (!game.galleryImageUrls) game.galleryImageUrls = [];
      game.galleryImageUrls.push(dataUrl);
    }

    await db.putGame(orgId, game);

    return NextResponse.json({ ok: true, assetUrl: dataUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ ok: false, error: 'server_error', message: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
