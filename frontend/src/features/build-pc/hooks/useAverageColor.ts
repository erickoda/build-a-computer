import { useEffect, useRef, useState } from 'react';
import { Game } from '../types/game';

// ─── useAverageColor ──────────────────────────────────────────────────────────
// Samples the bottom strip of each selected game's banner, averages the RGB
// values weighted equally per panel, and returns a bg color + contrasting text.
// Falls back to transparent/white while loading or when no games are selected.

export type AverageColor = { bg: string; text: 'white' | 'black' };

function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Takes game IDs (stable state primitives, not derived objects) so the effect
// dependency never produces a new reference on every render. `gamesById` is
// read inside the effect via closure rather than being a dependency, since by
// the time a game is selectable it has already been resolved from the fetch.
export function useAverageColor(
  gameIds: string[],
  gamesById: Map<string, Game>,
): AverageColor {
  const [color, setColor] = useState<AverageColor>({
    bg: 'transparent',
    text: 'white',
  });
  const cacheRef = useRef<Map<string, [number, number, number]>>(new Map());

  // Stable string key — only changes when the actual selection changes.
  // Using this as the effect dependency avoids the infinite-loop caused by
  // depending on a derived Game[] array (new reference every render).
  const idsKey = gameIds.join(',');

  useEffect(() => {
    // No games selected — skip async work entirely.
    // Do NOT call setColor here synchronously; instead let the async path
    // handle the empty case so React never sees a setState in the effect body.
    if (idsKey === '') {
      // Schedule the reset after the current render cycle to avoid the
      // "setState synchronously within an effect" warning.
      const id = setTimeout(() => {
        setColor({ bg: 'transparent', text: 'white' });
      }, 0);
      return () => clearTimeout(id);
    }

    let cancelled = false;

    async function sample() {
      const ids = idsKey.split(',');
      const gameList = ids
        .map((id) => gamesById.get(id))
        .filter(Boolean) as Game[];
      if (gameList.length === 0) return;

      const SAMPLE_W = 64,
        SAMPLE_H = 1;
      const canvas = document.createElement('canvas');
      canvas.width = SAMPLE_W;
      canvas.height = SAMPLE_H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      let totalR = 0,
        totalG = 0,
        totalB = 0,
        totalWeight = 0;
      const w = 1 / gameList.length;

      await Promise.all(
        gameList.map(async (game) => {
          const url = game.bannerUrl;
          if (!url) return;
          if (cacheRef.current.has(url)) {
            const [r, g, b] = cacheRef.current.get(url)!;
            totalR += r * w;
            totalG += g * w;
            totalB += b * w;
            totalWeight += w;
            return;
          }
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const srcY = Math.floor(img.naturalHeight * 0.75);
              const srcH = Math.max(1, Math.floor(img.naturalHeight * 0.05));
              ctx.clearRect(0, 0, SAMPLE_W, SAMPLE_H);
              ctx.drawImage(
                img,
                0,
                srcY,
                img.naturalWidth,
                srcH,
                0,
                0,
                SAMPLE_W,
                SAMPLE_H,
              );
              const px = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;
              let r = 0,
                g = 0,
                b = 0;
              const n = SAMPLE_W * SAMPLE_H;
              for (let i = 0; i < px.length; i += 4) {
                r += px[i];
                g += px[i + 1];
                b += px[i + 2];
              }
              r = Math.round(r / n);
              g = Math.round(g / n);
              b = Math.round(b / n);
              cacheRef.current.set(url, [r, g, b]);
              totalR += r * w;
              totalG += g * w;
              totalB += b * w;
              totalWeight += w;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = url;
          });
        }),
      );

      if (cancelled || totalWeight === 0) return;

      const blend = 0.55;
      const fr = Math.round((totalR / totalWeight) * blend);
      const fg = Math.round((totalG / totalWeight) * blend);
      const fb = Math.round((totalB / totalWeight) * blend);
      const lum = luminance(fr, fg, fb);
      setColor({
        bg: `rgb(${fr},${fg},${fb})`,
        text: lum > 0.35 ? 'black' : 'white',
      });
    }

    sample();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]); // stable string — no new reference on every render

  return color;
}
