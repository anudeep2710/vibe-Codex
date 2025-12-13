import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
    content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
    return (
        <div className="markdown-viewer p-6 bg-surface rounded-lg overflow-auto h-full">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mb-4 text-[#FF006E] neon-text">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mb-3 text-[#00F5FF]">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-bold mb-2 text-[#FFBE0B]">{children}</h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-4 text-gray-300 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 text-gray-300 space-y-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="ml-4">{children}</li>
                    ),
                    code: ({ inline, children, ...props }: any) =>
                        inline ? (
                            <code className="bg-black/30 text-[#3FFF00] px-2 py-1 rounded text-sm font-mono" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-black/50 text-[#00F5FF] p-4 rounded-lg mb-4 overflow-x-auto font-mono text-sm border border-[#4A2D6E]" {...props}>
                                {children}
                            </code>
                        ),
                    pre: ({ children }) => (
                        <pre className="mb-4">{children}</pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[#8338EC] pl-4 italic text-gray-400 mb-4 bg-[#1A103C]/50 py-2">
                            {children}
                        </blockquote>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-[#00F5FF] hover:text-[#FF006E] underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full border border-[#4A2D6E]">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-[#2D1B4E]">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="border border-[#4A2D6E] px-4 py-2 text-left text-[#FFBE0B] font-bold">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-[#4A2D6E] px-4 py-2 text-gray-300">{children}</td>
                    ),
                    hr: () => (
                        <hr className="my-6 border-t-2 border-[#4A2D6E]" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
