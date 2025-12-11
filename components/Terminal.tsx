import React, { useEffect, useRef } from 'react';
import { AgentEvent } from '../types';
import { Terminal as TerminalIcon, Loader2, CheckCircle2, FileCode, BrainCircuit, Search, Play } from 'lucide-react';

interface TerminalProps {
  events: AgentEvent[];
}

export const Terminal: React.FC<TerminalProps> = ({ events }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'thinking': return <BrainCircuit className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'analyzing': return <Search className="w-4 h-4 text-blue-400" />;
      case 'context': return <FileCode className="w-4 h-4 text-purple-400" />;
      case 'planning': return <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />;
      case 'writing': return <FileCode className="w-4 h-4 text-green-400" />;
      case 'complete': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <span className="text-red-500">✖</span>;
      default: return <TerminalIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-black border-t border-border font-mono text-sm">
      <div className="flex items-center px-4 py-2 bg-surface border-b border-border">
        <TerminalIcon className="w-4 h-4 mr-2 text-muted" />
        <span className="text-muted font-semibold text-xs uppercase tracking-wider">Agent Terminal</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 && (
          <div className="text-muted italic opacity-50">Ready to accept commands...</div>
        )}
        {events.map((event, index) => (
          <div key={index} className="flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-gray-600 text-xs mt-0.5 select-none">{getTime(event.timestamp)}</span>
            <div className="mt-0.5">{getIcon(event.type)}</div>
            <div className="flex-1">
              <span className={`font-medium ${event.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                {event.type.toUpperCase()}
              </span>
              <span className="mx-2 text-gray-600">::</span>
              <span className="text-gray-400">{event.message}</span>
              {event.data && (
                <div className="mt-2 p-2 bg-surface rounded border border-border text-xs text-blue-300 whitespace-pre-wrap">
                  {JSON.stringify(event.data, null, 2)}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
