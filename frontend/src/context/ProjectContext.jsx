import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoadingProjects(true);
    try {
      const res = await api.get('/projects/');
      setProjects(res.data);
      setActiveProject((current) => (
        res.data.find((project) => project.id === current?.id) || res.data[0] || null
      ));
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setActiveProject(null);
    }
  }, [user, fetchProjects]);

  const createProject = async (projectData) => {
    const res = await api.post('/projects/', projectData);
    setProjects((prev) => [res.data, ...prev]);
    setActiveProject(res.data);
    return res.data;
  };

  const deleteProject = async (projectId) => {
    await api.delete(`/projects/${projectId}/`);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProject && activeProject.id === projectId) {
      setActiveProject(projects.find((p) => p.id !== projectId) || null);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        loadingProjects,
        fetchProjects,
        createProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
