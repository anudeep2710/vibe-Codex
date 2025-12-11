import React, { useState, useEffect } from 'react';
import { AgentWorkspace } from './components/AgentWorkspace';
import { SplashScreen } from './components/SplashScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Project, FileSystemState } from './types';
import { storageService } from './services/storageService';

const INITIAL_FILES: FileSystemState = {
  'README.md': {
    path: 'README.md',
    language: 'markdown',
    content: '# New Project\n\nStart chatting to generate code.'
  }
};

const INITIAL_PROJECT: Project = {
  id: 'default-1',
  name: 'Demo Project',
  files: INITIAL_FILES,
  messages: [],
  createdAt: Date.now()
};

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IndexedDB and load projects
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await storageService.init();

        // Migrate from localStorage if needed
        await storageService.migrateFromLocalStorage();

        // Load projects from IndexedDB
        const loadedProjects = await storageService.getAllProjects();

        if (loadedProjects.length === 0) {
          // Create initial project if none exist
          await storageService.saveProject(INITIAL_PROJECT);
          setProjects([INITIAL_PROJECT]);
        } else {
          setProjects(loadedProjects);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to load application data. Please refresh the page.');
        setIsLoaded(true);
      }
    };

    initializeApp();
  }, []);

  // Auto-save projects whenever they change
  useEffect(() => {
    if (isLoaded && projects.length > 0) {
      projects.forEach(project => {
        storageService.saveProject(project).catch(err => {
          console.error('Failed to save project:', err);
        });
      });
    }
  }, [projects, isLoaded]);

  const handleCreateProject = () => {
    const newId = `proj_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: `Project ${projects.length + 1}`,
      files: { ...INITIAL_FILES },
      messages: [],
      createdAt: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newId);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await storageService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner fullScreen text="Loading your projects..." size="xl" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <ErrorBoundary>
      {activeProjectId && activeProject ? (
        <AgentWorkspace
          projects={projects}
          setProjects={setProjects}
          activeProjectId={activeProjectId}
          setActiveProjectId={setActiveProjectId}
          onBack={() => setActiveProjectId(null)}
        />
      ) : (
        <SplashScreen
          projects={projects}
          onCreateProject={handleCreateProject}
          onSelectProject={setActiveProjectId}
          onDeleteProject={handleDeleteProject}
        />
      )}
    </ErrorBoundary>
  );
}

export default App;