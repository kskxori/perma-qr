import { AlertTriangle, Bookmark, Check, Copy, Download, QrCode } from 'lucide-react';
import { useMemo } from 'react';
import type { QrConfig, QrMetrics } from '../types/qr';
import { buildQrRenderData, getEffectiveErrorLevel } from '../utils/qr';

interface QrPreviewPanelProps {
  config: QrConfig;
  metrics: QrMetrics;
  copyState: 'idle' | 'copied' | 'error';
  saveState: 'idle' | 'saved';
  isExportingPng: boolean;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
  onCopyPng: () => void;
  onSaveLocal: () => void;
}

export function QrPreviewPanel({
  config,
  metrics,
  copyState,
  saveState,
  isExportingPng,
  onDownloadSvg,
  onDownloadPng,
  onCopyPng,
  onSaveLocal,
}: QrPreviewPanelProps) {
  const effectiveLevel = getEffectiveErrorLevel(config);
  const renderData = useMemo(() => buildQrRenderData(config), [config]);

  const gradCoords =
    config.fgGradientDirection === 'horizontal'
      ? { x1: '0%', y1: '0%', x2: '100%', y2: '0%' }
      : config.fgGradientDirection === 'vertical'
        ? { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
        : { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };

  const hasCenterText = config.centerMode === 'text' && config.centerText.trim().length > 0;
  const hasLogo = config.centerMode === 'logo' && Boolean(config.logoDataUrl);

  const boxHeight = renderData
    ? hasCenterText
      ? Math.max(4.4, (renderData.totalModules - config.margin * 2) * 0.17)
      : renderData.boxSize
    : 0;
  const boxY = renderData ? (renderData.totalModules - boxHeight) / 2 : 0;

  return (
    <div className="lg:sticky lg:top-8 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">Live Matrix Preview</h2>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          {metrics.isValidUrl
            ? `Version ${metrics.version} · ${metrics.moduleCount}×${metrics.moduleCount}`
            : 'Waiting for URL'}
        </span>
      </div>

      <div className="qr-preview-grid p-8 sm:p-10 flex flex-col items-center justify-center min-h-[380px] bg-slate-50/70">
        {renderData ? (
          <div className="w-full max-w-[320px] rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <svg
              viewBox={`0 0 ${renderData.totalModules} ${renderData.viewHeight}`}
              className="w-full h-auto block"
              role="img"
              aria-label={`QR code for ${renderData.normalizedUrl}`}
            >
              {config.fgGradientEnabled && (
                <defs>
                  <linearGradient id="preview-qr-grad" {...gradCoords}>
                    <stop offset="0%" stopColor={config.fgColor} />
                    <stop offset="100%" stopColor={config.fgGradientColor} />
                  </linearGradient>
                </defs>
              )}

              <rect
                width={renderData.totalModules}
                height={renderData.viewHeight}
                fill={config.bgColor}
              />

              <path
                d={renderData.dataPath}
                fill={config.fgGradientEnabled ? 'url(#preview-qr-grad)' : config.fgColor}
              />

              {renderData.letterDataPath && (
                <path d={renderData.letterDataPath} fill={config.letterArtColor} />
              )}

              <path
                d={renderData.finderRingPath}
                fill={
                  config.customCornerColorEnabled
                    ? config.cornerColor
                    : config.fgGradientEnabled
                      ? 'url(#preview-qr-grad)'
                      : config.fgColor
                }
                fillRule="evenodd"
              />
              <path
                d={renderData.finderDotPath}
                fill={
                  config.customCornerColorEnabled
                    ? config.cornerColor
                    : config.fgGradientEnabled
                      ? 'url(#preview-qr-grad)'
                      : config.fgColor
                }
              />

              {hasLogo && config.logoDataUrl && (
                <>
                  <rect
                    x={renderData.boxOrigin}
                    y={boxY}
                    width={renderData.boxSize}
                    height={boxHeight}
                    rx={renderData.boxRadius}
                    fill={config.bgColor}
                  />
                  <image
                    href={config.logoDataUrl}
                    x={renderData.imgOrigin}
                    y={renderData.imgOrigin}
                    width={renderData.logoSize}
                    height={renderData.logoSize}
                    preserveAspectRatio="xMidYMid meet"
                  />
                </>
              )}

              {hasCenterText && (
                <>
                  <rect
                    x={renderData.boxOrigin}
                    y={boxY}
                    width={renderData.boxSize}
                    height={boxHeight}
                    rx={renderData.boxRadius}
                    fill={config.bgColor}
                  />
                  <rect
                    x={renderData.boxOrigin + 0.35}
                    y={boxY + 0.35}
                    width={renderData.boxSize - 0.7}
                    height={boxHeight - 0.7}
                    rx={Math.max(0.2, renderData.boxRadius * 0.78)}
                    fill={config.centerTextBgColor}
                  />
                  <text
                    x={renderData.totalModules / 2}
                    y={renderData.totalModules / 2 + renderData.centerFontSize * 0.34}
                    textAnchor="middle"
                    fontFamily="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
                    fontSize={renderData.centerFontSize}
                    fontWeight={700}
                    letterSpacing="0.06em"
                    fill={config.centerTextColor}
                  >
                    {config.centerText.trim().slice(0, 12)}
                  </text>
                </>
              )}

              {renderData.hasCaption && (
                <text
                  x={renderData.totalModules / 2}
                  y={renderData.captionY}
                  textAnchor="middle"
                  fontFamily="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
                  fontSize={renderData.captionFontSize}
                  fontWeight={600}
                  fill={config.fgColor}
                >
                  {config.caption.trim()}
                </text>
              )}
            </svg>
          </div>
        ) : (
          <div className="w-full max-w-[320px] aspect-square rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-6 text-center">
            <QrCode className="h-10 w-10 text-slate-300 mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-700">No URL encoded yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Enter a valid link on the left to render a permanent QR matrix.
            </p>
          </div>
        )}

        {metrics.isValidUrl && (
          <p className="mt-4 max-w-full truncate font-mono text-xs text-slate-600 px-3">
            {metrics.normalizedUrl}
          </p>
        )}
      </div>

      {metrics.isLowContrast && (
        <div
          role="alert"
          className="mx-6 mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">
              Low color contrast ({metrics.contrastRatio.toFixed(1)}:1)
            </p>
            <p className="mt-0.5 text-amber-800">
              Phone cameras scan best when contrast is at least 4.5:1 between QR modules and
              background.
            </p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 tabular-nums">
          <span>Error correction: Level {effectiveLevel}</span>
          <span aria-hidden="true">·</span>
          <span>Payload: {metrics.byteLength} bytes</span>
          <span aria-hidden="true">·</span>
          <span>Contrast: {metrics.contrastRatio.toFixed(1)}:1</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onDownloadSvg}
            disabled={!metrics.isValidUrl}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Download SVG</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPng}
            disabled={!metrics.isValidUrl || isExportingPng}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{isExportingPng ? 'Rendering PNG...' : `Download PNG (${config.resolution}px)`}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCopyPng}
            disabled={!metrics.isValidUrl}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {copyState === 'copied' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>Copied to Clipboard</span>
              </>
            ) : copyState === 'error' ? (
              <span>Clipboard Unavailable</span>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Copy PNG Image</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSaveLocal}
            disabled={!metrics.isValidUrl}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {saveState === 'saved' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>Saved in Browser</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Save to History</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
