import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Save, FileCode, Check } from 'lucide-react';
import api from '../services/api';
import { useProjects } from '../context/ProjectContext';

const MonacoEditorTab = ({ activeFilePath, onFileSave }) => {
  const { activeProject } = useProjects();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Determine Monaco language
  const getLanguage = (path) => {
    if (!path) return 'html';
    const ext = path.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'sql':
        return 'sql';
      default:
        return 'plaintext';
    }
  };

  useEffect(() => {
    if (activeProject && activeFilePath) {
      setLoading(true);
      api
        .get(`/filemanager/${activeProject.id}/content/?path=${encodeURIComponent(activeFilePath)}`)
        .then((res) => {
          setContent(res.data.content);
        })
        .catch((err) => {
          setContent(`// Error loading file: ${err.message}`);
        })
        .finally(() => setLoading(false));
    }
  }, [activeProject, activeFilePath]);

  const handleSave = async () => {
    if (!activeProject || !activeFilePath) return;
    setSaving(true);
    try {
      await api.post(`/filemanager/${activeProject.id}/content/`, {
        path: activeFilePath,
        content: content,
      });
      setSavedSuccess(true);
      if (onFileSave) onFileSave();
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      alert('Failed to save file: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!activeFilePath) {
    return (
      <div className="h-full glass-panel rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 border border-slate-800">
        <FileCode className="w-16 h-16 text-slate-700 mb-4" />
        <h3 className="text-lg font-bold text-slate-300">No File Opened</h3>
        <p className="text-xs text-slate-500 mt-1 text-center max-w-sm">
          Select a file from the File Manager tree view to begin editing code in Monaco Editor.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-800">
      {/* Editor Header Bar */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-mono font-semibold text-slate-200">{activeFilePath}</span>
          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
            {getLanguage(activeFilePath)}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all duration-200 disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Save File
            </>
          )}
        </button>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 bg-[#1e1e1e] relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            Loading file contents into Monaco Editor...
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguage(activeFilePath)}
            theme="vs-dark"
            value={content}
            onChange={(val) => setContent(val || '')}
            options={{
              fontSize: 13,
              minimap: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              wordWrap: 'on',
              lineNumbers: 'on',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MonacoEditorTab;
