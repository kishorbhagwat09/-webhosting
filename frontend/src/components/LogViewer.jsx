import React, { useState } from 'react';
import { Terminal as TerminalIcon, Copy, Check } from 'lucide-react';

const LogViewer = ({ logs = [], title = "Deployment Logs" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = Array.isArray(logs) ? logs.join('\n') : logs;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      <div className="bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span>{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-96 min-h-[160px] space-y-1">
        {logs.length === 0 ? (
          <span className="text-slate-500 italic">No logs recorded yet.</span>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-slate-600 select-none">{(idx + 1).toString().padStart(2, '0')}</span>
              <span className={log.includes('Error') ? 'text-rose-400 font-semibold' : log.includes('Successful') ? 'text-emerald-400 font-semibold' : log.includes('[DeployX]') ? 'text-indigo-300' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogViewer;
