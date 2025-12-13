import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, Clock, Trash2, Search, Sparkles } from 'lucide-react';
import { getUserProjects, createProject, deleteProject } from '../services/storageService';
import type { Project } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        const data = await getUserProjects();
        setProjects(data);
        setLoading(false);
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        const project = await createProject(newProjectName, newProjectDescription);
        if (project) {
            setShowNewProjectDialog(false);
            setNewProjectName('');
            setNewProjectDescription('');
            await loadProjects();
            navigate(`/workspace/${project.id}`);
        }
    };

    const handleDeleteProject = async (projectId: string, projectName: string) => {
        if (window.confirm(`Delete "${projectName}"? This cannot be undone.`)) {
            await deleteProject(projectId);
            await loadProjects();
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-[#0A0E27]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1f3a] to-[#0A0E27] border-b border-[#2a2f4a] px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Welcome back, {user?.user_metadata?.name || 'Developer'}! 👋
                            </h1>
                            <p className="text-gray-400">Continue coding with vibes</p>
                        </div>
                        <button
                            onClick={() => setShowNewProjectDialog(true)}
                            className="bg-gradient-to-r from-[#00D4FF] to-[#B24BF3] text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:opacity-90 transition-all shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Project</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..."
                            className="w-full bg-[#0A0E27] border border-[#2a2f4a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Loading projects...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20">
                        <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery ? 'No projects found' : 'No projects yet'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowNewProjectDialog(true)}
                                className="bg-gradient-to-r from-[#00D4FF] to-[#B24BF3] text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 hover:opacity-90 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create Project</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-[#1a1f3a]/50 backdrop-blur-xl border border-[#2a2f4a] rounded-xl p-6 hover:border-[#00D4FF]/50 transition-all group cursor-pointer"
                                onClick={() => navigate(`/workspace/${project.id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#00D4FF]/20 to-[#B24BF3]/20 rounded-lg flex items-center justify-center">
                                            <Folder className="w-6 h-6 text-[#00D4FF]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-[#00D4FF] transition-colors">
                                                {project.name}
                                            </h3>
                                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDate(project.updated_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProject(project.id, project.name);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {project.description && (
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}

                                {project.tags && project.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.slice(0, 3).map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-[#00D4FF]/10 text-[#00D4FF] text-xs rounded-md"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {project.tags.length > 3 && (
                                            <span className="px-2 py-1 text-gray-400 text-xs">
                                                +{project.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Project Dialog */}
            {showNewProjectDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1f3a] border border-[#2a2f4a] rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Create New Project</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="My Awesome Project"
                                    autoFocus
                                    className="w-full bg-[#0A0E27] border border-[#2a2f4a] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newProjectDescription}
                                    onChange={(e) => setNewProjectDescription(e.target.value)}
                                    placeholder="What's this project about?"
                                    rows={3}
                                    className="w-full bg-[#0A0E27] border border-[#2a2f4a] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowNewProjectDialog(false);
                                    setNewProjectName('');
                                    setNewProjectDescription('');
                                }}
                                className="flex-1 bg-[#2a2f4a] text-white px-4 py-2 rounded-lg hover:bg-[#3a3f5a] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={!newProjectName.trim()}
                                className="flex-1 bg-gradient-to-r from-[#00D4FF] to-[#B24BF3] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
