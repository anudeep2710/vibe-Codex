import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, Code2, Clock, ArrowRight, Sparkles, Terminal, Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface SplashScreenProps {
  projects: Project[];
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  projects,
  onCreateProject,
  onSelectProject,
  onDeleteProject
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; projectId: string | null; projectName: string }>({
    isOpen: false,
    projectId: null,
    projectName: ''
  });
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center space-x-2">
          <Terminal className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg tracking-tight text-white">Vibing Code</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Documentation</a>
          <button className="text-sm font-medium bg-[#1f6feb] hover:bg-[#1f6feb]/90 text-white px-4 py-2 rounded-lg transition-colors">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden min-h-[60vh]">
        {/* Ambient Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-blue-400 font-medium mb-4 shadow-lg shadow-black/20">
            <Sparkles className="w-3 h-3" />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Code with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">AI Superpowers</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Experience the future of coding with local AI models and a council of expert agents ready to help you build faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-8">
            <button
              onClick={onCreateProject}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Start Coding
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-[#161b22] border border-[#30363d] hover:bg-[#21262d] text-white rounded-xl font-bold transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid Section */}
      <div className="bg-[#0f1218] border-t border-[#30363d] p-8 md:p-12 z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <Clock className="w-5 h-5 mr-3 text-gray-500" />
            Your Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Card */}
            <div
              onClick={onCreateProject}
              className="group cursor-pointer bg-[#161b22]/50 border border-[#30363d] border-dashed hover:border-blue-500/50 hover:bg-[#161b22] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-[#0d1117] border border-[#30363d] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-blue-500/50 transition-all shadow-lg">
                <Plus className="w-8 h-8 text-gray-500 group-hover:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 group-hover:text-white">Create New Project</h3>
            </div>

            {/* Project Cards */}
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="group cursor-pointer bg-[#161b22] border border-[#30363d] hover:border-gray-600 rounded-2xl p-6 flex flex-col transition-all hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Card Gradient Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

                <div className="flex items-start justify-between mb-6 relative">
                  <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d] group-hover:border-blue-500/30 transition-colors shadow-inner">
                    <Code2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10 p-2 rounded-lg">
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors pr-8 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {Object.keys(project.files).length} files • {project.messages.length} messages
                </p>

                <div className="mt-auto flex items-center justify-between text-xs text-gray-600 font-mono border-t border-[#30363d] pt-4">
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  <span>ID: {project.id.slice(-4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};