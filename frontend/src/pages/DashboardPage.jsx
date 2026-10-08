import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import StatsCard from '../components/StatsCard';
import LogViewer from '../components/LogViewer';
import api from '../services/api';
import { Cpu, HardDrive, Server, Play, Square, RotateCw, ExternalLink, Code2, FolderOpen, Database, Terminal, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { activeProject, fetchProjects } = useProjects();
  const [metrics, setMetrics] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [logs, setLogs] = useState([]);
  const [deploySuccessUrl, setDeploySuccessUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setDeploySuccessUrl('');
  }, [activeProject?.id]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await api.get('/monitoring/metrics/');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeploy = async () => {
    if (!activeProject) return;
    setDeploying(true);
    setLogs([`[DeployX] Initializing one-click build pipeline for ${activeProject.name}...`]);

    try {
      const res = await api.post(`/deployment/${activeProject.id}/deploy/`);
      setLogs(res.data.logs || []);
      if (res.data.public_url) {
        setDeploySuccessUrl(res.data.public_url);
      }
      fetchProjects();
    } catch (err) {
      const deploymentLogs = err.response?.data?.logs;
      setLogs((prev) => [
        ...prev,
        ...(Array.isArray(deploymentLogs) ? deploymentLogs : []),
        `[DeployX Error] ${err.message}`,
      ]);
    } finally {
      setDeploying(false);
    }
  };

  const handleContainerAction = async (action) => {
    if (!activeProject) return;
    try {
      await api.post(`/deployment/${activeProject.id}/action/`, { action });
      fetchProjects();
    } catch (err) {
      alert(`Action ${action} failed: ` + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">System Overview & Hosting Control</h2>
          <p className="text-xs text-slate-400 mt-1">
            Self-Hosted VPS Cloud Engine | Docker Isolated Containers | MySQL Provisioner
          </p>
        </div>

        {activeProject && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="px-5 py-2.5 rounded-xl gradient-button text-white font-bold text-xs shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Rocket className="w-4 h-4" />
              <span>{deploying ? 'Building Image...' : 'One-Click Deploy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Resource Usage Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="CPU Usage"
          icon={Cpu}
          value={`${metrics?.cpu?.usage_percent || 12}%`}
          subtext={`${metrics?.cpu?.cores || 4} Cores`}
          percent={metrics?.cpu?.usage_percent || 12}
          color="indigo"
        />
        <StatsCard
          title="RAM Memory"
          icon={Server}
          value={`${metrics?.memory?.used_gb || 1.4} GB`}
          subtext={`/ ${metrics?.memory?.total_gb || 8} GB (${metrics?.memory?.usage_percent || 18}%)`}
          percent={metrics?.memory?.usage_percent || 18}
          color="cyan"
        />
        <StatsCard
          title="Disk Storage"
          icon={HardDrive}
          value={`${metrics?.storage?.used_gb || 14.2} GB`}
          subtext={`/ ${metrics?.storage?.total_gb || 80} GB (${metrics?.storage?.usage_percent || 17}%)`}
          percent={metrics?.storage?.usage_percent || 17}
          color="emerald"
        />
        <StatsCard
          title="Active Containers"
          icon={Rocket}
          value={`${metrics?.containers?.running || 1}`}
          subtext={`/ ${metrics?.containers?.total || 1} Total Projects`}
          percent={100}
          color="amber"
        />
      </div>

      {/* Active Project Management Section */}
      {activeProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Project Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Active Application</span>
                <h3 className="text-xl font-bold text-white capitalize">{activeProject.name}</h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  activeProject.status === 'running'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 pulse-green'
                    : activeProject.status === 'building'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeProject.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-500">Framework:</span>
                <span className="font-semibold text-cyan-400 uppercase">{activeProject.framework}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-500">Host Port:</span>
                <span className="font-semibold text-slate-200">{activeProject.port || 8001}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-500">Container ID:</span>
                <span className="font-semibold text-slate-400 truncate max-w-[140px]">{activeProject.container_id || 'sandbox-cnt'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Target CPU / RAM:</span>
                <span className="font-semibold text-slate-300">{activeProject.cpu_limit} / {activeProject.ram_limit}</span>
              </div>
            </div>

            {/* Container Control Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleContainerAction('start')}
                className="flex-1 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Start
              </button>
              <button
                onClick={() => handleContainerAction('restart')}
                className="flex-1 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" /> Restart
              </button>
              <button
                onClick={() => handleContainerAction('stop')}
                className="flex-1 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Square className="w-3.5 h-3.5" /> Stop
              </button>
            </div>

            {/* Live URL Link */}
            {activeProject.port && (
              <a
                href={deploySuccessUrl || `http://${window.location.hostname}:${activeProject.port}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-indigo-950/40 transition-colors"
              >
                <span>Access Live URL ({deploySuccessUrl || `http://${window.location.hostname}:${activeProject.port}`})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Log Output Streamer */}
          <div className="lg:col-span-2">
            <LogViewer logs={logs} title={`Deployment & Build Output - ${activeProject.name}`} />
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Server className="w-16 h-16 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">No Active Project Selected</h3>
          <p className="text-xs text-slate-400 mt-1">Create your first website or web application to begin deployment.</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 px-6 py-2.5 rounded-xl gradient-button text-white text-xs font-bold shadow-lg"
          >
            Create New Project
          </button>
        </div>
      )}

      {/* Quick Access Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <button
          onClick={() => navigate('/file-manager')}
          className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-left glass-panel-hover flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-indigo-950/60 text-indigo-400">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">File Manager</h4>
            <p className="text-[11px] text-slate-400">Upload, edit, & extract ZIP</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/code-editor')}
          className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-left glass-panel-hover flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-cyan-950/60 text-cyan-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Monaco Editor</h4>
            <p className="text-[11px] text-slate-400">Browser code editing</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/databases')}
          className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-left glass-panel-hover flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">MySQL Databases</h4>
            <p className="text-[11px] text-slate-400">Provision isolated DBs</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/terminal')}
          className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-left glass-panel-hover flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-amber-950/60 text-amber-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Web Terminal</h4>
            <p className="text-[11px] text-slate-400">Run CLI commands & logs</p>
          </div>
        </button>
      </div>
    </div>
  );

};

export default DashboardPage;
