import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { User, LogOut, ChevronDown, Plus, Server, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { projects, activeProject, setActiveProject } = useProjects();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 glass-panel border-b border-slate-800/60 px-6 flex items-center justify-between z-10 sticky top-0">
      {/* Left: Project Selector */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-sm text-slate-200 font-medium transition-colors"
        >
          <Server className="w-4 h-4 text-cyan-400" />
          <span>{activeProject ? activeProject.name : 'Select Project'}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
        </button>

        {dropdownOpen && (
          <div className="absolute top-12 left-0 w-64 glass-panel border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
            <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
              Your Projects ({projects.length})
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 my-1">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setActiveProject(proj);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    activeProject?.id === proj.id
                      ? 'bg-indigo-600/30 text-white font-medium border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{proj.name}</span>
                  {activeProject?.id === proj.id && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-800/80 pt-1 mt-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/projects');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-950/40 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: User Menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-3 p-1.5 pl-3 rounded-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <span className="text-xs font-semibold text-slate-300">{user?.username || 'Developer'}</span>
          <div className="w-8 h-8 rounded-full gradient-cyan flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.username ? user.username[0].toUpperCase() : 'D'}
          </div>
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-12 w-48 glass-panel border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50">
            <div className="px-3 py-2 border-b border-slate-800 text-xs">
              <p className="font-semibold text-slate-200">{user?.username}</p>
              <p className="text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setUserMenuOpen(false);
                navigate('/settings');
              }}
              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors mt-1"
            >
              <User className="w-3.5 h-3.5" /> Profile & Account
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
