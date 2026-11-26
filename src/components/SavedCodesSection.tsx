import { Bookmark, Download, Search, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { QrConfig, SavedQrItem } from '../types/qr';
import { buildQrRenderData, getEffectiveErrorLevel } from '../utils/qr';

interface SavedCodesSectionProps {
  items: SavedQrItem[];
  canSaveCurrent: boolean;
  onSaveCurrent: () => void;
  onLoadItem: (config: QrConfig) => void;
  onDownloadSvgItem: (config: QrConfig) => void;
  onDownloadPngItem: (config: QrConfig) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

function MiniQrThumb({ config }: { config: QrConfig }) {
  const renderData = useMemo(() => buildQrRenderData({ ...config, margin: 1, showCaption: false }), [config]);
  if (!renderData) return null;

  return (
    <svg
      viewBox={`0 0 ${renderData.totalModules} ${renderData.totalModules}`}
      className="h-14 w-14 shrink-0 rounded border border-slate-200"
      aria-hidden="true"
    >
      <rect width={renderData.totalModules} height={renderData.totalModules} fill={config.bgColor} />
      <path d={renderData.dataPath} fill={config.fgColor} />
      {renderData.letterDataPath && (
        <path d={renderData.letterDataPath} fill={config.letterArtColor} />
      )}
      <path
        d={renderData.finderRingPath}
        fill={config.customCornerColorEnabled ? config.cornerColor : config.fgColor}
        fillRule="evenodd"
      />
      <path
        d={renderData.finderDotPath}
        fill={config.customCornerColorEnabled ? config.cornerColor : config.fgColor}
      />
    </svg>
  );
}

export function SavedCodesSection({
  items,
  canSaveCurrent,
  onSaveCurrent,
  onLoadItem,
  onDownloadSvgItem,
  onDownloadPngItem,
  onDeleteItem,
  onClearAll,
}: SavedCodesSectionProps) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || item.config.url.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <section id="saved" className="scroll-mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Saved in Your Browser
          </h2>
          <p className="text-sm text-slate-600">
            Stored privately in local browser storage with zero cloud accounts required.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter saved links..."
                aria-label="Filter saved QR codes"
                className="w-56 rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <button
              type="button"
              onClick={onClearAll}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-slate-300 mb-3" aria-hidden="true" />
          <h3 className="text-base font-semibold text-slate-900">No saved QR codes yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Save any URL configuration here to re-export SVG or PNG files later without re-entering
            colors, corner styles, or letters.
          </p>
          <button
            type="button"
            onClick={onSaveCurrent}
            disabled={!canSaveCurrent}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            <span>Save Current QR Code</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">No saved QR codes match "{query}".</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-5 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <MiniQrThumb config={item.config} />
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {item.label}
                  </div>
                  <div className="font-mono text-xs text-slate-600 truncate">
                    {item.config.url}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 tabular-nums">
                    <span>Level {getEffectiveErrorLevel(item.config)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.config.dotStyle}</span>
                    <span aria-hidden="true">·</span>
                    <span>Saved {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onLoadItem(item.config)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Load</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadSvgItem(item.config)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>SVG</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadPngItem(item.config)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  aria-label={`Delete saved QR code for ${item.label}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
