import React, { useState } from 'react';
import { Play, Loader2, CheckCircle, XCircle, Terminal } from 'lucide-react';
import { executeCode, canExecute, ExecuteResponse } from '../services/pistonService';

interface CodeExecutorProps {
    code: string;
    language: string;
}

export const CodeExecutor: React.FC<CodeExecutorProps> = ({ code, language }) => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<ExecuteResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stdin, setStdin] = useState('');

    const handleExecute = async () => {
        setIsExecuting(true);
        setError(null);
        setResult(null);

        try {
            const response = await executeCode(language, code, stdin);
            setResult(response);
        } catch (err: any) {
            setError(err.message || 'Execution failed');
        } finally {
            setIsExecuting(false);
        }
    };

    if (!canExecute(language)) {
        return null;
    }

    return (
        <div className="bg-surface border-t border-border p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-white">Code Execution</span>
                    <span className="text-xs text-muted">({language})</span>
                </div>
                <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all ${isExecuting
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-accent hover:bg-blue-400 text-white shadow-md hover:shadow-lg'
                        }`}
                >
                    {isExecuting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Running...</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            <span>Run Code</span>
                        </>
                    )}
                </button>
            </div>

            {/* Stdin Input */}
            <div className="mb-3">
                <label className="text-xs text-muted mb-1 block">
                    Standard Input (stdin) - Optional
                </label>
                <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Enter input for your program (one value per line)&#10;Example for input():&#10;John&#10;25&#10;exit"
                    className="w-full bg-[#0d1117] border border-border rounded-lg p-2 text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none h-20 font-mono"
                    disabled={isExecuting}
                />
                <p className="text-xs text-muted/60 mt-1">
                    💡 Tip: For programs using input(), enter all expected values here (one per line)
                </p>
            </div>

            {/* Output Display */}
            {(result || error) && (
                <div className="bg-[#0d1117] rounded-lg border border-border overflow-hidden">
                    {error && (
                        <div className="p-4 bg-red-500/10 border-l-4 border-red-500 flex items-start space-x-3">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-400">Execution Error</p>
                                <p className="text-xs text-red-300 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="divide-y divide-border">
                            {/* Success Indicator */}
                            {result.run.code === 0 && !result.run.stderr && (
                                <div className="px-4 py-2 bg-green-500/10 border-l-4 border-green-500 flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-400">Executed successfully</span>
                                    <span className="text-xs text-muted">({result.language} {result.version})</span>
                                </div>
                            )}

                            {/* Compilation Output */}
                            {result.compile && (
                                <div className="p-4">
                                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Compilation</p>
                                    {result.compile.stdout && (
                                        <div className="mb-2">
                                            <p className="text-xs text-muted mb-1">stdout:</p>
                                            <pre className="text-xs text-gray-300 bg-[#000000]/30 p-2 rounded overflow-x-auto">
                                                {result.compile.stdout}
                                            </pre>
                                        </div>
                                    )}
                                    {result.compile.stderr && (
                                        <div>
                                            <p className="text-xs text-red-400 mb-1">stderr:</p>
                                            <pre className="text-xs text-red-300 bg-red-500/10 p-2 rounded overflow-x-auto">
                                                {result.compile.stderr}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Runtime Output */}
                            <div className="p-4">
                                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Output</p>

                                {result.run.output ? (
                                    <pre className="text-sm text-gray-200 bg-[#000000]/30 p-3 rounded overflow-x-auto max-h-64 font-mono leading-relaxed">
                                        {result.run.output}
                                    </pre>
                                ) : (
                                    <p className="text-xs text-muted italic">No output</p>
                                )}

                                {/* Exit Code */}
                                <div className="mt-3 flex items-center space-x-4 text-xs">
                                    <span className="text-muted">
                                        Exit code:{' '}
                                        <span className={result.run.code === 0 ? 'text-green-400' : 'text-red-400'}>
                                            {result.run.code}
                                        </span>
                                    </span>
                                    {result.run.signal && (
                                        <span className="text-muted">
                                            Signal: <span className="text-yellow-400">{result.run.signal}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Separate stderr if exists */}
                            {result.run.stderr && (
                                <div className="p-4 bg-red-500/5">
                                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Errors</p>
                                    <pre className="text-xs text-red-300 bg-[#000000]/30 p-2 rounded overflow-x-auto max-h-32">
                                        {result.run.stderr}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Help Text */}
            {!result && !error && !isExecuting && (
                <p className="text-xs text-muted mt-3 text-center">
                    Click "Run Code" to execute this {language} code using Piston API
                </p>
            )}
        </div>
    );
};
