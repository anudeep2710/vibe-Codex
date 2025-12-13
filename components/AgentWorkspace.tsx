
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CodeEditor } from './CodeEditor';
import { Preview } from './Preview';
import { AgentEvent, AgentStatus, FileSystemState, Project, ChatMessage, FileData } from '../types';
import { generatePlan, generateCode } from '../services/geminiService';
import {
  Play, Code2, Layers, Cpu, Layout, FileCode,
  MessageSquare, Plus, FolderOpen, Send, Loader2,
  Trash2, MonitorPlay, ChevronLeft, Home, Download
} from 'lucide-react';
import { Terminal } from './Terminal';
import { downloadFile, downloadProjectAsZip } from '../utils/downloadUtils';

// --- Sub-components (Inline for single-file update simplicity) ---

const ProjectSidebar: React.FC<{
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  files: FileSystemState;
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onBack: () => void;
}> = ({ projects, activeProjectId, onSelectProject, onCreateProject, files, activeFilePath, onSelectFile, onBack }) => (
  <div className="w-64 bg-surface border-r border-border flex flex-col h-full">
    {/* Header with Back Button */}
    <div className="p-3 border-b border-border flex items-center">
      <button
        onClick={onBack}
        className="flex items-center text-xs text-muted hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </button>
    </div>

    {/* Project Switcher */}
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">Projects</h2>
        <button onClick={onCreateProject} className="p-1 hover:bg-white/10 rounded text-accent" title="New Project">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => onSelectProject(p.id)}
            className={`w - full text - left px - 2 py - 1.5 rounded text - sm flex items - center ${activeProjectId === p.id ? 'bg-primary/20 text-white border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-[#21262d]'} `}
          >
            <FolderOpen className="w-3 h-3 mr-2" />
            <span className="truncate">{p.name}</span>
          </button>
        ))}
      </div>
    </div>

    {/* File Tree */}
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-3 text-xs font-bold text-muted uppercase tracking-wider border-b border-border">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {Object.values(files).length === 0 ? (
          <div className="text-xs text-muted/40 p-2 text-center">Empty Project</div>
        ) : (
          Object.values(files).map((file: FileData) => (
            <div
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              className={`flex items - center px - 2 py - 1.5 rounded cursor - pointer mb - 1 text - sm ${activeFilePath === file.path ? 'bg-secondary text-white' : 'text-gray-400 hover:text-white hover:bg-[#21262d]'} `}
            >
              {file.path.endsWith('tsx') ? <Code2 className="w-3.5 h-3.5 mr-2 text-blue-400" /> :
                file.path.endsWith('py') ? <FileCode className="w-3.5 h-3.5 mr-2 text-yellow-400" /> :
                  <FileCode className="w-3.5 h-3.5 mr-2 text-gray-400" />}
              <span className="truncate">{file.path}</span>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const ChatInterface: React.FC<{
  messages: ChatMessage[];
  isProcessing: boolean;
  onSendMessage: (msg: string) => void;
}> = ({ messages, isProcessing, onSendMessage }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('ChatInterface messages updated:', messages.length, messages);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted opacity-50 space-y-2">
            <MessageSquare className="w-12 h-12" />
            <p className="text-sm">Start a conversation to generate code</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex - col ${msg.role === 'user' ? 'items-end' : 'items-start'} `}>
            <div className={`max - w - [90 %] rounded - 2xl px - 4 py - 3 text - sm leading - relaxed ${msg.role === 'user'
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-[#1c2128] text-gray-200 rounded-bl-none border border-border'
              } `}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.events && msg.events.length > 0 && (
              <div className="mt-2 w-full max-w-[90%]">
                <div className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1 ml-1">Process Log</div>
                <div className="h-32 rounded-lg overflow-hidden border border-border">
                  <Terminal events={msg.events} />
                </div>
              </div>
            )}
            <span className="text-[10px] text-muted mt-1 px-1 opacity-50">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-start">
            <div className="bg-[#1c2128] rounded-2xl rounded-bl-none px-4 py-3 border border-border flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span className="text-sm text-gray-400">Agent is working...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask to create or edit code..."
            className="w-full bg-[#0d1117] border border-border rounded-xl p-3 pr-12 text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none h-24"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className={`absolute bottom - 3 right - 3 p - 2 rounded - lg transition - all ${isProcessing || !input.trim()
              ? 'bg-border text-muted cursor-not-allowed'
              : 'bg-accent hover:bg-blue-400 text-white shadow-lg'
              } `}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-[10px] text-muted mt-2 text-center">
          Gemini 2.5 Flash • Context Aware • Multi-File Generation
        </div>
      </div>
    </div>
  );
};

// --- Main Workspace Component ---

interface AgentWorkspaceProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  onBack: () => void;
}

const INITIAL_FILES: FileSystemState = {
  'README.md': {
    path: 'README.md',
    language: 'markdown',
    content: '# New Project\n\nStart chatting to generate code.'
  }
};

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  projects,
  setProjects,
  activeProjectId,
  setActiveProjectId,
  onBack
}) => {
  // State
  const [activeFilePath, setActiveFilePath] = useState<string>('README.md');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [isProcessing, setIsProcessing] = useState(false);

  // Computed
  const activeProject = projects.find(p => p.id === activeProjectId);
  const files = activeProject ? activeProject.files : INITIAL_FILES;
  const messages = activeProject ? activeProject.messages : [];

  // Reset active file when project changes if current file doesn't exist
  useEffect(() => {
    if (activeProject && !activeProject.files[activeFilePath]) {
      const firstFile = Object.keys(activeProject.files)[0];
      if (firstFile) setActiveFilePath(firstFile);
      else setActiveFilePath('');
    }
  }, [activeProjectId, activeProject]);

  // Actions
  const handleCreateProject = () => {
    const newId = `proj_${Date.now()} `;
    const newProject: Project = {
      id: newId,
      name: `Project ${projects.length + 1} `,
      files: { ...INITIAL_FILES },
      messages: [],
      createdAt: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newId);
    setActiveFilePath('README.md');
  };

  const updateProjectFiles = (projectId: string, newFiles: FileSystemState) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, files: newFiles } : p
    ));
  };

  const addMessage = (projectId: string, message: ChatMessage) => {
    console.log('Adding message:', { projectId, message, currentProjects: projects.length });
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, messages: [...p.messages, message] };
        console.log('Updated project messages:', updated.messages.length);
        return updated;
      }
      return p;
    }));
  };

  const updateLastMessageEvents = (projectId: string, event: AgentEvent) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const msgs = [...p.messages];
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        const updatedEvents = lastMsg.events ? [...lastMsg.events, event] : [event];
        msgs[msgs.length - 1] = { ...lastMsg, events: updatedEvents };
      }
      return { ...p, messages: msgs };
    }));
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing || !activeProject) return;

    const currentProjectId = activeProjectId; // Capture current ID

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()} _u`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    addMessage(currentProjectId, userMsg);

    // 2. Add Placeholder Assistant Message
    const aiMsgId = `msg_${Date.now()} _a`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '', // Will be filled later
      timestamp: Date.now(),
      events: []
    };
    addMessage(currentProjectId, aiMsg);

    setIsProcessing(true);

    try {
      const currentProject = projects.find(p => p.id === currentProjectId)!;
      const currentFiles = currentProject.files;
      const history = [...currentProject.messages, userMsg];

      const log = (type: AgentStatus, message: string, data?: any) => {
        updateLastMessageEvents(currentProjectId, { type, message, timestamp: Date.now(), data });
      };

      // 3. Agent Workflow
      log('analyzing', 'Analyzing request & context...');
      log('context', 'Reading file system state...', { fileCount: Object.keys(currentFiles).length });
      log('planning', ' devising implementation strategy...');

      const plan = await generatePlan(text, currentFiles, history);
      log('planning', 'Plan created', plan);

      log('thinking', 'Writing code...');
      const generatedFiles = await generateCode(text, plan, currentFiles, history);

      // Step D: Update State
      const newFiles = { ...currentFiles };
      Object.entries(generatedFiles).forEach(([path, content]) => {
        newFiles[path] = {
          path,
          content,
          language: path.endsWith('tsx') ? 'tsx' : path.endsWith('py') ? 'python' : path.endsWith('html') ? 'html' : 'javascript'
        };
        log('writing', `Updated ${path} `);
      });

      updateProjectFiles(currentProjectId, newFiles);

      // Update the AI message content
      setProjects(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        const msgs = [...p.messages];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.id === aiMsgId) {
          msgs[msgs.length - 1] = {
            ...lastMsg,
            content: `I've successfully processed your request.\n\n**Summary:** ${plan.summary}\n\n**Changes:**\n${Object.keys(generatedFiles).map(f => `- ${f}`).join('\n')}`
          };
        }
        return { ...p, messages: msgs };
      }));

      log('complete', 'Task finished successfully');

      // Auto-switch to first changed file
      const firstFile = Object.keys(generatedFiles)[0];
      if (firstFile) {
        setActiveFilePath(firstFile);
        if (firstFile.endsWith('tsx') || firstFile.endsWith('html')) {
          setActiveTab('preview'); // Auto-switch to preview on new UI generation
        }
      }

    } catch (error: any) {
      updateLastMessageEvents(currentProjectId, { type: 'error', message: error.message, timestamp: Date.now() });
      setProjects(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        const msgs = [...p.messages];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.id === aiMsgId) {
          msgs[msgs.length - 1] = { ...lastMsg, content: `Sorry, I encountered an error: ${error.message}` };
        }
        return { ...p, messages: msgs };
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [activeProjectId, projects, isProcessing, activeProject]);

  // Handle manual file editing
  const handleFileChange = (path: string, content: string) => {
    if (!activeProject) return;
    const newFiles = {
      ...activeProject.files,
      [path]: {
        path,
        content,
        language: activeProject.files[path]?.language || 'plaintext'
      }
    };
    updateProjectFiles(activeProjectId, newFiles);
  };

  if (!activeProject) {
    return <div className="text-white">Project not found</div>;
  }

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden font-sans">
      {/* 1. Left Sidebar: Navigation & Files */}
      <ProjectSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onCreateProject={handleCreateProject}
        files={files}
        activeFilePath={activeFilePath}
        onSelectFile={setActiveFilePath}
        onBack={onBack}
      />

      {/* 2. Middle Panel: Chat Interface */}
      <div className="w-[400px] border-r border-border flex flex-col bg-[#0d1117]">
        <div className="h-12 border-b border-border flex items-center px-4 bg-surface">
          <Cpu className="w-4 h-4 text-accent mr-2" />
          <span className="font-semibold text-sm">Agent Chat</span>
        </div>
        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages}
            isProcessing={isProcessing}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* 3. Right Panel: Workbench (Editor/Preview) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {/* Workbench Header */}
        <div className="h-12 bg-surface border-b border-border flex items-center px-2 justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center ${activeTab === 'code' ? 'bg-[#21262d] text-white shadow-sm' : 'text-muted hover:text-gray-300'}`}
            >
              <Code2 className="w-3.5 h-3.5 mr-2" />
              Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center ${activeTab === 'preview' ? 'bg-[#21262d] text-white shadow-sm' : 'text-muted hover:text-gray-300'}`}
            >
              <Layout className="w-3.5 h-3.5 mr-2" />
              Preview
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-muted pr-4 flex items-center opacity-50">{activeFilePath}</span>

            {/* Download Buttons */}
            <button
              onClick={() => downloadFile(activeFilePath, files[activeFilePath]?.content || '')}
              className="px-3 py-1.5 text-xs bg-[#1E1433] hover:bg-[#2D1B4E] text-[#00F5FF] rounded-md transition-all flex items-center space-x-1 border border-[#4A2D6E] hover:border-[#00F5FF] hover:shadow-[0_0_10px_rgba(0,245,255,0.3)]"
              title="Download current file"
            >
              <Download className="w-3 h-3" />
              <span>File</span>
            </button>

            <button
              onClick={() => downloadProjectAsZip(activeProject?.name || 'Project', files)}
              className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#FF006E] to-[#8338EC] hover:from-[#FF1A85] hover:to-[#9C4FFF] text-white rounded-md transition-all flex items-center space-x-1 shadow-md hover:shadow-[0_0_15px_rgba(255,0,110,0.5)]"
              title="Download entire project as ZIP"
            >
              <Download className="w-3 h-3" />
              <span>Project ZIP</span>
            </button>

            {isProcessing && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
          </div>
        </div>

        {/* Workbench Content */}
        <div className="flex-1 relative">
          {activeTab === 'code' ? (
            <CodeEditor
              activeFile={files[activeFilePath] || null}
              onFileChange={handleFileChange}
            />
          ) : (
            <Preview file={files[activeFilePath] || null} allFiles={files} />
          )}
        </div>
      </div>
    </div>
  );
};