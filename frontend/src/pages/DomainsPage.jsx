import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Globe, ShieldCheck, Check, ExternalLink } from 'lucide-react';
import api from '../services/api';

const DomainsPage = () => {
  const { activeProject, fetchProjects } = useProjects();
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleDomainUpdate = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    setUpdating(true);
    try {
      await api.put(`/projects/${activeProject.id}/`, {
        custom_domain: customDomainInput.trim(),
      });
      fetchProjects();
      setCustomDomainInput('');
      alert('Custom domain configuration saved successfully!');
    } catch (err) {
      alert('Failed to update domain: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h2 className="text-2xl font-black text-white tracking-tight">Domains & Reverse Proxy Routing</h2>
        <p className="text-xs text-slate-400 mt-1">
          Route public URLs and custom domain names (`mywebsite.com`) to Docker containers via Nginx.
        </p>
      </div>

      {activeProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Default Domain Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Default Subdomain</span>
                <h3 className="text-lg font-bold text-white">{activeProject.name}.deployx.app</h3>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Active & Routed
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Port:</span>
                <span className="text-slate-200">{activeProject.port || 8000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SSL Certificate:</span>
                <span className="text-cyan-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Let's Encrypt HTTPS
                </span>
              </div>
            </div>

            <a
              href={`${window.location.protocol}//${activeProject.custom_domain || window.location.hostname}:${activeProject.port}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Test Public Subdomain Route</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Custom Domain Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Custom Domain Binding</h3>
            <p className="text-xs text-slate-400">
              Point your A Record to VPS IP address `185.199.108.153` then enter your domain name below.
            </p>

            <form onSubmit={handleDomainUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Domain Name</label>
                <input
                  type="text"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="e.g. portfolio.com or app.mydomain.org"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              {activeProject.custom_domain && (
                <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/60 text-xs text-indigo-300 flex items-center justify-between">
                  <span>Current Domain: <strong>{activeProject.custom_domain}</strong></span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold">Bound</span>
                </div>
              )}

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 rounded-xl gradient-button text-white text-xs font-bold shadow-lg transition-all"
              >
                {updating ? 'Configuring Nginx...' : 'Save & Attach Domain'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Globe className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">Select a Project First</h3>
          <p className="text-xs text-slate-400 mt-1">Choose a project from the top navbar to configure domain routing.</p>
        </div>
      )}
    </div>
  );
};

export default DomainsPage;
