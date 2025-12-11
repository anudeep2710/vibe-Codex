import React, { useMemo } from 'react';
import { FileData, FileSystemState } from '../types';
import { RefreshCw, Smartphone, Monitor } from 'lucide-react';
import { CodeExecutor } from './CodeExecutor';
import { canExecute } from '../services/pistonService';

interface PreviewProps {
  file: FileData | null;
  allFiles?: FileSystemState;
}

export const Preview: React.FC<PreviewProps> = ({ file, allFiles = {} }) => {
  // Check if the file can be executed (Python, Java, etc.)
  const isExecutable = file && canExecute(file.language);

  const srcDoc = useMemo(() => {
    if (!file) return '';

    const isReact = file.path.endsWith('.tsx') || file.path.endsWith('.jsx');
    const isHtml = file.path.endsWith('.html');

    if (!isReact && !isHtml) {
      // For executable languages, we'll show the executor instead
      if (isExecutable) {
        return '';
      }
      return `<html><body style="color: #8b949e; background: #0d1117; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh;">
        <div>Preview not available for ${file.path}<br/>(Preview supports HTML and React components. Use the executor below for ${file.language})</div>
      </body></html>`;
    }

    if (isHtml) {
      return file.content;
    }

    // Helper to process code: strip imports and expose exports to window
    const processComponent = (code: string) => {
      return code
        .replace(/import\s+.*from\s+['"].*['"];?/g, '')
        // Convert 'export default function Name' -> 'window.Name = function Name'
        .replace(/export\s+default\s+function\s+(\w+)/, 'window.$1 = function $1')
        // Convert 'export const Name' -> 'window.Name'
        .replace(/export\s+const\s+(\w+)/, 'window.$1')
        // Convert 'export function Name' -> 'window.Name = function Name'
        .replace(/export\s+function\s+(\w+)/, 'window.$1 = function $1');
    };

    // 1. Gather all OTHER component files to inject as dependencies
    let dependencyScripts = '';
    Object.values(allFiles).forEach((f: FileData) => {
      if (f.path !== file.path && (f.path.endsWith('.tsx') || f.path.endsWith('.jsx'))) {
        dependencyScripts += `
          try {
            ${processComponent(f.content)}
          } catch (e) { console.warn('Failed to load dependency ${f.path}', e); }
        \n`;
      }
    });

    // 2. Process the Active File
    const cleanContent = processComponent(file.content);

    // 3. Determine component name to render
    const componentNameMatch = file.content.match(/export\s+default\s+function\s+(\w+)/)
      || file.content.match(/export\s+const\s+(\w+)/)
      || file.content.match(/function\s+(\w+)/);

    const componentName = componentNameMatch ? componentNameMatch[1] : 'App';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { background-color: #ffffff; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
            #root { padding: 20px; }
            /* Hide scrollbar for cleaner look */
            ::-webkit-scrollbar { width: 0px; background: transparent; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect, useRef, useMemo, useCallback } = React;
            
            // Icons mock to prevent crash if Lucide is imported
            const LucideIcon = ({ name, ...props }) => <span {...props}>{name}</span>;
            
            // --- Dependency Injection ---
            ${dependencyScripts}
            // ----------------------------

            // --- Active Component ---
            ${cleanContent}
            // ------------------------

            const root = ReactDOM.createRoot(document.getElementById('root'));
            try {
              // Try to find the component in window (from dependency injection logic) or local scope
              const ComponentToRender = window.${componentName} || ${componentName};
              
              if (typeof ComponentToRender !== 'undefined') {
                root.render(<ComponentToRender />);
              } else {
                root.render(
                  <div style={{color: '#ef4444', fontFamily: 'monospace', padding: '20px', background: '#fee2e2', borderRadius: '8px'}}>
                    <strong>Render Error:</strong><br/>
                    Could not find component '<strong>${componentName}</strong>' to render.<br/><br/>
                    Ensure your component is exported as <code>export default function ${componentName}</code>
                  </div>
                );
              }
            } catch (err) {
              root.render(
                <div style={{color: '#ef4444', fontFamily: 'monospace', padding: '20px', background: '#fee2e2', borderRadius: '8px'}}>
                  <strong>Runtime Error:</strong><br/>
                  {err.message}
                </div>
              );
            }
          </script>
        </body>
      </html>
    `;
  }, [file, allFiles, isExecutable]);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-muted">
        <p>No file selected for preview</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="h-8 bg-surface border-b border-border flex items-center px-4 justify-between select-none">
        <span className="text-xs text-muted flex items-center">
          <Monitor className="w-3 h-3 mr-2" />
          Preview: {file.path}
        </span>
        <RefreshCw className="w-3 h-3 text-muted cursor-pointer hover:text-white transition-colors" onClick={() => { /* Force refresh if needed */ }} />
      </div>

      {/* Preview iframe for web languages */}
      {!isExecutable && srcDoc && (
        <iframe
          title="preview"
          srcDoc={srcDoc}
          className="flex-1 w-full border-none bg-white"
          sandbox="allow-scripts allow-modals"
        />
      )}

      {/* Code executor for non-web languages */}
      {isExecutable && (
        <div className="flex-1 overflow-auto bg-[#1e1e1e] flex flex-col">
          <div className="flex-1 flex items-center justify-center text-muted p-8 text-center">
            <div>
              <p className="text-sm mb-2">This file contains {file.language} code.</p>
              <p className="text-xs">Use the executor below to run it.</p>
            </div>
          </div>
          <CodeExecutor code={file.content} language={file.language} />
        </div>
      )}

      {/* Empty state for unsupported files */}
      {!isExecutable && !srcDoc && (
        <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-muted">
          <p className="text-sm">Preview not available for this file type</p>
        </div>
      )}
    </div>
  );
};