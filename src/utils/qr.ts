import QRCode from 'qrcode';
import type {
  CornerDotStyle,
  CornerStyle,
  DotStyle,
  ErrorCorrectionLevel,
  QrConfig,
  QrMetrics,
} from '../types/qr';

const HEX_COLOR_RE = /^#([0-9a-fA-F]{6})$/;

export const DEFAULT_QR_CONFIG: QrConfig = {
  url: 'https://github.com',
  errorCorrection: 'M',
  fgColor: '#0F172A',
  fgGradientEnabled: false,
  fgGradientColor: '#2563EB',
  fgGradientDirection: 'diagonal',
  bgColor: '#FFFFFF',
  dotStyle: 'square',
  cornerStyle: 'square',
  cornerDotStyle: 'square',
  customCornerColorEnabled: false,
  cornerColor: '#1D4ED8',
  margin: 3,
  resolution: 1024,
  centerMode: 'none',
  centerText: 'SCAN',
  centerTextColor: '#FFFFFF',
  centerTextBgColor: '#0F172A',
  logoDataUrl: null,
  logoScale: 0.2,
  letterArtEnabled: false,
  letterArtText: 'QR',
  letterArtColor: '#2563EB',
  caption: '',
  showCaption: false,
};

export function normalizeUrlInput(raw: string): {
  normalizedUrl: string;
  isValidUrl: boolean;
  validationError: string | null;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      normalizedUrl: '',
      isValidUrl: false,
      validationError: 'Enter a website link or URL to generate a QR code.',
    };
  }

  const hasExplicitScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
  const candidate = hasExplicitScheme ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
        return {
          normalizedUrl: candidate,
          isValidUrl: false,
          validationError: 'Enter a complete domain such as https://example.com.',
        };
      }
    }
    return {
      normalizedUrl: candidate,
      isValidUrl: true,
      validationError: null,
    };
  } catch {
    return {
      normalizedUrl: trimmed,
      isValidUrl: false,
      validationError: 'That does not look like a valid URL.',
    };
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = HEX_COLOR_RE.test(hex) ? hex : '#000000';
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminance(hexToRgb(fgHex));
  const l2 = relativeLuminance(hexToRgb(bgHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getEffectiveErrorLevel(config: QrConfig): ErrorCorrectionLevel {
  const hasCenterOverlay =
    (config.centerMode === 'logo' && Boolean(config.logoDataUrl)) ||
    (config.centerMode === 'text' && config.centerText.trim().length > 0);
  return hasCenterOverlay ? 'H' : config.errorCorrection;
}

export function createQrMatrix(
  text: string,
  errorCorrectionLevel: ErrorCorrectionLevel
): QRCode.QRCode | null {
  if (!text) return null;
  try {
    return QRCode.create(text, { errorCorrectionLevel });
  } catch {
    return null;
  }
}

export function computeQrMetrics(config: QrConfig): QrMetrics {
  const { normalizedUrl, isValidUrl, validationError } = normalizeUrlInput(config.url);
  const effectiveLevel = getEffectiveErrorLevel(config);
  const fgRatio = getContrastRatio(config.fgColor, config.bgColor);
  const gradRatio = config.fgGradientEnabled
    ? getContrastRatio(config.fgGradientColor, config.bgColor)
    : fgRatio;
  const letterRatio = config.letterArtEnabled
    ? getContrastRatio(config.letterArtColor, config.bgColor)
    : fgRatio;

  const contrastRatio = Math.min(fgRatio, gradRatio, letterRatio);
  const isLowContrast = contrastRatio < 4.5;

  if (!isValidUrl || !normalizedUrl) {
    return {
      version: 0,
      moduleCount: 0,
      byteLength: 0,
      contrastRatio,
      isLowContrast,
      isValidUrl,
      normalizedUrl,
      validationError,
    };
  }

  const qr = createQrMatrix(normalizedUrl, effectiveLevel);
  if (!qr) {
    return {
      version: 0,
      moduleCount: 0,
      byteLength: new TextEncoder().encode(normalizedUrl).length,
      contrastRatio,
      isLowContrast,
      isValidUrl: false,
      normalizedUrl,
      validationError: 'URL exceeds maximum QR code byte capacity.',
    };
  }

  return {
    version: qr.version,
    moduleCount: qr.modules.size,
    byteLength: new TextEncoder().encode(normalizedUrl).length,
    contrastRatio,
    isLowContrast,
    isValidUrl: true,
    normalizedUrl,
    validationError: null,
  };
}

export function isFinderZone(row: number, col: number, size: number): boolean {
  const inTop = row < 7;
  const inBottom = row >= size - 7;
  const inLeft = col < 7;
  const inRight = col >= size - 7;
  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft);
}

export function computeLetterMask(size: number, rawText: string): boolean[][] {
  const mask: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const text = rawText.trim().toUpperCase().slice(0, 6);
  if (!text || typeof document === 'undefined') return mask;

  const scale = 6;
  const canvas = document.createElement('canvas');
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return mask;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxWidth = canvas.width * 0.82;
  let fontSize = canvas.height * (text.length <= 2 ? 0.64 : text.length <= 4 ? 0.48 : 0.36);
  ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", Arial, sans-serif`;
  const measured = ctx.measureText(text).width;
  if (measured > maxWidth && measured > 0) {
    fontSize = fontSize * (maxWidth / measured);
    ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", Arial, sans-serif`;
  }

  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize * 0.04);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isFinderZone(row, col, size)) continue;
      const cx = Math.floor((col + 0.5) * scale);
      const cy = Math.floor((row + 0.5) * scale);
      const idx = (cy * canvas.width + cx) * 4 + 3;
      if (imageData[idx] > 90) {
        mask[row][col] = true;
      }
    }
  }

  return mask;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const cr = Math.min(r, w / 2, h / 2);
  if (cr <= 0) return `M${x} ${y}h${w}v${h}h-${w}z`;
  return (
    `M${x + cr} ${y}` +
    `h${w - 2 * cr}` +
    `a${cr} ${cr} 0 0 1 ${cr} ${cr}` +
    `v${h - 2 * cr}` +
    `a${cr} ${cr} 0 0 1 -${cr} ${cr}` +
    `h-${w - 2 * cr}` +
    `a${cr} ${cr} 0 0 1 -${cr} -${cr}` +
    `v-${h - 2 * cr}` +
    `a${cr} ${cr} 0 0 1 ${cr} -${cr}z`
  );
}

function leafRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const cr = Math.min(r, w / 2, h / 2);
  return (
    `M${x} ${y}` +
    `h${w - cr}` +
    `a${cr} ${cr} 0 0 1 ${cr} ${cr}` +
    `v${h - cr}` +
    `h-${w - cr}` +
    `a${cr} ${cr} 0 0 1 -${cr} -${cr}` +
    `v-${h - cr}z`
  );
}

function buildModuleShapePath(
  x: number,
  y: number,
  style: DotStyle,
  scaleFactor = 1,
  neighbors?: { left: boolean; right: boolean; up: boolean; down: boolean }
): string {
  const size = scaleFactor;
  const offset = (1 - size) / 2;
  const px = x + offset;
  const py = y + offset;

  if (style === 'dots') {
    const r = (size * 0.44).toFixed(3);
    const cx = (x + 0.5).toFixed(3);
    const cy = (y + 0.5).toFixed(3);
    return `M${cx} ${cy}m-${r},0a${r},${r} 0 1,0 ${(Number(r) * 2).toFixed(3)},0a${r},${r} 0 1,0 -${(
      Number(r) * 2
    ).toFixed(3)},0`;
  }

  if (style === 'diamond') {
    const half = size * 0.48;
    const cx = x + 0.5;
    const cy = y + 0.5;
    return `M${cx.toFixed(3)} ${(cy - half).toFixed(3)}L${(cx + half).toFixed(3)} ${cy.toFixed(
      3
    )}L${cx.toFixed(3)} ${(cy + half).toFixed(3)}L${(cx - half).toFixed(3)} ${cy.toFixed(3)}z`;
  }

  if (style === 'rounded') {
    const inset = (1 - size * 0.9) / 2;
    const w = size * 0.9;
    return roundedRectPath(
      Number((x + inset).toFixed(3)),
      Number((y + inset).toFixed(3)),
      Number(w.toFixed(3)),
      Number(w.toFixed(3)),
      Number((w * 0.28).toFixed(3))
    );
  }

  if (style === 'bars' && neighbors) {
    const pad = 0.09;
    const left = neighbors.left ? x : x + pad;
    const right = neighbors.right ? x + 1 : x + 1 - pad;
    const top = neighbors.up ? y : y + pad;
    const bottom = neighbors.down ? y + 1 : y + 1 - pad;
    const w = right - left;
    const h = bottom - top;
    const r = !neighbors.left && !neighbors.right && !neighbors.up && !neighbors.down ? 0.34 : 0.16;
    return roundedRectPath(
      Number(left.toFixed(3)),
      Number(top.toFixed(3)),
      Number(w.toFixed(3)),
      Number(h.toFixed(3)),
      Number(r.toFixed(3))
    );
  }

  return `M${px.toFixed(3)} ${py.toFixed(3)}h${size.toFixed(3)}v${size.toFixed(3)}h-${size.toFixed(
    3
  )}z`;
}

function buildFinderRingPath(ox: number, oy: number, style: CornerStyle): string {
  if (style === 'circle') {
    const cx = ox + 3.5;
    const cy = oy + 3.5;
    const outerR = 3.5;
    const innerR = 2.5;
    const outer = `M${cx - outerR} ${cy}a${outerR} ${outerR} 0 1 0 ${
      outerR * 2
    } 0a${outerR} ${outerR} 0 1 0 -${outerR * 2} 0`;
    const inner = `M${cx - innerR} ${cy}a${innerR} ${innerR} 0 1 1 ${
      innerR * 2
    } 0a${innerR} ${innerR} 0 1 1 -${innerR * 2} 0`;
    return `${outer}${inner}`;
  }

  if (style === 'leaf') {
    const outer = leafRectPath(ox, oy, 7, 7, 2.2);
    const inner = leafRectPath(ox + 1, oy + 1, 5, 5, 1.5);
    return `${outer} ${inner}`;
  }

  const radius = style === 'square' ? 0 : style === 'rounded' ? 1.35 : 2.35;
  const innerRadius = style === 'square' ? 0 : style === 'rounded' ? 0.85 : 1.55;
  const outer = roundedRectPath(ox, oy, 7, 7, radius);
  const inner = roundedRectPath(ox + 1, oy + 1, 5, 5, innerRadius);
  return `${outer} ${inner}`;
}

function buildFinderDotPath(ox: number, oy: number, style: CornerDotStyle): string {
  const dx = ox + 2;
  const dy = oy + 2;
  if (style === 'circle') {
    const cx = ox + 3.5;
    const cy = oy + 3.5;
    const r = 1.5;
    return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 -${r * 2} 0`;
  }
  if (style === 'diamond') {
    const cx = ox + 3.5;
    const cy = oy + 3.5;
    const r = 1.75;
    return `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}z`;
  }
  if (style === 'rounded') {
    return roundedRectPath(dx, dy, 3, 3, 0.85);
  }
  return `M${dx} ${dy}h3v3h-3z`;
}

export interface QrRenderData {
  totalModules: number;
  viewHeight: number;
  captionUnits: number;
  dataPath: string;
  letterDataPath: string;
  finderRingPath: string;
  finderDotPath: string;
  normalizedUrl: string;
  effectiveLevel: ErrorCorrectionLevel;
  hasCenterBox: boolean;
  boxOrigin: number;
  boxSize: number;
  boxRadius: number;
  imgOrigin: number;
  logoSize: number;
  centerFontSize: number;
  hasCaption: boolean;
  captionFontSize: number;
  captionY: number;
}

export function buildQrRenderData(config: QrConfig): QrRenderData | null {
  const { normalizedUrl, isValidUrl } = normalizeUrlInput(config.url);
  if (!isValidUrl || !normalizedUrl) return null;

  const effectiveLevel = getEffectiveErrorLevel(config);
  const qr = createQrMatrix(normalizedUrl, effectiveLevel);
  if (!qr) return null;

  const size = qr.modules.size;
  const margin = Math.max(0, Math.min(8, Math.round(config.margin)));
  const totalModules = size + margin * 2;

  const letterMask =
    config.letterArtEnabled && config.letterArtText.trim().length > 0
      ? computeLetterMask(size, config.letterArtText)
      : null;

  const hasLogo = config.centerMode === 'logo' && Boolean(config.logoDataUrl);
  const hasCenterText = config.centerMode === 'text' && config.centerText.trim().length > 0;
  const hasCenterBox = hasLogo || hasCenterText;

  const clampedScale = hasCenterText
    ? Math.min(0.32, Math.max(0.2, 0.16 + config.centerText.trim().length * 0.024))
    : Math.max(0.14, Math.min(0.24, config.logoScale));

  const logoSize = size * clampedScale;
  const pad = Math.max(0.75, logoSize * 0.14);
  const boxWidth = hasCenterText ? Math.min(size * 0.56, Math.max(size * 0.26, logoSize * 1.45)) : logoSize + pad * 2;
  const boxHeight = hasCenterText ? Math.max(4.4, size * 0.17) : logoSize + pad * 2;
  const boxOriginX = (totalModules - boxWidth) / 2;

  const dataParts: string[] = [];
  const letterParts: string[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isFinderZone(row, col, size)) continue;
      if (!qr.modules.get(row, col)) continue;

      const x = col + margin;
      const y = row + margin;

      const neighbors =
        config.dotStyle === 'bars'
          ? {
              left: col > 0 && !isFinderZone(row, col - 1, size) && Boolean(qr.modules.get(row, col - 1)),
              right:
                col < size - 1 &&
                !isFinderZone(row, col + 1, size) &&
                Boolean(qr.modules.get(row, col + 1)),
              up: row > 0 && !isFinderZone(row - 1, col, size) && Boolean(qr.modules.get(row - 1, col)),
              down:
                row < size - 1 &&
                !isFinderZone(row + 1, col, size) &&
                Boolean(qr.modules.get(row + 1, col)),
            }
          : undefined;

      const inLetter = Boolean(letterMask?.[row]?.[col]);
      if (inLetter) {
        letterParts.push(
          buildModuleShapePath(
            x,
            y,
            config.dotStyle === 'dots' ? 'rounded' : config.dotStyle,
            1,
            neighbors
          )
        );
      } else {
        const scaleFactor = letterMask ? 0.82 : 1;
        dataParts.push(buildModuleShapePath(x, y, config.dotStyle, scaleFactor, neighbors));
      }
    }
  }

  const finderOrigins: Array<[number, number]> = [
    [margin, margin],
    [margin + size - 7, margin],
    [margin, margin + size - 7],
  ];
  const finderRingPath = finderOrigins
    .map(([ox, oy]) => buildFinderRingPath(ox, oy, config.cornerStyle))
    .join(' ');
  const finderDotPath = finderOrigins
    .map(([ox, oy]) => buildFinderDotPath(ox, oy, config.cornerDotStyle))
    .join(' ');

  const hasCaption = config.showCaption && config.caption.trim().length > 0;
  const captionUnits = hasCaption ? Math.max(4, Math.round(totalModules * 0.14)) : 0;
  const viewHeight = totalModules + captionUnits;

  return {
    totalModules,
    viewHeight,
    captionUnits,
    dataPath: dataParts.join(''),
    letterDataPath: letterParts.join(''),
    finderRingPath,
    finderDotPath,
    normalizedUrl,
    effectiveLevel,
    hasCenterBox,
    boxOrigin: boxOriginX,
    boxSize: boxWidth,
    boxRadius: Math.min(boxWidth, boxHeight) * 0.16,
    imgOrigin: (totalModules - logoSize) / 2,
    logoSize,
    centerFontSize: boxHeight * 0.56,
    hasCaption,
    captionFontSize: Math.max(1.4, totalModules * 0.052),
    captionY: totalModules + captionUnits * 0.56,
  };
}

export function buildStandaloneSvg(config: QrConfig): string | null {
  const data = buildQrRenderData(config);
  if (!data) return null;

  const { totalModules, viewHeight } = data;
  const hasCenterText = config.centerMode === 'text' && config.centerText.trim().length > 0;
  const hasLogo = config.centerMode === 'logo' && Boolean(config.logoDataUrl);

  const boxHeight = hasCenterText
    ? Math.max(4.4, (totalModules - config.margin * 2) * 0.17)
    : data.boxSize;
  const boxY = (totalModules - boxHeight) / 2;

  const gradCoords =
    config.fgGradientDirection === 'horizontal'
      ? 'x1="0%" y1="0%" x2="100%" y2="0%"'
      : config.fgGradientDirection === 'vertical'
        ? 'x1="0%" y1="0%" x2="0%" y2="100%"'
        : 'x1="0%" y1="0%" x2="100%" y2="100%"';

  const defsSnippet = config.fgGradientEnabled
    ? `\n  <defs>\n    <linearGradient id="qr-fg-grad" ${gradCoords}>\n      <stop offset="0%" stop-color="${escapeXml(
        config.fgColor
      )}" />\n      <stop offset="100%" stop-color="${escapeXml(
        config.fgGradientColor
      )}" />\n    </linearGradient>\n  </defs>`
    : '';

  const mainFill = config.fgGradientEnabled ? 'url(#qr-fg-grad)' : escapeXml(config.fgColor);
  const cornerFill = config.customCornerColorEnabled ? escapeXml(config.cornerColor) : mainFill;

  const letterSnippet = data.letterDataPath
    ? `\n  <path d="${data.letterDataPath}" fill="${escapeXml(config.letterArtColor)}" />`
    : '';

  let centerSnippet = '';
  if (hasLogo && config.logoDataUrl) {
    centerSnippet = `\n  <rect x="${data.boxOrigin.toFixed(3)}" y="${boxY.toFixed(
      3
    )}" width="${data.boxSize.toFixed(3)}" height="${boxHeight.toFixed(
      3
    )}" rx="${data.boxRadius.toFixed(3)}" fill="${escapeXml(
      config.bgColor
    )}" />\n  <image href="${escapeXml(
      config.logoDataUrl
    )}" x="${data.imgOrigin.toFixed(3)}" y="${data.imgOrigin.toFixed(
      3
    )}" width="${data.logoSize.toFixed(3)}" height="${data.logoSize.toFixed(
      3
    )}" preserveAspectRatio="xMidYMid meet" />`;
  } else if (hasCenterText) {
    const cleanText = config.centerText.trim().slice(0, 12);
    centerSnippet = `\n  <rect x="${data.boxOrigin.toFixed(3)}" y="${boxY.toFixed(
      3
    )}" width="${data.boxSize.toFixed(3)}" height="${boxHeight.toFixed(
      3
    )}" rx="${data.boxRadius.toFixed(3)}" fill="${escapeXml(
      config.bgColor
    )}" />\n  <rect x="${(data.boxOrigin + 0.35).toFixed(3)}" y="${(boxY + 0.35).toFixed(
      3
    )}" width="${(data.boxSize - 0.7).toFixed(3)}" height="${(boxHeight - 0.7).toFixed(
      3
    )}" rx="${Math.max(0.2, data.boxRadius * 0.78).toFixed(3)}" fill="${escapeXml(
      config.centerTextBgColor
    )}" />\n  <text x="${(totalModules / 2).toFixed(3)}" y="${(
      totalModules / 2 +
      data.centerFontSize * 0.34
    ).toFixed(
      3
    )}" text-anchor="middle" font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif" font-size="${data.centerFontSize.toFixed(
      3
    )}" font-weight="700" letter-spacing="0.06em" fill="${escapeXml(
      config.centerTextColor
    )}">${escapeXml(cleanText)}</text>`;
  }

  const captionSnippet = data.hasCaption
    ? `\n  <text x="${(totalModules / 2).toFixed(3)}" y="${data.captionY.toFixed(
        3
      )}" text-anchor="middle" font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif" font-size="${data.captionFontSize.toFixed(
        3
      )}" font-weight="600" fill="${escapeXml(config.fgColor)}">${escapeXml(
        config.caption.trim()
      )}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalModules} ${viewHeight}" width="1024" height="${Math.round(
    (1024 * viewHeight) / totalModules
  )}" role="img" aria-label="QR code for ${escapeXml(data.normalizedUrl)}">${defsSnippet}
  <rect width="${totalModules}" height="${viewHeight}" fill="${escapeXml(config.bgColor)}" />
  <path d="${data.dataPath}" fill="${mainFill}" />${letterSnippet}
  <path d="${data.finderRingPath}" fill="${cornerFill}" fill-rule="evenodd" />
  <path d="${data.finderDotPath}" fill="${cornerFill}" />${centerSnippet}${captionSnippet}
</svg>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load SVG for PNG export'));
    img.src = src;
  });
}

export async function renderQrToPngBlob(config: QrConfig): Promise<Blob | null> {
  const svgString = buildStandaloneSvg(config);
  const data = buildQrRenderData(config);
  if (!svgString || !data) return null;

  const targetWidth = config.resolution;
  const targetHeight = Math.round((targetWidth * data.viewHeight) / data.totalModules);

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(svgUrl);
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export function buildDownloadFilename(url: string, ext: 'svg' | 'png'): string {
  const { normalizedUrl } = normalizeUrlInput(url);
  try {
    const parsed = new URL(normalizedUrl);
    const hostSlug = parsed.hostname.replace(/^www\./, '').replace(/[^a-zA-Z0-9]+/g, '-');
    const pathSlug = parsed.pathname
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .slice(0, 24);
    const base = pathSlug ? `${hostSlug}-${pathSlug}` : hostSlug;
    return `qr-${base || 'link'}.${ext}`.toLowerCase();
  } catch {
    return `qr-code.${ext}`;
  }
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
