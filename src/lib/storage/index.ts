import { randomUUID } from 'crypto';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  if (!ALLOWED_TYPES[contentType]) {
    throw new Error(`Invalid content type: ${contentType}. Only jpg, png, webp allowed.`);
  }
  if (file.length > MAX_SIZE) {
    throw new Error(`File too large: ${file.length} bytes. Max 5MB.`);
  }

  await mkdir(UPLOADS_DIR, { recursive: true });

  // Sanitize original filename
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${randomUUID()}-${safeName}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  await writeFile(filePath, file);

  return `/api/v1/uploads/${uniqueName}`;
}

export async function deleteFile(url: string): Promise<void> {
  const prefix = '/api/v1/uploads/';
  if (!url.startsWith(prefix)) return;

  const filename = url.slice(prefix.length);
  // Prevent directory traversal
  if (filename.includes('..') || filename.includes('/')) return;

  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    await unlink(filePath);
  } catch {
    // File may already be deleted
  }
}

export function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase().slice(1);
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return map[ext] || 'application/octet-stream';
}
