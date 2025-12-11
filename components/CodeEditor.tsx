import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { FileData } from '../types';
import { Save, Circle } from 'lucide-react';

interface CodeEditorProps {
  activeFile: FileData | null;
  onFileChange?: (path: string, content: string) => void;
  isDirty?: boolean;
}

const getLanguageFromPath = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'py':
      return 'python';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};

export const CodeEditor: React.FC<CodeEditorProps> = ({ activeFile, onFileChange, isDirty = false }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-muted">
        <div className="text-center">
          <p>No file selected</p>
          <p className="text-xs opacity-50 mt-2">Generate code or select a file to view</p>
        </div>
      </div>
    );
  }

  const language = getLanguageFromPath(activeFile.path);

  const handleEditorChange = (value: string | undefined) => {
    if (!value || !onFileChange || !activeFile) return;

    // Debounce auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onFileChange(activeFile.path, value);
    }, 500); // Auto-save after 500ms of inactivity
  };

  return (
    <div className="h-full w-full relative">
      {isDirty && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-[#1c2128] border border-border rounded-lg px-3 py-1.5 text-xs">
          <Circle className="w-2 h-2 fill-yellow-500 text-yellow-500" />
          <span className="text-muted">Unsaved changes</span>
        </div>
      )}
      <Editor
        height="100%"
        language={language}
        value={activeFile.content}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: false, // EDITABLE!
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          tabSize: 2,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: {
            enabled: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
        }}
      />
    </div>
  );
};