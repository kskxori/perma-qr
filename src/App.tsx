import { useEffect, useMemo, useState } from 'react';
import { DeployGuideSection } from './components/DeployGuideSection';
import { Header } from './components/Header';
import { HowItWorksSection } from './components/HowItWorksSection';
import { QrControlsPanel } from './components/QrControlsPanel';
import { QrPreviewPanel } from './components/QrPreviewPanel';
import { SavedCodesSection } from './components/SavedCodesSection';
import type { QrConfig, SavedQrItem } from './types/qr';
import {
  buildDownloadFilename,
  buildStandaloneSvg,
  computeQrMetrics,
  DEFAULT_QR_CONFIG,
  normalizeUrlInput,
  renderQrToPngBlob,
  triggerBlobDownload,
} from './utils/qr';

const STORAGE_KEY = 'permaqr_saved_v1';

function readSavedItems(): SavedQrItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      config: { ...DEFAULT_QR_CONFIG, ...(item.config ?? {}) },
    }));
  } catch {
    return [];
  }
}

function buildLabelFromUrl(url: string): string {
  const { normalizedUrl } = normalizeUrlInput(url);
  try {
    const parsed = new URL(normalizedUrl);
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.hostname.replace(/^www\./, '')}${path}`.slice(0, 64);
  } catch {
    return url.slice(0, 64);
  }
}

export default function App() {
  const [config, setConfig] = useState<QrConfig>(DEFAULT_QR_CONFIG);
  const [savedItems, setSavedItems] = useState<SavedQrItem[]>(() => readSavedItems());
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [isExportingPng, setIsExportingPng] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [savedItems]);

  const metrics = useMemo(() => computeQrMetrics(config), [config]);

  const handleConfigChange = (patch: Partial<QrConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_QR_CONFIG);
  };

  const handleExportSvg = (targetConfig: QrConfig = config) => {
    const svgString = buildStandaloneSvg(targetConfig);
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    triggerBlobDownload(blob, buildDownloadFilename(targetConfig.url, 'svg'));
  };

  const handleExportPng = async (targetConfig: QrConfig = config) => {
    setIsExportingPng(true);
    try {
      const blob = await renderQrToPngBlob(targetConfig);
      if (!blob) return;
      triggerBlobDownload(blob, buildDownloadFilename(targetConfig.url, 'png'));
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopyPng = async () => {
    if (!metrics.isValidUrl) return;
    try {
      const blob = await renderQrToPngBlob(config);
      if (!blob || typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
        setCopyState('error');
        setTimeout(() => setCopyState('idle'), 2200);
        return;
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2200);
    }
  };

  const handleSaveLocal = () => {
    if (!metrics.isValidUrl) return;
    const newItem: SavedQrItem = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label:
        config.showCaption && config.caption.trim()
          ? config.caption.trim()
          : buildLabelFromUrl(config.url),
      config: { ...config, url: metrics.normalizedUrl },
      createdAt: new Date().toISOString(),
    };

    setSavedItems((prev) => [newItem, ...prev.slice(0, 49)]);
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2000);
  };

  const handleLoadSaved = (savedConfig: QrConfig) => {
    setConfig({ ...DEFAULT_QR_CONFIG, ...savedConfig });
    const generatorEl = document.getElementById('generator');
    generatorEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteSaved = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllSaved = () => {
    setSavedItems([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header canExport={metrics.isValidUrl} onExportSvg={() => handleExportSvg(config)} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10 sm:py-12 space-y-20">
        <section id="generator" className="scroll-mt-8 space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-medium text-slate-500">
              100% Client-Side · Direct ISO/IEC 18004 Encoding · Zero Redirects
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              Turn any link into a permanent QR code that never expires
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Customize module patterns, corner eye shapes, colors, gradients, and even form
              letters right inside the QR matrix. Zero short-link middlemen—host free on GitHub
              with Vercel or Netlify.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <QrControlsPanel
                config={config}
                metrics={metrics}
                onChange={handleConfigChange}
                onReset={handleReset}
              />
            </div>

            <div className="lg:col-span-5">
              <QrPreviewPanel
                config={config}
                metrics={metrics}
                copyState={copyState}
                saveState={saveState}
                isExportingPng={isExportingPng}
                onDownloadSvg={() => handleExportSvg(config)}
                onDownloadPng={() => handleExportPng(config)}
                onCopyPng={handleCopyPng}
                onSaveLocal={handleSaveLocal}
              />
            </div>
          </div>
        </section>

        <HowItWorksSection />

        <SavedCodesSection
          items={savedItems}
          canSaveCurrent={metrics.isValidUrl}
          onSaveCurrent={handleSaveLocal}
          onLoadItem={handleLoadSaved}
          onDownloadSvgItem={(itemConfig) => handleExportSvg(itemConfig)}
          onDownloadPngItem={(itemConfig) => handleExportPng(itemConfig)}
          onDeleteItem={handleDeleteSaved}
          onClearAll={handleClearAllSaved}
        />

        <DeployGuideSection />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>PermaQR — Static client-side QR generator. No server tracking or expiry.</span>
          <div className="flex items-center gap-5">
            <a href="#generator" className="hover:text-slate-900 transition-colors">
              Generator
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              Why Permanent
            </a>
            <a href="#saved" className="hover:text-slate-900 transition-colors">
              Saved Codes
            </a>
            <a href="#deploy" className="hover:text-slate-900 transition-colors">
              Deploy Free
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
