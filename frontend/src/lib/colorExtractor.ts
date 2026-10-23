export interface ColorPalette {
  prominentColor: string;
  darkBaseBg: string;
  cardBg: string;
  cardBorder: string;
  cardBorderHover: string;
  glowTop: string;
  glowUnderCover: string;
  buttonBg: string;
  buttonHoverBg: string;
  buttonText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  highlightText: string;
}

// Convert HEX string to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 90, g: 132, b: 83 }; // Default to #5a8453
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
}

// Generate the complete palette from prominent color
export function generateThemePalette(color: string): ColorPalette {
  const { r, g, b } = hexToRgb(color);

  // Deep tinted dark background
  const darkR = Math.max(8, Math.round(r * 0.08));
  const darkG = Math.max(10, Math.round(g * 0.08));
  const darkB = Math.max(8, Math.round(b * 0.08));
  const darkBaseBg = `rgb(${darkR}, ${darkG}, ${darkB})`;

  // Card background with subtle tint and transparency
  const cardR = Math.max(16, Math.round(r * 0.14));
  const cardG = Math.max(20, Math.round(g * 0.14));
  const cardB = Math.max(16, Math.round(b * 0.14));
  const cardBg = `rgba(${cardR}, ${cardG}, ${cardB}, 0.72)`;

  // Bright button hover
  const hoverR = Math.min(255, Math.round(r * 1.15));
  const hoverG = Math.min(255, Math.round(g * 1.15));
  const hoverB = Math.min(255, Math.round(b * 1.15));
  const buttonHoverBg = `rgb(${hoverR}, ${hoverG}, ${hoverB})`;

  // Light text for badges and highlights
  const lightR = Math.min(255, Math.round(r * 1.4 + 40));
  const lightG = Math.min(255, Math.round(g * 1.4 + 40));
  const lightB = Math.min(255, Math.round(b * 1.4 + 40));
  const highlightText = `rgb(${lightR}, ${lightG}, ${lightB})`;

  return {
    prominentColor: color,
    darkBaseBg,
    cardBg,
    cardBorder: `rgba(${r}, ${g}, ${b}, 0.18)`,
    cardBorderHover: `rgba(${r}, ${g}, ${b}, 0.4)`,
    glowTop: `radial-gradient(ellipse 90% 65% at 50% -10%, rgba(${r}, ${g}, ${b}, 0.38) 0%, rgba(${r}, ${g}, ${b}, 0.12) 45%, transparent 75%)`,
    glowUnderCover: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.6) 0%, transparent 70%)`,
    buttonBg: color,
    buttonHoverBg,
    buttonText: '#ffffff',
    badgeBg: `rgba(${r}, ${g}, ${b}, 0.18)`,
    badgeText: highlightText,
    badgeBorder: `rgba(${r}, ${g}, ${b}, 0.32)`,
    highlightText,
  };
}

// Client-side prominent color extractor from image
export function extractProminentColorFromImage(
  imgUrl: string,
  onColorExtracted: (color: string) => void
) {
  if (typeof window === 'undefined' || !imgUrl) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imgUrl;

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 64;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size).data;
      let bestR = 0;
      let bestG = 0;
      let bestB = 0;
      let maxScore = -1;

      let avgR = 0, avgG = 0, avgB = 0, count = 0;

      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue;

        const brightness = (r + g + b) / 3;
        // Skip pure blacks or washed out pure whites
        if (brightness < 30 || brightness > 230) continue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        const saturation = max === 0 ? 0 : delta / max;

        // Score based on saturation and moderate brightness
        const score = saturation * (1 - Math.abs(brightness - 128) / 128);

        if (score > maxScore) {
          maxScore = score;
          bestR = r;
          bestG = g;
          bestB = b;
        }

        avgR += r;
        avgG += g;
        avgB += b;
        count++;
      }

      if (maxScore > 0.1) {
        onColorExtracted(rgbToHex(bestR, bestG, bestB));
      } else if (count > 0) {
        onColorExtracted(rgbToHex(avgR / count, avgG / count, avgB / count));
      }
    } catch (e) {
      // Cross-origin restriction: gracefully fallback
    }
  };
}

// Client-side dominant color extractor (finds the most frequent color in the image)
export function extractDominantColorFromImage(
  imgUrl: string,
  onColorExtracted: (color: string) => void
) {
  if (typeof window === 'undefined' || !imgUrl) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imgUrl;

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 64;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size).data;
      const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {};
      let maxCount = 0;
      let dominant = { r: 14, g: 22, b: 38 };

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue;

        // Group into buckets of 16 to cluster similar color tones
        const bucketR = Math.round(r / 16) * 16;
        const bucketG = Math.round(g / 16) * 16;
        const bucketB = Math.round(b / 16) * 16;
        const key = `${bucketR},${bucketG},${bucketB}`;

        if (!buckets[key]) {
          buckets[key] = { r: bucketR, g: bucketG, b: bucketB, count: 0 };
        }
        buckets[key].count++;

        if (buckets[key].count > maxCount) {
          maxCount = buckets[key].count;
          dominant = buckets[key];
        }
      }

      onColorExtracted(rgbToHex(dominant.r, dominant.g, dominant.b));
    } catch (e) {
      // Cross-origin fallback
    }
  };
}

