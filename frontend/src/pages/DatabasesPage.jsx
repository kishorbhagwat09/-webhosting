import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, Plus, Copy, Check, Key, Trash2 } from 'lucide-react';

const DatabasesPage = () => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbNameInput, setDbNameInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/databases/');
      setDatabases(res.data);
    } catch (err) {
      console.error('Failed to fetch databases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    if (!dbNameInput.trim()) return;
    setCreating(true);
    try {
      await api.post('/databases/', { name: dbNameInput.trim() });
      setDbNameInput('');
      fetchDatabases();
    } catch (err) {
      alert('Database creation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (id, str) => {
    navigator.clipboard.writeText(str);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetPassword = async (id) => {
    try {
      const res = await api.post(`/databases/${id}/`);
      alert(`Password reset successful! New Password: ${res.data.db_password}`);
      fetchDatabases();
    } catch (err) {
      alert('Password reset failed: ' + err.message);
    }
  };

  const handleDeleteDatabase = async (id, dbName) => {
    if (confirm(`Are you sure you want to drop database "${dbName}"?`)) {
      try {
        await api.delete(`/databases/${id}/`);
        fetchDatabases();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded uppercase">
              MySQL Provisioner
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">MySQL Database Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Provision isolated MySQL databases with auto-generated credentials.</p>
        </div>

        {/* Quick Create Form */}
        <form onSubmit={handleCreateDatabase} className="flex items-center gap-2">
          <input
            type="text"
            required
            value={dbNameInput}
            onChange={(e) => setDbNameInput(e.target.value)}
            placeholder="e.g. app_production"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500 w-48"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2.5 rounded-xl gradient-button text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> {creating ? 'Creating...' : 'Create MySQL DB'}
          </button>
        </form>
      </div>

      {/* Databases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {databases.length === 0 && !loading && (
          <div className="md:col-span-2 glass-panel p-12 rounded-3xl text-center border border-slate-800">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">No MySQL Databases Provisioned</h3>
            <p className="text-xs text-slate-400 mt-1">Create a database above to connect your Django, Flask, Node, or PHP app.</p>
          </div>
        )}

        {databases.map((db) => (
          <div key={db.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">MySQL 8.0</span>
                <h3 className="text-lg font-bold text-white">{db.name}</h3>
              </div>
              <button
                onClick={() => handleDeleteDatabase(db.id, db.db_name)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Drop Database"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-500">DB Name:</span>
                <span className="font-semibold text-slate-200">{db.db_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DB User:</span>
                <span className="font-semibold text-slate-200">{db.db_user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="font-semibold text-emerald-400">••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Host & Port:</span>
                <span className="text-slate-300">{db.host}:{db.port}</span>
              </div>
            </div>

            {/* Connection String Box */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="truncate font-mono text-[11px] text-slate-300">
                {db.connection_string}
              </div>
              <button
                onClick={() => handleCopy(db.id, db.connection_string)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Connection String"
              >
                {copiedId === db.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleResetPassword(db.id)}
                className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-emerald-400" /> Reset Password
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabasesPage;
