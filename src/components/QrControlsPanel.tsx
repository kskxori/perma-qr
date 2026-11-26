import { ArrowLeftRight, ImagePlus, RotateCcw, Trash2, X } from 'lucide-react';
import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import type {
  CenterMode,
  CornerDotStyle,
  CornerStyle,
  DotStyle,
  ErrorCorrectionLevel,
  ExportResolution,
  GradientDirection,
  QrConfig,
  QrMetrics,
} from '../types/qr';

interface QrControlsPanelProps {
  config: QrConfig;
  metrics: QrMetrics;
  onChange: (patch: Partial<QrConfig>) => void;
  onReset: () => void;
}

const DOT_STYLES: Array<{ value: DotStyle; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'bars', label: 'Connected' },
];

const CORNER_STYLES: Array<{ value: CornerStyle; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Squircle' },
  { value: 'circle', label: 'Circle' },
  { value: 'leaf', label: 'Leaf' },
];

const CORNER_DOT_STYLES: Array<{ value: CornerDotStyle; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'diamond', label: 'Diamond' },
];

const ERROR_LEVELS: Array<{ value: ErrorCorrectionLevel; label: string; detail: string }> = [
  { value: 'L', label: 'L · 7%', detail: 'Compact' },
  { value: 'M', label: 'M · 15%', detail: 'Balanced' },
  { value: 'Q', label: 'Q · 25%', detail: 'Durable' },
  { value: 'H', label: 'H · 30%', detail: 'Max safety' },
];

const RESOLUTIONS: ExportResolution[] = [512, 1024, 2048, 4096];

const GRADIENT_DIRS: Array<{ value: GradientDirection; label: string }> = [
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const COLOR_PRESETS = [
  { name: 'Classic Ink', fg: '#0F172A', bg: '#FFFFFF' },
  { name: 'Pure Black', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Cobalt', fg: '#1D4ED8', bg: '#FFFFFF' },
  { name: 'Forest', fg: '#14532D', bg: '#FFFFFF' },
  { name: 'Burgundy', fg: '#881337', bg: '#FFFFFF' },
  { name: 'Inverted Slate', fg: '#F8FAFC', bg: '#0F172A' },
];

const SAMPLE_URLS = [
  { label: 'Portfolio', url: 'https://alexrivera.dev' },
  { label: 'GitHub Repo', url: 'https://github.com/vercel/next.js' },
  { label: 'PDF Menu', url: 'https://example.com/autumn-menu.pdf' },
];

export function QrControlsPanel({ config, metrics, onChange, onReset }: QrControlsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const centerActive =
    (config.centerMode === 'logo' && Boolean(config.logoDataUrl)) ||
    (config.centerMode === 'text' && config.centerText.trim().length > 0);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({
          centerMode: 'logo',
          logoDataUrl: reader.result,
          errorCorrection: 'H',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSwapColors = () => {
    onChange({
      fgColor: config.bgColor,
      bgColor: config.fgColor,
    });
  };

  const handleCenterModeChange = (mode: CenterMode) => {
    if (mode === 'text' || mode === 'logo') {
      onChange({ centerMode: mode, errorCorrection: 'H' });
    } else {
      onChange({ centerMode: mode });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label htmlFor="qr-url-input" className="block text-base font-semibold text-slate-900">
              Destination URL
            </label>
            <p className="mt-0.5 text-sm text-slate-600">
              Paste any website link to encode directly inside the QR matrix.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        <div className="relative">
          <input
            id="qr-url-input"
            type="url"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={config.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://your-website.com"
            aria-invalid={!metrics.isValidUrl && config.url.trim().length > 0}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          {config.url.length > 0 && (
            <button
              type="button"
              onClick={() => onChange({ url: '' })}
              aria-label="Clear URL"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {metrics.validationError && config.url.trim().length > 0 && (
          <p className="text-xs font-medium text-red-600" role="status">
            {metrics.validationError}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Examples:</span>
            {SAMPLE_URLS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => onChange({ url: sample.url })}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {sample.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {config.url.trim().length} chars
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-2.5">
          <span className="block text-sm font-semibold text-slate-900">Module Pattern Design</span>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {DOT_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => onChange({ dotStyle: style.value })}
                className={`rounded-md px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  config.dotStyle === style.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <span className="block text-sm font-semibold text-slate-900">Corner Frame Style</span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {CORNER_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => onChange({ cornerStyle: style.value })}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    config.cornerStyle === style.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="block text-sm font-semibold text-slate-900">Corner Center Dot</span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {CORNER_DOT_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => onChange({ cornerDotStyle: style.value })}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    config.cornerDotStyle === style.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-slate-900">Colors &amp; Gradient</span>
          <button
            type="button"
            onClick={handleSwapColors}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Swap Colors</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fg-color" className="block text-xs font-medium text-slate-600 mb-1.5">
              Foreground (Modules)
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5">
              <input
                id="fg-color"
                type="color"
                value={config.fgColor}
                onChange={(e) => onChange({ fgColor: e.target.value.toUpperCase() })}
                className="h-7 w-9 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
              />
              <input
                type="text"
                aria-label="Foreground hex color"
                value={config.fgColor}
                onChange={(e) => onChange({ fgColor: e.target.value })}
                maxLength={7}
                className="w-full font-mono text-xs text-slate-800 uppercase focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bg-color" className="block text-xs font-medium text-slate-600 mb-1.5">
              Background
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5">
              <input
                id="bg-color"
                type="color"
                value={config.bgColor}
                onChange={(e) => onChange({ bgColor: e.target.value.toUpperCase() })}
                className="h-7 w-9 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
              />
              <input
                type="text"
                aria-label="Background hex color"
                value={config.bgColor}
                onChange={(e) => onChange({ bgColor: e.target.value })}
                maxLength={7}
                className="w-full font-mono text-xs text-slate-800 uppercase focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected =
              !config.fgGradientEnabled &&
              config.fgColor.toUpperCase() === preset.fg &&
              config.bgColor.toUpperCase() === preset.bg;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() =>
                  onChange({ fgColor: preset.fg, bgColor: preset.bg, fgGradientEnabled: false })
                }
                className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-sm border border-slate-300 shrink-0"
                  style={{ backgroundColor: preset.fg }}
                  aria-hidden="true"
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="grad-toggle" className="text-xs font-semibold text-slate-800">
                Foreground Gradient
              </label>
              <button
                id="grad-toggle"
                type="button"
                role="switch"
                aria-checked={config.fgGradientEnabled}
                onClick={() => onChange({ fgGradientEnabled: !config.fgGradientEnabled })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  config.fgGradientEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    config.fgGradientEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {config.fgGradientEnabled && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5">
                  <input
                    type="color"
                    aria-label="Gradient second color"
                    value={config.fgGradientColor}
                    onChange={(e) => onChange({ fgGradientColor: e.target.value.toUpperCase() })}
                    className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    aria-label="Gradient second hex color"
                    value={config.fgGradientColor}
                    onChange={(e) => onChange({ fgGradientColor: e.target.value })}
                    maxLength={7}
                    className="w-full font-mono text-xs text-slate-800 uppercase focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
                  {GRADIENT_DIRS.map((dir) => (
                    <button
                      key={dir.value}
                      type="button"
                      onClick={() => onChange({ fgGradientDirection: dir.value })}
                      className={`rounded py-1 text-[11px] font-medium transition-colors ${
                        config.fgGradientDirection === dir.value
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="corner-color-toggle" className="text-xs font-semibold text-slate-800">
                Separate Corner Color
              </label>
              <button
                id="corner-color-toggle"
                type="button"
                role="switch"
                aria-checked={config.customCornerColorEnabled}
                onClick={() =>
                  onChange({ customCornerColorEnabled: !config.customCornerColorEnabled })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  config.customCornerColorEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    config.customCornerColorEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {config.customCornerColorEnabled && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5">
                <input
                  type="color"
                  aria-label="Corner eyes color"
                  value={config.cornerColor}
                  onChange={(e) => onChange({ cornerColor: e.target.value.toUpperCase() })}
                  className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
                />
                <input
                  type="text"
                  aria-label="Corner eyes hex color"
                  value={config.cornerColor}
                  onChange={(e) => onChange({ cornerColor: e.target.value })}
                  maxLength={7}
                  className="w-full font-mono text-xs text-slate-800 uppercase focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <label htmlFor="letter-art-toggle" className="text-sm font-semibold text-slate-900">
                Form Letters Inside QR Dots
              </label>
              <p className="text-xs text-slate-500">
                Sculpts letters across the QR matrix dots while keeping 100% of bits scannable.
              </p>
            </div>
            <button
              id="letter-art-toggle"
              type="button"
              role="switch"
              aria-checked={config.letterArtEnabled}
              onClick={() => onChange({ letterArtEnabled: !config.letterArtEnabled })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                config.letterArtEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  config.letterArtEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {config.letterArtEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="letter-art-text"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Letters (1–6 characters)
                </label>
                <input
                  id="letter-art-text"
                  type="text"
                  maxLength={6}
                  value={config.letterArtText}
                  onChange={(e) => onChange({ letterArtText: e.target.value.toUpperCase() })}
                  placeholder="QR"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-semibold uppercase text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor="letter-art-color"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Letter Module Color
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5">
                  <input
                    id="letter-art-color"
                    type="color"
                    value={config.letterArtColor}
                    onChange={(e) => onChange({ letterArtColor: e.target.value.toUpperCase() })}
                    className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    aria-label="Letter module hex color"
                    value={config.letterArtColor}
                    onChange={(e) => onChange({ letterArtColor: e.target.value })}
                    maxLength={7}
                    className="w-full font-mono text-xs text-slate-800 uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900">Center Badge or Logo</span>
            <span className="text-xs text-slate-500">Auto-uses Level H (30%) recovery</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { value: 'none', label: 'None' },
                { value: 'text', label: 'Center Letters' },
                { value: 'logo', label: 'Upload Logo' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleCenterModeChange(opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  config.centerMode === opt.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {config.centerMode === 'text' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label
                  htmlFor="center-text-input"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Badge Text
                </label>
                <input
                  id="center-text-input"
                  type="text"
                  maxLength={12}
                  value={config.centerText}
                  onChange={(e) => onChange({ centerText: e.target.value })}
                  placeholder="SCAN"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor="center-text-bg"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Badge Fill
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5">
                  <input
                    id="center-text-bg"
                    type="color"
                    value={config.centerTextBgColor}
                    onChange={(e) => onChange({ centerTextBgColor: e.target.value.toUpperCase() })}
                    className="h-5 w-7 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    aria-label="Center badge fill hex"
                    value={config.centerTextBgColor}
                    onChange={(e) => onChange({ centerTextBgColor: e.target.value })}
                    maxLength={7}
                    className="w-full font-mono text-xs text-slate-800 uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="center-text-fg"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Text Color
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5">
                  <input
                    id="center-text-fg"
                    type="color"
                    value={config.centerTextColor}
                    onChange={(e) => onChange({ centerTextColor: e.target.value.toUpperCase() })}
                    className="h-5 w-7 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    aria-label="Center badge text hex"
                    value={config.centerTextColor}
                    onChange={(e) => onChange({ centerTextColor: e.target.value })}
                    maxLength={7}
                    className="w-full font-mono text-xs text-slate-800 uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {config.centerMode === 'logo' && (
            <div className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {config.logoDataUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={config.logoDataUrl}
                        alt="Uploaded QR center logo"
                        className="h-9 w-9 rounded object-contain bg-white border border-slate-200 p-1 shrink-0"
                      />
                      <span className="text-xs font-medium text-slate-700 truncate">
                        Logo embedded
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChange({ logoDataUrl: null, centerMode: 'none' })}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label htmlFor="logo-scale" className="text-xs text-slate-600 whitespace-nowrap">
                      Logo size
                    </label>
                    <input
                      id="logo-scale"
                      type="range"
                      min={0.14}
                      max={0.24}
                      step={0.01}
                      value={config.logoScale}
                      onChange={(e) => onChange({ logoScale: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <span className="font-mono text-xs tabular-nums text-slate-600 w-9 text-right">
                      {Math.round(config.logoScale * 100)}%
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <ImagePlus className="h-4 w-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>Upload PNG, SVG, or WebP Logo</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900">Error Correction Level</span>
            <span className="text-xs text-slate-500">
              {centerActive
                ? 'Locked to Level H (30%) while center badge/logo is active'
                : 'Higher recovery withstands scratches and print wear'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-100 rounded-lg">
            {ERROR_LEVELS.map((item) => {
              const active = (centerActive ? 'H' : config.errorCorrection) === item.value;
              const disabled = centerActive && item.value !== 'H';
              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ errorCorrection: item.value })}
                  className={`rounded-md px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 disabled:opacity-45 disabled:cursor-not-allowed'
                  }`}
                >
                  <div className="text-xs font-semibold whitespace-nowrap">{item.label}</div>
                  <div className="text-[11px] text-slate-500 truncate">{item.detail}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="quiet-zone" className="text-sm font-semibold text-slate-900">
                Quiet Zone Margin
              </label>
              <span className="font-mono text-xs tabular-nums text-slate-600">
                {config.margin} modules
              </span>
            </div>
            <input
              id="quiet-zone"
              type="range"
              min={0}
              max={6}
              step={1}
              value={config.margin}
              onChange={(e) => onChange({ margin: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2.5">
            <span className="block text-sm font-semibold text-slate-900">PNG Export Size</span>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => onChange({ resolution: res })}
                  className={`rounded-md py-1.5 font-mono text-xs font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    config.resolution === res
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label htmlFor="caption-toggle" className="text-sm font-semibold text-slate-900">
              Bottom Print Caption
            </label>
            <button
              id="caption-toggle"
              type="button"
              role="switch"
              aria-checked={config.showCaption}
              onClick={() => onChange({ showCaption: !config.showCaption })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                config.showCaption ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  config.showCaption ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <input
            type="text"
            aria-label="Print caption text"
            value={config.caption}
            disabled={!config.showCaption}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Scan to visit"
            maxLength={42}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>
    </div>
  );
}
