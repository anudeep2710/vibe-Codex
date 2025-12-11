export type AgentStatus = 'idle' | 'analyzing' | 'context' | 'planning' | 'generating' | 'writing' | 'complete' | 'error' | 'thinking';

export interface AgentEvent {
  type: AgentStatus;
  message: string;
  timestamp: number;
  data?: any;
}

export interface FileData {
  path: string;
  content: string;
  language: string;
}

export interface FileSystemState {
  [path: string]: FileData;
}

export interface GenerationPlan {
  summary: string;
  filesToCreate: string[];
  technicalApproach: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  events?: AgentEvent[]; // Events associated with this turn
}

export interface Project {
  id: string;
  name: string;
  files: FileSystemState;
  messages: ChatMessage[];
  createdAt: number;
}
