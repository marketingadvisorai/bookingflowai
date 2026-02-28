import { NextRequest, NextResponse } from 'next/server';
import { createHmac, createHash, randomBytes } from 'crypto';

const BUCKET = process.env.BF_ASSETS_BUCKET || process.env.BF_S3_BUCKET || 'bookingflow-assets-044707325473';
const REGION = process.env.BF_S3_REGION || 'us-east-1';
const CDN = process.env.BF_ASSETS_CDN_BASE_URL || process.env.BF_ASSET_CDN || 'https://d2t6gew0oormhm.cloudfront.net';

const VALID_KINDS = new Set(['hero', 'hero_thumb', 'gallery']);

function extFromContentType(ct: string): string {
  const map: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  return map[ct] || 'bin';
}

/** Generate AWS Signature V4 presigned URL without SDK */
function presignPutUrl(opts: {
  bucket: string;
  key: string;
  region: string;
  contentType: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresIn?: number;
}): string {
  const { bucket, key, region, contentType, accessKeyId, secretAccessKey, expiresIn = 300 } = opts;
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
  const amzDate = dateStamp + 'T' + now.toISOString().replace(/[-:]/g, '').slice(9, 15) + 'Z';
  const scope = `${dateStamp}/${region}/s3/aws4_request`;

  const queryParams = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresIn),
    'X-Amz-SignedHeaders': 'content-type;host',
  });

  // Canonical request
  const canonicalUri = '/' + key;
  const canonicalQueryString = queryParams.toString().split('&').sort().join('&');
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  const payloadHash = 'UNSIGNED-PAYLOAD';

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  // String to sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  // Signing key
  const kDate = createHmac('sha256', 'AWS4' + secretAccessKey).update(dateStamp).digest();
  const kRegion = createHmac('sha256', kDate).update(region).digest();
  const kService = createHmac('sha256', kRegion).update('s3').digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();

  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, gameId, kind, contentType } = body as {
      orgId?: string;
      gameId?: string;
      kind?: string;
      contentType?: string;
    };

    if (!orgId || !gameId || !kind || !contentType) {
      return NextResponse.json({ message: 'Missing required fields: orgId, gameId, kind, contentType' }, { status: 400 });
    }

    if (!VALID_KINDS.has(kind)) {
      return NextResponse.json({ message: `Invalid kind: ${kind}. Must be hero, hero_thumb, or gallery` }, { status: 400 });
    }

    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ message: 'contentType must be image/*' }, { status: 400 });
    }

    const accessKeyId = process.env.BF_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.BF_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      // Fallback: return a data-upload URL so the client can use the base64 upload endpoint instead
      console.warn('Presign: S3 credentials not set, returning base64 upload fallback');
      return NextResponse.json({ message: 'S3 credentials not configured. Use /api/v1/assets/upload for base64 upload.' }, { status: 503 });
    }

    const ext = extFromContentType(contentType);
    const randomId = randomBytes(8).toString('hex');
    const key = `prod/orgs/${orgId}/games/${gameId}/${kind}/${Date.now()}-${randomId}.${ext}`;

    const uploadUrl = presignPutUrl({
      bucket: BUCKET,
      key,
      region: REGION,
      contentType,
      accessKeyId,
      secretAccessKey,
    });

    const assetUrl = `${CDN}/${key}`;

    return NextResponse.json({ uploadUrl, assetUrl });
  } catch (err) {
    console.error('Presign error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
