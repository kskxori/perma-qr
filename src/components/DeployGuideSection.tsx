import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

const GIT_COMMANDS = `git init
git add .
git commit -m "Initial commit: permanent QR generator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/perma-qr.git
git push -u origin main`;

export function DeployGuideSection() {
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopyCommands = async () => {
    try {
      await navigator.clipboard.writeText(GIT_COMMANDS);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      setCopiedCmd(false);
    }
  };

  return (
    <section id="deploy" className="scroll-mt-8 space-y-6">
      <div className="max-w-2xl space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Host This Website for Free Forever
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          PermaQR runs 100% as a static web app in the browser with no backend server, no database,
          and no paid APIs. Both <span className="font-mono text-xs text-slate-800">vercel.json</span>{' '}
          and <span className="font-mono text-xs text-slate-800">netlify.toml</span> are included so
          you can deploy directly from GitHub on a free hobby plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="text-xs font-semibold text-blue-700 tabular-nums">01. Upload to GitHub</div>
          <h3 className="text-base font-semibold text-slate-900">Push project files</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Create an empty repository on GitHub and push this folder. No environment variables or
            API keys are needed.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="text-xs font-semibold text-blue-700 tabular-nums">
            02. Connect Vercel or Netlify
          </div>
          <h3 className="text-base font-semibold text-slate-900">Import repository</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sign in with GitHub on Vercel or Netlify, pick your repository, and keep the detected
            Vite build settings (<span className="font-mono text-xs">npm run build</span>{' '}
            <span aria-hidden="true">-&gt;</span> <span className="font-mono text-xs">dist</span>).
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="text-xs font-semibold text-blue-700 tabular-nums">
            03. Live on HTTPS ($0/mo)
          </div>
          <h3 className="text-base font-semibold text-slate-900">Share and generate anytime</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            You receive a permanent free URL (such as{' '}
            <span className="font-mono text-xs">your-app.vercel.app</span> or{' '}
            <span className="font-mono text-xs">your-app.netlify.app</span>) with automatic SSL.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-3">
          <span className="text-xs font-medium text-slate-300">
            Terminal commands to push to GitHub
          </span>
          <button
            type="button"
            onClick={handleCopyCommands}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {copiedCmd ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copy Commands</span>
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-xs leading-6 text-slate-200">
          <code>{GIT_COMMANDS}</code>
        </pre>
      </div>
    </section>
  );
}
