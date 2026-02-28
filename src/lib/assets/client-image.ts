async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error('file_read_failed'));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

async function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('image_decode_failed'));
    i.src = dataUrl;
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) return reject(new Error('encode_failed'));
        resolve(b);
      },
      mime,
      quality
    );
  });
}

export async function fileToOptimizedImage(
  file: File,
  opts?: {
    maxWidth?: number;
    webpQuality?: number;
    jpegQuality?: number;
    preferWebp?: boolean;
  }
) {
  const maxWidth = opts?.maxWidth ?? 1600;
  const webpQuality = opts?.webpQuality ?? 0.78;
  const jpegQuality = opts?.jpegQuality ?? 0.82;
  const preferWebp = opts?.preferWebp ?? true;

  if (!file.type.startsWith('image/')) throw new Error('not_an_image');

  const dataUrl = await fileToDataUrl(file);
  const img = await dataUrlToImage(dataUrl);

  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unsupported');
  ctx.drawImage(img, 0, 0, w, h);

  // Try WebP first (best compression), then fall back to JPEG for older Safari/iOS.
  if (preferWebp) {
    try {
      const webpBlob = await canvasToBlob(canvas, 'image/webp', webpQuality);
      const out = new File([webpBlob], file.name.replace(/\.[a-z0-9]+$/i, '') + '.webp', { type: 'image/webp' });
      return out;
    } catch {
      // fall through
    }
  }

  const jpgBlob = await canvasToBlob(canvas, 'image/jpeg', jpegQuality);
  const out = new File([jpgBlob], file.name.replace(/\.[a-z0-9]+$/i, '') + '.jpg', { type: 'image/jpeg' });
  return out;
}
