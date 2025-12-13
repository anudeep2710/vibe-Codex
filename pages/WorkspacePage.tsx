import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentWorkspace } from '../components/AgentWorkspace';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getProject, loadProjectFiles, saveProjectFiles, scheduleAutoSave } from '../services/storageService';
import type { Project as CloudProject } from '../config/supabase';
import type { Project, FileSystemState } from '../types';
import toast from 'react-hot-toast';

export const WorkspacePage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [cloudProject, setCloudProject] = useState<CloudProject | null>(null);
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        if (!projectId) {
            navigate('/dashboard');
            return;
        }

        loadProjectData();
    }, [projectId]);

    const loadProjectData = async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            // Load project metadata
            const projData = await getProject(projectId);
            if (!projData) {
                toast.error('Project not found');
                navigate('/dashboard');
                return;
            }
            setCloudProject(projData);

            // Load project files
            const files = await loadProjectFiles(projectId);

            // Convert to local Project format
            const localProject: Project = {
                id: projData.id,
                name: projData.name,
                files: files || {
                    'README.md': {
                        path: 'README.md',
                        language: 'markdown',
                        content: `# ${projData.name}\n\n${projData.description || 'Start coding!'}`
                    }
                },
                messages: [],
                createdAt: new Date(projData.created_at).getTime()
            };

            setProject(localProject);
        } catch (error) {
            console.error('Error loading project:', error);
            toast.error('Failed to load project');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectUpdate = (updatedProjectsOrUpdater: Project[] | ((prev: Project[]) => Project[])) => {
        // Use setProject's updater function to ensure we always work with latest state
        setProject(currentProject => {
            if (!currentProject) return null;

            // Handle both direct array and updater function
            const updatedProjects = typeof updatedProjectsOrUpdater === 'function'
                ? updatedProjectsOrUpdater([currentProject])
                : updatedProjectsOrUpdater;

            const updatedProject = updatedProjects.find(p => p.id === projectId);

            if (updatedProject && projectId) {
                console.log('WorkspacePage: Updating project with messages:', updatedProject.messages.length);

                // Schedule auto-save
                scheduleAutoSave(projectId, updatedProject.files);

                return updatedProject;
            }

            return currentProject;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0E27]">
                <Navbar />
                <LoadingSpinner fullScreen text="Loading project..." size="xl" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0A0E27]">
            <Navbar />
            <AgentWorkspace
                projects={[project]}
                setProjects={handleProjectUpdate}
                activeProjectId={project.id}
                setActiveProjectId={() => { }}
                onBack={() => navigate('/dashboard')}
            />
        </div>
    );
};
