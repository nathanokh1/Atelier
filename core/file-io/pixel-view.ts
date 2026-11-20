/** Sprite zoom is a whole multiple of 100% so every pixel is the same number of screen pixels. 18 is 1800%. */
export const SPRITE_ZOOM_MIN = 1;
export const SPRITE_ZOOM_MAX = 32;

export function stepSpriteZoom(zoom: number, direction: 1 | -1): number {
  const current = Math.max(SPRITE_ZOOM_MIN, Math.min(SPRITE_ZOOM_MAX, Math.round(zoom)));
  return Math.max(SPRITE_ZOOM_MIN, Math.min(SPRITE_ZOOM_MAX, current + direction));
}

/** Largest whole-step zoom that still fits. */
export function fitSpriteZoom(continuous: number): number {
  if (!Number.isFinite(continuous)) return SPRITE_ZOOM_MIN;
  return Math.max(SPRITE_ZOOM_MIN, Math.min(SPRITE_ZOOM_MAX, Math.floor(continuous)));
}

/** Pixel grid lines are only drawn once each pixel is several screen pixels wide. */
export function showPixelGrid(zoom: number, enabled: boolean): boolean {
  return enabled && zoom >= 4;
}

export function pixelGridLines(width: number, height: number): { vertical: number[]; horizontal: number[] } {
  const vertical: number[] = [];
  const horizontal: number[] = [];
  for (let x = 0; x <= width; x++) vertical.push(x);
  for (let y = 0; y <= height; y++) horizontal.push(y);
  return { vertical, horizontal };
}

export function cellGridLines(
  width: number,
  height: number,
  cellWidth: number,
  cellHeight: number,
  offsetX: number,
  offsetY: number,
): { vertical: number[]; horizontal: number[] } {
  const cw = Math.max(1, Math.round(cellWidth));
  const ch = Math.max(1, Math.round(cellHeight));
  const vertical: number[] = [];
  const horizontal: number[] = [];
  const startX = ((Math.round(offsetX) % cw) + cw) % cw;
  const startY = ((Math.round(offsetY) % ch) + ch) % ch;
  for (let x = startX; x <= width; x += cw) vertical.push(x);
  for (let y = startY; y <= height; y += ch) horizontal.push(y);
  return { vertical, horizontal };
}
