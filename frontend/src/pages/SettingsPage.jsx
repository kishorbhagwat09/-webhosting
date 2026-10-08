import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Save, Server, Check } from 'lucide-react';
import api from '../services/api';

const SettingsPage = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile/', {
        first_name: firstName,
        last_name: lastName,
        email: email,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      alert('Profile update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h2 className="text-2xl font-black text-white tracking-tight">Account & Server Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Manage user account profile and review server configuration parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> Profile Information
          </h3>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 outline-none cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl gradient-button text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Profile Saved!' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        {/* Server & System Specs Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" /> Hostinger VPS Infrastructure
          </h3>

          <div className="space-y-2 text-xs font-mono text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Operating System:</span>
              <span className="font-semibold text-slate-200">Ubuntu Server 22.04 LTS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Database Engine:</span>
              <span className="font-semibold text-emerald-400">MySQL 8.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Container Engine:</span>
              <span className="font-semibold text-cyan-400">Docker v24.0.5</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Reverse Proxy:</span>
              <span className="font-semibold text-indigo-400">Nginx 1.24</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Backend Framework:</span>
              <span className="font-semibold text-slate-200">Django 5 + REST API</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
