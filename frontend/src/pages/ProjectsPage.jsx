import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Plus, Trash2, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectsPage = () => {
  const { projects, createProject, deleteProject, setActiveProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [framework, setFramework] = useState('static');
  const [gitRepo, setGitRepo] = useState('');
  const [cpuLimit, setCpuLimit] = useState('0.5');
  const [ramLimit, setRamLimit] = useState('512M');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      await createProject({
        name: name.trim(),
        framework,
        git_repo: gitRepo,
        cpu_limit: cpuLimit,
        ram_limit: ramLimit,
      });
      setShowModal(false);
      setName('');
      setGitRepo('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? All source files will be removed.')) {
      await deleteProject(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Your Hosting Projects</h2>
          <p className="text-xs text-slate-400 mt-1">Manage static sites, Node.js servers, React, & Python Django/Flask apps.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl gradient-button text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => {
              setActiveProject(proj);
              navigate('/dashboard');
            }}
            className="glass-panel p-6 rounded-3xl border border-slate-800 glass-panel-hover cursor-pointer relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md">
                  {proj.framework}
                </span>
                <button
                  onClick={(e) => handleDelete(e, proj.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-1 capitalize">{proj.name}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                {proj.git_repo ? `Repository: ${proj.git_repo}` : 'Uploaded source code project'}
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 font-mono mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={proj.status === 'running' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {proj.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Host Port:</span>
                  <span className="text-slate-200">{proj.port || '8000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Limits:</span>
                  <span className="text-slate-300">{proj.cpu_limit} CPU | {proj.ram_limit} RAM</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pt-2 border-t border-slate-800/60">
              <span>Open Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create New Cloud Project</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. my-awesome-web-app"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Application Type / Framework</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value="static">Static Website (HTML / CSS / JS)</option>
                  <option value="react">React Application (Vite / CRA)</option>
                  <option value="node">Node.js Express / Web Server</option>
                  <option value="django">Python Django Framework</option>
                  <option value="flask">Python Flask Microframework</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Git Repository URL (Optional)</label>
                <input
                  type="url"
                  value={gitRepo}
                  onChange={(e) => setGitRepo(e.target.value)}
                  placeholder="https://github.com/user/repository.git"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">CPU Allocation</label>
                  <select
                    value={cpuLimit}
                    onChange={(e) => setCpuLimit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    <option value="0.25">0.25 vCPU</option>
                    <option value="0.5">0.50 vCPU</option>
                    <option value="1.0">1.00 vCPU</option>
                    <option value="2.0">2.00 vCPU</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">RAM Memory Limit</label>
                  <select
                    value={ramLimit}
                    onChange={(e) => setRamLimit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    <option value="256M">256 MB</option>
                    <option value="512M">512 MB</option>
                    <option value="1G">1.0 GB</option>
                    <option value="2G">2.0 GB</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-xl gradient-button text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all mt-4 disabled:opacity-50"
              >
                {creating ? 'Provisioning Workspace...' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
