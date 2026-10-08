import React from 'react';
import WebTerminal from '../components/WebTerminal';
import LogViewer from '../components/LogViewer';
import { useProjects } from '../context/ProjectContext';

const TerminalPage = () => {
  const { activeProject } = useProjects();

  const sampleLogs = [
    `[DeployX Server] Telemetry active for workspace: ${activeProject?.name || 'sandbox'}`,
    `[Container Engine] Port ${activeProject?.port || 8000} listening for incoming connections`,
    `[Nginx Proxy] Host routing table updated dynamically`,
    `[Docker Daemon] Health Check status: HEALTHY`,
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h2 className="text-2xl font-black text-white tracking-tight">Interactive Web Terminal & System Logs</h2>
        <p className="text-xs text-slate-400 mt-1">
          Execute project management commands (`npm install`, `python manage.py migrate`, `git pull`) and monitor container logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <WebTerminal />
        </div>
        <div>
          <LogViewer logs={sampleLogs} title={`Live System Log Output - ${activeProject?.name || 'Server'}`} />
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;
