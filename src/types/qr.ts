export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ExportResolution = 512 | 1024 | 2048 | 4096;

export type DotStyle = 'square' | 'rounded' | 'dots' | 'diamond' | 'bars';

export type CornerStyle = 'square' | 'rounded' | 'extra-rounded' | 'circle' | 'leaf';

export type CornerDotStyle = 'square' | 'rounded' | 'circle' | 'diamond';

export type CenterMode = 'none' | 'text' | 'logo';

export type GradientDirection = 'vertical' | 'horizontal' | 'diagonal';

export interface QrConfig {
  url: string;
  errorCorrection: ErrorCorrectionLevel;
  fgColor: string;
  fgGradientEnabled: boolean;
  fgGradientColor: string;
  fgGradientDirection: GradientDirection;
  bgColor: string;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  cornerDotStyle: CornerDotStyle;
  customCornerColorEnabled: boolean;
  cornerColor: string;
  margin: number;
  resolution: ExportResolution;
  centerMode: CenterMode;
  centerText: string;
  centerTextColor: string;
  centerTextBgColor: string;
  logoDataUrl: string | null;
  logoScale: number;
  letterArtEnabled: boolean;
  letterArtText: string;
  letterArtColor: string;
  caption: string;
  showCaption: boolean;
}

export interface QrMetrics {
  version: number;
  moduleCount: number;
  byteLength: number;
  contrastRatio: number;
  isLowContrast: boolean;
  isValidUrl: boolean;
  normalizedUrl: string;
  validationError: string | null;
}

export interface SavedQrItem {
  id: string;
  label: string;
  config: QrConfig;
  createdAt: string;
}
