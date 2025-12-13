import React, { useState, useMemo } from 'react';
import { Play, Loader2, CheckCircle, XCircle, Terminal, Clock, Cpu, Download, AlertTriangle } from 'lucide-react';
import { executeCode, executeCodeWithFiles, executeTestCases, canExecute, Judge0Result, downloadOutput } from '../services/judge0Service';
import type { UploadedFile, TestCase, TestCaseResult } from '../types';
import { FileUploadManager } from './FileUploadManager';
import { TestCaseManager } from './TestCaseManager';

interface CodeExecutorProps {
    code: string;
    language: string;
}

type IOMode = 'simple' | 'files' | 'testcases';

export const CodeExecutor: React.FC<CodeExecutorProps> = ({ code, language }) => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<Judge0Result | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stdin, setStdin] = useState('');
    const [compilerOptions, setCompilerOptions] = useState('');
    const [commandLineArgs, setCommandLineArgs] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // I/O Modes
    const [ioMode, setIoMode] = useState<IOMode>('simple');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [testResults, setTestResults] = useState<TestCaseResult[]>([]);

    // Detect if code has interactive patterns (loops with input())
    const hasInteractiveLoop = useMemo(() => {
        if (language.toLowerCase() !== 'python') return false;

        // Check for while/for loops with input() calls
        const hasLoop = /\b(while|for)\b/.test(code);
        const hasInput = /\binput\s*\(/.test(code);

        return hasLoop && hasInput;
    }, [code, language]);

    const handleExecute = async () => {
        setIsExecuting(true);
        setError(null);
        setResult(null);
        setTestResults([]);

        try {
            if (ioMode === 'files') {
                // Execute with file support
                const response = await executeCodeWithFiles(
                    language,
                    code,
                    stdin,
                    files,
                    compilerOptions || undefined,
                    commandLineArgs || undefined
                );
                setResult(response);
            } else {
                // Simple execution
                const response = await executeCode(
                    language,
                    code,
                    stdin,
                    compilerOptions || undefined,
                    commandLineArgs || undefined
                );
                setResult(response);
            }
        } catch (err: any) {
            setError(err.message || 'Execution failed');
        } finally {
            setIsExecuting(false);
        }
    };

    const handleRunAllTests = async () => {
        if (testCases.length === 0) return;

        setIsExecuting(true);
        setError(null);
        setTestResults([]);

        try {
            const results = await executeTestCases(
                language,
                code,
                testCases,
                compilerOptions || undefined,
                commandLineArgs || undefined
            );
            setTestResults(results);
        } catch (err: any) {
            setError(err.message || 'Test execution failed');
        } finally {
            setIsExecuting(false);
        }
    };

    const handleRunSingleTest = async (index: number) => {
        const testCase = testCases[index];
        if (!testCase) return;

        setIsExecuting(true);
        setError(null);

        try {
            const results = await executeTestCases(
                language,
                code,
                [testCase],
                compilerOptions || undefined,
                commandLineArgs || undefined
            );

            // Update only this test's result
            setTestResults(prevResults => {
                const filtered = prevResults.filter(r => r.testCaseId !== testCase.id);
                return [...filtered, ...results];
            });
        } catch (err: any) {
            setError(err.message || 'Test execution failed');
        } finally {
            setIsExecuting(false);
        }
    };

    const handleDownloadOutput = () => {
        if (result?.stdout) {
            downloadOutput(result.stdout, `output_${Date.now()}.txt`);
        }
    };

    if (!canExecute(language)) {
        return null;
    }

    // Get status color
    const getStatusColor = (statusId: number) => {
        if (statusId === 3) return 'text-green-500'; // Accepted
        if (statusId >= 4 && statusId <= 12) return 'text-red-500'; // Errors
        return 'text-yellow-500'; // Processing/In Queue
    };

    return (
        <div className="bg-surface border-t border-border p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-white">Code Execution (Judge0)</span>
                    <span className="text-xs text-muted">({language})</span>
                </div>
                <button
                    onClick={ioMode === 'testcases' ? handleRunAllTests : handleExecute}
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
                            <span>{ioMode === 'testcases' ? 'Run All Tests' : 'Run Code'}</span>
                        </>
                    )}
                </button>
            </div>

            {/* I/O Mode Tabs */}
            <div className="flex space-x-2 mb-4 border-b border-border">
                <button
                    onClick={() => setIoMode('simple')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${ioMode === 'simple'
                        ? 'text-accent border-accent'
                        : 'text-muted border-transparent hover:text-text'
                        }`}
                >
                    Simple I/O
                </button>
                <button
                    onClick={() => setIoMode('files')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${ioMode === 'files'
                        ? 'text-accent border-accent'
                        : 'text-muted border-transparent hover:text-text'
                        }`}
                >
                    Files
                </button>
                <button
                    onClick={() => setIoMode('testcases')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${ioMode === 'testcases'
                        ? 'text-accent border-accent'
                        : 'text-muted border-transparent hover:text-text'
                        }`}
                >
                    Test Cases
                </button>
            </div>

            {/* Interactive Loop Warning */}
            {hasInteractiveLoop && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-400 mb-1">
                            ⚠️ Interactive Loop Detected
                        </p>
                        <p className="text-xs text-yellow-300/80 mb-2">
                            Your code uses <code className="bg-black/30 px-1 rounded">input()</code> inside a <code className="bg-black/30 px-1 rounded">while</code> or <code className="bg-black/30 px-1 rounded">for</code> loop.
                            This will cause an <strong>EOFError</strong> because Judge0 can't handle interactive input.
                        </p>
                        <p className="text-xs text-yellow-300/60">
                            💡 <strong>Solution:</strong> Provide all input values in the "Standard Input" box above (one per line),
                            or modify your code to read all inputs at once using <code className="bg-black/30 px-1 rounded">sys.stdin</code>.
                        </p>
                    </div>
                </div>
            )}

            {/* I/O Mode Content */}
            <div className="mb-4">
                {ioMode === 'simple' && (
                    <div>
                        <label className="text-xs text-muted mb-1 block">
                            Standard Input (stdin) - Optional
                        </label>
                        <textarea
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            placeholder="Enter input for your program (one value per line)"
                            className="w-full bg-[#0d1117] border border-border rounded-lg p-2 text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none h-20 font-mono"
                            disabled={isExecuting}
                        />
                        <p className="text-xs text-muted/60 mt-1">
                            💡 Tip: For programs using input(), enter all expected values here (one per line)
                        </p>
                    </div>
                )}

                {ioMode === 'files' && (
                    <div className="space-y-3">
                        <FileUploadManager
                            files={files}
                            onFilesChange={setFiles}
                        />
                        <div>
                            <label className="text-xs text-muted mb-1 block">
                                Standard Input (optional)
                            </label>
                            <textarea
                                value={stdin}
                                onChange={(e) => setStdin(e.target.value)}
                                placeholder="Additional stdin input"
                                className="w-full bg-[#0d1117] border border-border rounded-lg p-2 text-sm text-text focus:outline-none focus:border-accent resize-none h-16 font-mono"
                                disabled={isExecuting}
                            />
                        </div>
                    </div>
                )}

                {ioMode === 'testcases' && (
                    <TestCaseManager
                        testCases={testCases}
                        onTestCasesChange={setTestCases}
                        onRunAll={handleRunAllTests}
                        onRunSingle={handleRunSingleTest}
                        results={testResults}
                        isRunning={isExecuting}
                    />
                )}
            </div>

            {/* Advanced Options (Collapsible) */}
            {ioMode !== 'testcases' && (
                <div className="mb-3">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs text-accent hover:text-blue-300 flex items-center space-x-1"
                    >
                        <span>{showAdvanced ? '▼' : '▶'} Advanced Options</span>
                    </button>

                    {showAdvanced && (
                        <div className="mt-2 space-y-2 p-3 bg-[#0d1117] border border-border rounded-lg">
                            <div>
                                <label className="text-xs text-muted mb-1 block">
                                    Compiler Options (e.g., -O2 -Wall for C++)
                                </label>
                                <input
                                    type="text"
                                    value={compilerOptions}
                                    onChange={(e) => setCompilerOptions(e.target.value)}
                                    placeholder="-O2 -std=c++17"
                                    className="w-full bg-surface border border-border rounded p-2 text-xs text-text focus:outline-none focus:border-accent"
                                    disabled={isExecuting}
                                />
                            </div>

                            <div>
                                <label className="text-xs text-muted mb-1 block">
                                    Command Line Arguments
                                </label>
                                <input
                                    type="text"
                                    value={commandLineArgs}
                                    onChange={(e) => setCommandLineArgs(e.target.value)}
                                    placeholder="--verbose --input=file.txt"
                                    className="w-full bg-surface border border-border rounded p-2 text-xs text-text focus:outline-none focus:border-accent"
                                    disabled={isExecuting}
                                />
                            </div>

                            <div className="text-xs text-muted/60 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                <p className="font-semibold mb-1">🔒 Security Features Enabled:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    <li>Network access disabled</li>
                                    <li>Max 64 processes/threads</li>
                                    <li>1MB file size limit</li>
                                    <li>5s CPU time, 10s wall time</li>
                                    <li>256MB memory limit</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Output Display */}
            {(result || error) && ioMode !== 'testcases' && (
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
                            {/* Status Indicator */}
                            <div className={`px-4 py-2 flex items-center justify-between ${result.status.id === 3 ? 'bg-green-500/10 border-l-4 border-green-500' :
                                result.status.id >= 4 ? 'bg-red-500/10 border-l-4 border-red-500' :
                                    'bg-yellow-500/10 border-l-4 border-yellow-500'
                                }`}>
                                <div className="flex items-center space-x-2">
                                    {result.status.id === 3 ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    <span className={`text-sm font-medium ${getStatusColor(result.status.id)}`}>
                                        {result.status.description}
                                    </span>
                                </div>

                                {/* Execution stats */}
                                <div className="flex items-center space-x-4 text-xs text-muted">
                                    {result.time && (
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{result.time}s</span>
                                        </div>
                                    )}
                                    {result.memory && (
                                        <div className="flex items-center space-x-1">
                                            <Cpu className="w-3 h-3" />
                                            <span>{Math.round(result.memory / 1024)}MB</span>
                                        </div>
                                    )}
                                    {result.stdout && (
                                        <button
                                            onClick={handleDownloadOutput}
                                            className="flex items-center space-x-1 text-accent hover:text-blue-300 transition-colors"
                                            title="Download output"
                                        >
                                            <Download className="w-3 h-3" />
                                            <span>Download</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Compile Output */}
                            {result.compile_output && (
                                <div className="p-4">
                                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                                        Compilation Output
                                    </p>
                                    <pre className="text-xs text-yellow-300 bg-[#000000]/30 p-2 rounded overflow-x-auto">
                                        {result.compile_output}
                                    </pre>
                                </div>
                            )}

                            {/* Stdout */}
                            {result.stdout && (
                                <div className="p-4">
                                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                                        Output
                                    </p>
                                    <pre className="text-sm text-gray-200 bg-[#000000]/30 p-3 rounded overflow-x-auto max-h-64 font-mono leading-relaxed">
                                        {result.stdout}
                                    </pre>
                                </div>
                            )}

                            {/* Stderr */}
                            {result.stderr && (
                                <div className="p-4 bg-red-500/5">
                                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                                        Errors
                                    </p>
                                    <pre className="text-xs text-red-300 bg-[#000000]/30 p-2 rounded overflow-x-auto max-h-32">
                                        {result.stderr}
                                    </pre>
                                </div>
                            )}

                            {/* Message (Runtime errors, etc.) */}
                            {result.message && (
                                <div className="p-4">
                                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                                        Message
                                    </p>
                                    <pre className="text-xs text-gray-300 bg-[#000000]/30 p-2 rounded overflow-x-auto">
                                        {result.message}
                                    </pre>
                                </div>
                            )}

                            {/* Exit code */}
                            {result.exit_code !== null && (
                                <div className="px-4 py-2 text-xs">
                                    <span className="text-muted">
                                        Exit code:{' '}
                                        <span className={result.exit_code === 0 ? 'text-green-400' : 'text-red-400'}>
                                            {result.exit_code}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Help Text */}
            {!result && !error && !isExecuting && ioMode !== 'testcases' && (
                <p className="text-xs text-muted mt-3 text-center">
                    Click "Run Code" to execute this {language} code using Judge0 API (60+ languages supported)
                </p>
            )}
        </div>
    );
};
