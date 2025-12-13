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

// ============================================
// I/O Operations Types
// ============================================

export interface UploadedFile {
  id: string;
  name: string;
  content: string; // base64 or text
  size: number;
  type: string; // MIME type
  encoding: 'base64' | 'utf8';
  preview?: string; // First 200 chars for preview
}

export interface TestCase {
  id: string;
  name: string;
  stdin: string;
  expectedOutput: string;
  files?: UploadedFile[];
}

export interface TestCaseResult {
  testCaseId: string;
  testCaseName: string;
  passed: boolean;
  execution: any; // Judge0Result
  comparison: ComparisonResult;
  timestamp: number;
}

export interface ComparisonResult {
  matched: boolean;
  similarity: number; // 0-100
  differences: {
    line: number;
    expected: string;
    actual: string;
  }[];
  stats: {
    totalLines: number;
    matchedLines: number;
    differentLines: number;
  };
}
