"use client";

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ছবি লোড ব্যর্থ"));
    img.src = src;
  });
}

const MAX_EXPORT_BYTES = 6.5 * 1024 * 1024;

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  startQuality: number
): Promise<Blob> {
  let quality = startQuality;
  for (let i = 0; i < 7; i++) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, type === "image/jpeg" ? quality : undefined)
    );
    if (!blob) throw new Error("এক্সপোর্ট ব্যর্থ");
    if (type === "image/png" || blob.size <= MAX_EXPORT_BYTES) return blob;
    quality *= 0.78;
  }
  throw new Error("ছবিটি অনেক বড় — আরও ছোট অংশ ক্রপ করুন");
}

/** Crop + downscale on the client so uploads stay far below any payload limit */
export async function cropImageToBlob(
  src: string,
  crop: PixelCrop,
  opts: { maxDim?: number; forcePng?: boolean } = {}
): Promise<Blob> {
  const img = await loadImage(src);
  const maxDim = opts.maxDim ?? 1800;
  const scale = Math.min(1, maxDim / Math.max(crop.width, crop.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width * scale));
  canvas.height = Math.max(1, Math.round(crop.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ক্যানভাস সমর্থিত নয়");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const type = opts.forcePng ? "image/png" : "image/jpeg";
  return canvasToBlob(canvas, type, 0.87);
}

/** Downscale an image that is uploaded without cropping (keeps originals under payload limits) */
export async function compressImage(file: File, maxDim = 2000): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale >= 1 && file.size <= MAX_EXPORT_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    return canvasToBlob(canvas, type, 0.87);
  } finally {
    URL.revokeObjectURL(url);
  }
}
