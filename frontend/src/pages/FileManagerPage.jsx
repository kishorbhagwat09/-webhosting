import React, { useCallback, useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import api from '../services/api';
import {
  Folder,
  FileCode,
  Trash2,
  Upload,
  Archive,
  ChevronRight,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FileManagerPage = () => {
  const { activeProject } = useProjects();
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDirCreate, setIsDirCreate] = useState(false);
  const navigate = useNavigate();

  const loadFiles = useCallback(async (path = '') => {
    if (!activeProject) return;
    setLoading(true);
    try {
      const res = await api.get(`/filemanager/${activeProject.id}/list/?path=${encodeURIComponent(path)}`);
      setFiles(res.data.files);
      setCurrentPath(res.data.current_path);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    if (activeProject) {
      loadFiles(currentPath);
    }
  }, [activeProject, currentPath, loadFiles]);

  const handleItemClick = (file) => {
    if (file.is_directory) {
      loadFiles(file.path);
    } else {
      // Navigate to Monaco Editor with selected file path
      navigate(`/code-editor?path=${encodeURIComponent(file.path)}`);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeProject) return;
    try {
      await api.post(`/filemanager/${activeProject.id}/create/`, {
        name: newItemName.trim(),
        is_directory: isDirCreate,
        parent_path: currentPath,
      });
      setShowCreateModal(false);
      setNewItemName('');
      loadFiles(currentPath);
    } catch (err) {
      alert('Create failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteItem = async (e, filePath) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${filePath}"?`)) return;
    try {
      await api.post(`/filemanager/${activeProject.id}/delete/`, { path: filePath });
      loadFiles(currentPath);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeProject) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('parent_path', currentPath);

    if (file.name.endsWith('.zip')) {
      const extract = confirm('ZIP file detected! Would you like DeployX to extract files automatically?');
      formData.append('extract_zip', extract ? 'true' : 'false');
    }

    setUploading(true);
    try {
      await api.post(`/filemanager/${activeProject.id}/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      loadFiles(currentPath);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    loadFiles(parts.join('/'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">cPanel File Manager</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse, upload, edit code, and extract ZIP archives for project: <strong className="text-slate-200">{activeProject?.name || 'None'}</strong>
          </p>
        </div>

        {activeProject && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsDirCreate(false);
                setShowCreateModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <FilePlus className="w-4 h-4 text-indigo-400" /> New File
            </button>
            <button
              onClick={() => {
                setIsDirCreate(true);
                setShowCreateModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-cyan-400" /> New Folder
            </button>
            <label className="px-3.5 py-2 rounded-xl gradient-button text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload File / ZIP'}
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {/* Path Breadcrumbs */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex items-center gap-2 text-xs font-mono">
        <button onClick={() => loadFiles('')} className="text-indigo-400 font-bold hover:underline">
          root
        </button>
        {currentPath.split('/').filter(Boolean).map((part, idx, arr) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              onClick={() => loadFiles(arr.slice(0, idx + 1).join('/'))}
              className="text-slate-300 hover:text-white hover:underline"
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* File Explorer Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Path</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {currentPath && (
              <tr onClick={navigateUp} className="hover:bg-slate-900/60 cursor-pointer text-indigo-300">
                <td colSpan={4} className="py-2.5 px-4 font-semibold flex items-center gap-2">
                  <Folder className="w-4 h-4 text-indigo-400" /> .. (Go Back Up)
                </td>
              </tr>
            )}

            {files.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                  This directory is empty. Create a file or upload source code.
                </td>
              </tr>
            )}

            {files.map((file) => (
              <tr
                key={file.path}
                onClick={() => handleItemClick(file)}
                className="hover:bg-slate-900/80 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-4 flex items-center gap-2.5 font-medium text-slate-200">
                  {file.is_directory ? (
                    <Folder className="w-4 h-4 text-cyan-400" />
                  ) : file.name.endsWith('.zip') ? (
                    <Archive className="w-4 h-4 text-amber-400" />
                  ) : (
                    <FileCode className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>{file.name}</span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{file.path}</td>
                <td className="py-3 px-4 text-slate-400">{file.is_directory ? '--' : `${(file.size / 1024).toFixed(1)} KB`}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => handleDeleteItem(e, file.path)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating File/Folder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New {isDirCreate ? 'Folder' : 'File'}</h3>
            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={isDirCreate ? 'Folder name' : 'e.g. server.js or index.html'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl gradient-button text-white font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManagerPage;
