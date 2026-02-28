'use client';

import { useCallback, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload01Icon } from '@hugeicons/core-free-icons';
import { fileToOptimizedImage } from '@/lib/assets/client-image';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const GUIDANCE: Record<string, string> = {
  hero: 'Recommended: 1200×800px, JPG/PNG/WebP, max 5MB',
  hero_thumb: 'Recommended: 400×300px, used as preview thumbnail',
  gallery: 'Recommended: 1200×800px, max 3 images',
};

export function ImageUpload({
  orgId,
  gameId,
  kind,
  onUploaded,
}: {
  orgId: string;
  gameId: string;
  kind: 'hero' | 'hero_thumb' | 'gallery';
  onUploaded: (assetUrl: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxBytes = 5 * 1024 * 1024;

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setPreview(null);
    setSizeInfo(null);

    if (!f.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (f.size > maxBytes) {
      setError('Image too large (max 5 MB).');
      return;
    }

    setPending(true);
    try {
      const optimized = await fileToOptimizedImage(f, {
        maxWidth: 1600,
        webpQuality: 0.78,
        jpegQuality: 0.82,
        preferWebp: true,
      });

      if (optimized.size > maxBytes) {
        setError('Converted image still too large. Try a smaller image.');
        return;
      }

      // Upload to local storage
      const formData = new FormData();
      formData.append('file', optimized);
      const res = await fetch('/api/v1/uploads', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error((body as { error?: string })?.error || 'Upload failed');
      }
      const { url: assetUrl, originalSize, optimizedSize } = (await res.json()) as {
        url: string;
        originalSize?: number;
        optimizedSize?: number;
      };
      setPreview(assetUrl);
      if (optimizedSize != null && originalSize != null && originalSize !== optimizedSize) {
        setSizeInfo(`Uploaded: ${formatBytes(optimizedSize)} (optimized from ${formatBytes(originalSize)})`);
      } else if (optimizedSize != null) {
        setSizeInfo(`Uploaded: ${formatBytes(optimizedSize)}`);
      }
      onUploaded(assetUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setPending(false);
    }
  }, [orgId, gameId, kind, onUploaded, maxBytes]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    e.target.value = '';
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  const label =
    kind === 'hero'
      ? 'hero image'
      : kind === 'hero_thumb'
        ? 'hero thumbnail'
        : 'gallery image';

  if (preview) {
    return (
      <div className="grid gap-1">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Uploaded" className="h-full w-full object-cover" />
          </div>
          <div className="grid gap-0.5">
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setSizeInfo(null);
                inputRef.current?.click();
              }}
              className="text-xs font-medium text-[#FF4F00] hover:underline"
            >
              Replace
            </button>
            {sizeInfo && (
              <span className="text-[10px] text-[#201515]/50">{sizeInfo}</span>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onPick}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onPick}
        className="hidden"
        disabled={pending}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        disabled={pending}
        className={
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors ' +
          (dragOver
            ? 'border-[#FF4F00] bg-[#FF4F00]/5'
            : 'border-gray-300 bg-[#FFFDF9] hover:border-[#FF4F00]/50') +
          (pending ? ' pointer-events-none opacity-60' : ' cursor-pointer')
        }
      >
        {pending ? (
          <>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#FF4F00]" />
            <span className="text-xs font-medium text-[#201515]">Optimizing & uploading...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Upload01Icon} size={28} strokeWidth={1.8} className="text-[#FF4F00]" />
            <span className="text-xs font-medium text-[#201515]">
              Drop {label} here or tap to browse
            </span>
            <span className="text-[10px] text-[#201515]/50">
              Max 5 MB · JPG, PNG, WebP, or AVIF
            </span>
          </>
        )}
      </button>

      <p className="text-[10px] text-[#201515]/40">{GUIDANCE[kind]}</p>

      {sizeInfo && (
        <p className="text-[10px] font-medium text-emerald-600">{sizeInfo}</p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
