export async function presignAsset(input: {
  orgId: string;
  gameId: string;
  kind: 'hero' | 'hero_thumb' | 'gallery';
  contentType: string;
}) {
  const res = await fetch('/api/v1/assets/presign', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await res.json().catch(() => null)) as unknown;

  // If S3 is not configured (503), signal the caller to use base64 fallback
  if (res.status === 503) {
    throw new Error('presign_unavailable');
  }

  if (!res.ok) {
    const err = typeof body === 'object' && body && 'message' in body ? String((body as { message?: unknown }).message) : null;
    throw new Error(err ?? 'presign_failed');
  }
  if (!body || typeof body !== 'object') throw new Error('presign_failed');
  const b = body as { uploadUrl?: unknown; assetUrl?: unknown };
  if (typeof b.uploadUrl !== 'string' || typeof b.assetUrl !== 'string') throw new Error('presign_failed');
  return { uploadUrl: b.uploadUrl, assetUrl: b.assetUrl };
}

export async function putFile(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'content-type': file.type,
    },
    body: file,
  });
  if (!res.ok) throw new Error('upload_failed');
}

/** Base64 fallback upload: stores image directly in database */
export async function uploadBase64(input: {
  orgId: string;
  gameId: string;
  kind: 'hero' | 'hero_thumb' | 'gallery';
  dataUrl: string;
}): Promise<string> {
  const res = await fetch('/api/v1/assets/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const err = typeof body === 'object' && body && 'message' in body ? String((body as { message?: unknown }).message) : null;
    throw new Error(err ?? 'upload_failed');
  }
  if (!body || typeof body !== 'object') throw new Error('upload_failed');
  const b = body as { assetUrl?: unknown };
  if (typeof b.assetUrl !== 'string') throw new Error('upload_failed');
  return b.assetUrl;
}
