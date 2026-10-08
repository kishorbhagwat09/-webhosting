import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FolderOpen,
  Code2,
  Database,
  Globe,
  Terminal,
  Settings,
  CloudLightning,
  ChevronRight,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const Sidebar = () => {
  const { activeProject } = useProjects();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Projects', icon: FolderGit2, path: '/projects' },
    { label: 'File Manager', icon: FolderOpen, path: '/file-manager' },
    { label: 'Code Editor', icon: Code2, path: '/code-editor' },
    { label: 'MySQL Databases', icon: Database, path: '/databases' },
    { label: 'Domains', icon: Globe, path: '/domains' },
    { label: 'Terminal & Logs', icon: Terminal, path: '/terminal' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/60 min-h-screen flex flex-col justify-between p-4 z-20">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl gradient-button flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <CloudLightning className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight gradient-text">DeployX</h1>
            <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full">
              Cloud Hosting
            </span>
          </div>
        </div>

        {/* Active Project Pill */}
        {activeProject && (
          <div className="mb-6 p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active Workspace</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green"></span>
            </div>
            <div className="font-semibold text-sm text-slate-200 truncate flex items-center gap-1.5">
              <span className="capitalize">{activeProject.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded uppercase">
                {activeProject.framework}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-500 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
        <span>DeployX v1.0.0</span>
        <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
          Hostinger VPS
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
