import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import MonacoEditorTab from '../components/MonacoEditorTab';
import api from '../services/api';
import { Folder, FileCode, ChevronRight } from 'lucide-react';

const CodeEditorPage = () => {
  const { activeProject } = useProjects();
  const [searchParams] = useSearchParams();
  const initialPath = searchParams.get('path') || 'index.html';
  const [activeFilePath, setActiveFilePath] = useState(initialPath);
  const [projectFiles, setProjectFiles] = useState([]);

  useEffect(() => {
    if (activeProject) {
      api.get(`/filemanager/${activeProject.id}/list/`).then((res) => {
        setProjectFiles(res.data.files || []);
      }).catch(console.error);
    }
  }, [activeProject]);

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4">
      {/* File Tree Side Panel */}
      <div className="w-64 glass-panel rounded-2xl border border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Project Files
          </div>
          <div className="space-y-1">
            {projectFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => !file.is_directory && setActiveFilePath(file.path)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  activeFilePath === file.path
                    ? 'bg-indigo-600/30 text-white font-semibold border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {file.is_directory ? (
                    <Folder className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span className="truncate">{file.name}</span>
                </div>
                {!file.is_directory && <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
          Powered by VS Code Monaco Editor Engine
        </div>
      </div>

      {/* Main Code Editor Window */}
      <div className="flex-1 h-full">
        <MonacoEditorTab activeFilePath={activeFilePath} />
      </div>
    </div>
  );
};

export default CodeEditorPage;
