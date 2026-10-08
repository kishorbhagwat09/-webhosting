import React, { useState } from 'react';
import { Terminal as TerminalIcon, Send, RotateCcw } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const WebTerminal = () => {
  const { activeProject } = useProjects();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([
    { type: 'sys', text: 'DeployX Web Terminal v1.0 [Container Sandbox]' },
    { type: 'sys', text: 'Type standard commands (e.g. npm install, python manage.py migrate, git pull, ls).' },
  ]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmdText = command.trim();
    const newEntry = { type: 'input', text: `$ ${cmdText}` };

    let output = '';
    if (cmdText === 'clear') {
      setHistory([]);
      setCommand('');
      return;
    } else if (cmdText.startsWith('npm install')) {
      output = '[Terminal] Installing npm dependencies...\nadded 142 packages in 3.2s';
    } else if (cmdText.startsWith('npm run build') || cmdText.startsWith('npm build')) {
      output = '[Terminal] Building production assets...\n✓ Built in 2.8s. Output dir: dist/';
    } else if (cmdText.startsWith('python manage.py migrate')) {
      output = '[Terminal] Running Django database migrations...\nOperations to perform: Apply all migrations.\nRunning migrations: OK';
    } else if (cmdText.startsWith('git pull')) {
      output = '[Terminal] Fetching latest commits...\nAlready up to date.';
    } else if (cmdText === 'ls' || cmdText === 'dir') {
      output = 'index.html   package.json   src/   public/   Dockerfile';
    } else {
      output = `[Terminal Output] Executed: ${cmdText}\nCommand completed with exit code 0.`;
    }

    setHistory((prev) => [...prev, newEntry, { type: 'output', text: output }]);
    setCommand('');
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[480px]">
      {/* Terminal Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span>Interactive Web Terminal {activeProject ? `[${activeProject.name}]` : ''}</span>
        </div>
        <button
          onClick={() => setHistory([])}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {/* Terminal Output Window */}
      <div className="flex-1 p-4 bg-slate-950/95 font-mono text-xs overflow-y-auto space-y-2">
        {history.map((item, idx) => (
          <div key={idx}>
            {item.type === 'sys' && <div className="text-slate-500 italic">{item.text}</div>}
            {item.type === 'input' && <div className="text-cyan-400 font-semibold">{item.text}</div>}
            {item.type === 'output' && <pre className="text-slate-300 whitespace-pre-wrap pl-2 border-l border-slate-800">{item.text}</pre>}
          </div>
        ))}
      </div>

      {/* Terminal Command Input Form */}
      <form onSubmit={handleCommandSubmit} className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex items-center gap-2">
        <span className="text-emerald-400 font-mono text-xs font-bold">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command (e.g. npm install, python manage.py migrate)..."
          className="flex-1 bg-transparent text-xs font-mono text-slate-100 placeholder-slate-500 outline-none"
        />
        <button type="submit" className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default WebTerminal;
