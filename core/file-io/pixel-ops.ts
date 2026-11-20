/**
 * Integer-pixel drawing and selection. No DOM, so sprite tools and tests share
 * one implementation. Photo brushes stay in raster-edit.ts.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface PixelImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface PixelBitmap {
  kind: "pixels";
  data: Uint8ClampedArray;
}

export function isPixelBitmap(value: unknown): value is PixelBitmap {
  return (
    !!value &&
    typeof value === "object" &&
    (value as PixelBitmap).kind === "pixels" &&
    (value as PixelBitmap).data instanceof Uint8ClampedArray
  );
}

export function createImage(width: number, height: number, fill?: RGBA): PixelImage {
  const data = new Uint8ClampedArray(width * height * 4);
  if (fill) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = fill.r;
      data[i + 1] = fill.g;
      data[i + 2] = fill.b;
      data[i + 3] = fill.a;
    }
  }
  return { width, height, data };
}

export function cloneImage(image: PixelImage): PixelImage {
  return { width: image.width, height: image.height, data: new Uint8ClampedArray(image.data) };
}

function index(image: PixelImage, x: number, y: number): number {
  return (y * image.width + x) * 4;
}

export function inBounds(image: PixelImage, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < image.width && y < image.height;
}

export function getPixel(image: PixelImage, x: number, y: number): RGBA | null {
  if (!inBounds(image, x, y)) return null;
  const i = index(image, x, y);
  return { r: image.data[i], g: image.data[i + 1], b: image.data[i + 2], a: image.data[i + 3] };
}

export function putPixel(image: PixelImage, x: number, y: number, color: RGBA, erase = false): void {
  if (!inBounds(image, x, y)) return;
  const i = index(image, x, y);
  if (erase) {
    image.data[i + 3] = 0;
    return;
  }
  image.data[i] = color.r;
  image.data[i + 1] = color.g;
  image.data[i + 2] = color.b;
  image.data[i + 3] = color.a;
}

function same(a: RGBA, b: RGBA): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

export function parseHex(hex: string): RGBA {
  const h = hex.replace("#", "");
  const n = h.length <= 3
    ? h.split("").map((c) => c + c).join("")
    : h.padEnd(8, "f");
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
    a: n.length >= 8 ? parseInt(n.slice(6, 8), 16) : 255,
  };
}

export function toHex(color: RGBA): string {
  const b = (n: number) => n.toString(16).padStart(2, "0");
  return `#${b(color.r)}${b(color.g)}${b(color.b)}${b(color.a)}`;
}

/** Plot every integer cell the pointer visits. One returned image = one stroke. */
export function strokePixels(
  image: PixelImage,
  points: { x: number; y: number }[],
  color: RGBA,
  erase = false,
): PixelImage {
  const out = cloneImage(image);
  let prev: { x: number; y: number } | null = null;
  for (const point of points) {
    const x = Math.floor(point.x);
    const y = Math.floor(point.y);
    if (prev) plotLine(out, prev.x, prev.y, x, y, color, erase);
    else putPixel(out, x, y, color, erase);
    prev = { x, y };
  }
  return out;
}

export function drawLine(
  image: PixelImage,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: RGBA,
  erase = false,
): PixelImage {
  const out = cloneImage(image);
  plotLine(out, Math.floor(x0), Math.floor(y0), Math.floor(x1), Math.floor(y1), color, erase);
  return out;
}

function plotLine(image: PixelImage, x0: number, y0: number, x1: number, y1: number, color: RGBA, erase: boolean): void {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  for (;;) {
    putPixel(image, x, y, color, erase);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

export function drawRect(
  image: PixelImage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGBA,
  filled = false,
): PixelImage {
  const out = cloneImage(image);
  const x0 = Math.floor(Math.min(x, x + width));
  const y0 = Math.floor(Math.min(y, y + height));
  const x1 = Math.floor(Math.max(x, x + width));
  const y1 = Math.floor(Math.max(y, y + height));
  if (filled) {
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) putPixel(out, px, py, color, false);
    }
    return out;
  }
  for (let px = x0; px <= x1; px++) {
    putPixel(out, px, y0, color, false);
    putPixel(out, px, y1, color, false);
  }
  for (let py = y0; py <= y1; py++) {
    putPixel(out, x0, py, color, false);
    putPixel(out, x1, py, color, false);
  }
  return out;
}

export function drawEllipse(
  image: PixelImage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGBA,
  filled = false,
): PixelImage {
  const out = cloneImage(image);
  const x0 = Math.floor(Math.min(x, x + width));
  const y0 = Math.floor(Math.min(y, y + height));
  const x1 = Math.floor(Math.max(x, x + width));
  const y1 = Math.floor(Math.max(y, y + height));
  const rx = Math.max(1, (x1 - x0) / 2);
  const ry = Math.max(1, (y1 - y0) / 2);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const nx = (px + 0.5 - cx) / rx;
      const ny = (py + 0.5 - cy) / ry;
      const d = nx * nx + ny * ny;
      const edge = d <= 1 && d >= 0.72;
      if (filled ? d <= 1 : edge) putPixel(out, px, py, color, false);
    }
  }
  return out;
}

export function floodFill(image: PixelImage, x: number, y: number, color: RGBA, contiguous = true): PixelImage {
  const out = cloneImage(image);
  const sx = Math.floor(x);
  const sy = Math.floor(y);
  const target = getPixel(image, sx, sy);
  if (!target || same(target, color)) return out;
  if (!contiguous) {
    for (let py = 0; py < image.height; py++) {
      for (let px = 0; px < image.width; px++) {
        const pixel = getPixel(image, px, py);
        if (pixel && same(pixel, target)) putPixel(out, px, py, color, false);
      }
    }
    return out;
  }
  const stack: { x: number; y: number }[] = [{ x: sx, y: sy }];
  const seen = new Uint8Array(image.width * image.height);
  while (stack.length) {
    const p = stack.pop()!;
    if (!inBounds(out, p.x, p.y)) continue;
    const at = p.y * image.width + p.x;
    if (seen[at]) continue;
    const pixel = getPixel(image, p.x, p.y);
    if (!pixel || !same(pixel, target)) continue;
    seen[at] = 1;
    putPixel(out, p.x, p.y, color, false);
    stack.push({ x: p.x + 1, y: p.y }, { x: p.x - 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x, y: p.y - 1 });
  }
  return out;
}

/** 0 = outside, 255 = selected. Hard edges only. */
export function rectMask(width: number, height: number, x: number, y: number, w: number, h: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  const x0 = Math.max(0, Math.floor(Math.min(x, x + w)));
  const y0 = Math.max(0, Math.floor(Math.min(y, y + h)));
  const x1 = Math.min(width - 1, Math.floor(Math.max(x, x + w)));
  const y1 = Math.min(height - 1, Math.floor(Math.max(y, y + h)));
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) mask[py * width + px] = 255;
  }
  return mask;
}

export function ellipseMask(width: number, height: number, x: number, y: number, w: number, h: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  const x0 = Math.floor(Math.min(x, x + w));
  const y0 = Math.floor(Math.min(y, y + h));
  const x1 = Math.floor(Math.max(x, x + w));
  const y1 = Math.floor(Math.max(y, y + h));
  const rx = Math.max(0.5, (x1 - x0) / 2);
  const ry = Math.max(0.5, (y1 - y0) / 2);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const nx = (px + 0.5 - cx) / rx;
      const ny = (py + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) mask[py * width + px] = 255;
    }
  }
  return mask;
}

export function lassoMask(width: number, height: number, points: { x: number; y: number }[]): Uint8Array {
  const mask = new Uint8Array(width * height);
  if (points.length < 3) return mask;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pointInPolygon(x + 0.5, y + 0.5, points)) mask[y * width + x] = 255;
    }
  }
  return mask;
}

function pointInPolygon(x: number, y: number, points: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Magic wand at tolerance 0: exact color match. Contiguous unless told otherwise. */
export function wandMask(image: PixelImage, x: number, y: number, contiguous = true): Uint8Array {
  const mask = new Uint8Array(image.width * image.height);
  const sx = Math.floor(x);
  const sy = Math.floor(y);
  const target = getPixel(image, sx, sy);
  if (!target) return mask;
  if (!contiguous) {
    for (let py = 0; py < image.height; py++) {
      for (let px = 0; px < image.width; px++) {
        const pixel = getPixel(image, px, py);
        if (pixel && same(pixel, target)) mask[py * image.width + px] = 255;
      }
    }
    return mask;
  }
  const stack = [{ x: sx, y: sy }];
  while (stack.length) {
    const p = stack.pop()!;
    if (!inBounds(image, p.x, p.y)) continue;
    const at = p.y * image.width + p.x;
    if (mask[at]) continue;
    const pixel = getPixel(image, p.x, p.y);
    if (!pixel || !same(pixel, target)) continue;
    mask[at] = 255;
    stack.push({ x: p.x + 1, y: p.y }, { x: p.x - 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x, y: p.y - 1 });
  }
  return mask;
}

export function pixelMaskBounds(mask: Uint8Array, width: number, height: number): { x: number; y: number; w: number; h: number } | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export function flipHorizontal(image: PixelImage, mask?: Uint8Array): PixelImage {
  return flip(image, mask, true);
}

export function flipVertical(image: PixelImage, mask?: Uint8Array): PixelImage {
  return flip(image, mask, false);
}

function flip(image: PixelImage, mask: Uint8Array | undefined, horizontal: boolean): PixelImage {
  const out = cloneImage(image);
  const bounds = mask ? pixelMaskBounds(mask, image.width, image.height) : { x: 0, y: 0, w: image.width, h: image.height };
  if (!bounds) return out;
  for (let y = bounds.y; y < bounds.y + bounds.h; y++) {
    for (let x = bounds.x; x < bounds.x + bounds.w; x++) {
      if (mask && !mask[y * image.width + x]) continue;
      const sx = horizontal ? bounds.x + (bounds.w - 1 - (x - bounds.x)) : x;
      const sy = horizontal ? y : bounds.y + (bounds.h - 1 - (y - bounds.y));
      const from = getPixel(image, sx, sy);
      if (from) putPixel(out, x, y, from, false);
    }
  }
  return out;
}

/** Clockwise quarter-turns of the whole image. 2 turns is 180°. */
export function rotateImage(image: PixelImage, turns: 1 | 2 | 3): PixelImage {
  let current = image;
  for (let n = 0; n < turns; n++) current = rotate90(current);
  return current;
}

function rotate90(image: PixelImage): PixelImage {
  const out = createImage(image.height, image.width);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const pixel = getPixel(image, x, y)!;
      putPixel(out, image.height - 1 - y, x, pixel, false);
    }
  }
  return out;
}

/** Slide selected pixels (or the whole image) by whole pixels. */
export function movePixels(image: PixelImage, dx: number, dy: number, mask?: Uint8Array): PixelImage {
  const out = cloneImage(image);
  const ix = Math.round(dx);
  const iy = Math.round(dy);
  if (ix === 0 && iy === 0) return out;
  if (!mask) {
    out.data.fill(0);
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const pixel = getPixel(image, x, y);
        if (pixel && pixel.a) putPixel(out, x + ix, y + iy, pixel, false);
      }
    }
    return out;
  }
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (mask[y * image.width + x]) putPixel(out, x, y, { r: 0, g: 0, b: 0, a: 0 }, true);
    }
  }
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (!mask[y * image.width + x]) continue;
      const pixel = getPixel(image, x, y);
      if (pixel) putPixel(out, x + ix, y + iy, pixel, false);
    }
  }
  return out;
}
