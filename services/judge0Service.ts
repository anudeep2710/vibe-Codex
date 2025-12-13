// Judge0 CE API Service for executing code
// API Docs: https://ce.judge0.com/
// Advantages over Piston: 60+ languages, better reliability, battle-tested

const JUDGE0_API_URL = 'https://ce.judge0.com';

export interface Judge0Language {
    id: number;
    name: string;
}

export interface Judge0Submission {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string | null;
    cpu_time_limit?: number | null;
    cpu_extra_time?: number | null;
    wall_time_limit?: number | null;
    memory_limit?: number | null;
    stack_limit?: number | null;
    max_processes_and_or_threads?: number | null;
    enable_per_process_and_thread_time_limit?: boolean | null;
    enable_per_process_and_thread_memory_limit?: boolean | null;
    max_file_size?: number | null;
    compiler_options?: string | null;
    command_line_arguments?: string | null;
    enable_network?: boolean | null;
    redirect_stderr_to_stdout?: boolean | null;
}

export interface Judge0Result {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    status: {
        id: number;
        description: string;
    };
    exit_code: number | null;
    exit_signal: number | null;
    time: string | null;
    wall_time: string | null;
    memory: number | null;
    token: string;
}

// Language ID mapping for common languages
const LANGUAGE_MAP: Record<string, number> = {
    'bash': 46,         // Bash (5.0.0)
    'c': 50,            // C (GCC 9.2.0)
    'cpp': 54,          // C++ (GCC 9.2.0)
    'c++': 54,          // C++ (GCC 9.2.0)
    'csharp': 51,       // C# (Mono 6.6.0.161)
    'go': 60,           // Go (1.13.5)
    'java': 62,         // Java (OpenJDK 13.0.1)
    'javascript': 63,   // JavaScript (Node.js 12.14.0)
    'kotlin': 78,       // Kotlin (1.3.70)
    'lua': 64,          // Lua (5.3.5)
    'php': 68,          // PHP (7.4.1)
    'python': 71,       // Python (3.8.1)
    'ruby': 72,         // Ruby (2.7.0)
    'rust': 73,         // Rust (1.40.0)
    'swift': 83,        // Swift (5.2.3)
    'typescript': 74,   // TypeScript (3.7.4)
};

/**
 * Get all available languages from Judge0
 */
export async function getLanguages(): Promise<Judge0Language[]> {
    try {
        const response = await fetch(`${JUDGE0_API_URL}/languages`);

        if (!response.ok) {
            throw new Error(`Failed to fetch languages: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching Judge0 languages:', error);
        throw error;
    }
}

/**
 * Execute code using Judge0 API
 */
export async function executeCode(
    language: string,
    code: string,
    stdin?: string,
    compilerOptions?: string,
    commandLineArgs?: string
): Promise<Judge0Result> {
    const languageId = LANGUAGE_MAP[language.toLowerCase()];

    if (!languageId) {
        throw new Error(
            `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}`
        );
    }

    try {
        // Step 1: Create submission with enhanced security and options
        const submission: Judge0Submission = {
            source_code: code,
            language_id: languageId,
            stdin: stdin || '',

            // Compiler and runtime options
            compiler_options: compilerOptions || null,
            command_line_arguments: commandLineArgs || null,

            // Time limits (production-ready)
            cpu_time_limit: 5,           // 5 seconds CPU time
            cpu_extra_time: 1,           // 1 second grace period
            wall_time_limit: 10,         // 10 seconds max wall time

            // Memory limits
            memory_limit: 256000,        // 256 MB
            stack_limit: 128000,         // 128 MB stack

            // Security limits (prevent abuse)
            max_processes_and_or_threads: 64,              // Max 64 processes/threads
            enable_per_process_and_thread_time_limit: true, // Apply limits per process
            enable_per_process_and_thread_memory_limit: true, // Apply memory limits per process
            max_file_size: 1024,         // 1 MB max file size

            // Network and I/O
            enable_network: false,       // Disable network access for security
            redirect_stderr_to_stdout: false, // Keep stderr separate for better debugging
        };

        const createResponse = await fetch(`${JUDGE0_API_URL}/submissions?wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submission),
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Submission failed: ${createResponse.statusText} - ${errorText}`);
        }

        const result: Judge0Result = await createResponse.json();

        // Helper to safely decode base64 (Judge0 returns base64-encoded outputs)
        const safeDecode = (str: string | null): string | null => {
            if (!str) return null;
            try {
                // Check if it's actually base64 by trying to decode
                return atob(str);
            } catch {
                // If decoding fails, it might already be plain text
                return str;
            }
        };

        // Decode base64 outputs if present
        result.stdout = safeDecode(result.stdout);
        result.stderr = safeDecode(result.stderr);
        result.compile_output = safeDecode(result.compile_output);
        result.message = safeDecode(result.message);

        return result;

    } catch (error) {
        console.error('Error executing code with Judge0:', error);
        throw error;
    }
}

/**
 * Check if a language is supported
 */
export function canExecute(language: string): boolean {
    return language.toLowerCase() in LANGUAGE_MAP;
}

/**
 * Get supported languages list
 */
export function getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_MAP);
}

/**
 * Get language ID for a given language name
 */
export function getLanguageId(language: string): number | undefined {
    return LANGUAGE_MAP[language.toLowerCase()];
}

/**
 * Format execution result for display
 */
export function formatResult(result: Judge0Result): string {
    const parts: string[] = [];

    // Status
    parts.push(`Status: ${result.status.description}`);

    // Stdout
    if (result.stdout) {
        parts.push(`\nOutput:\n${result.stdout}`);
    }

    // Stderr
    if (result.stderr) {
        parts.push(`\nErrors:\n${result.stderr}`);
    }

    // Compile output
    if (result.compile_output) {
        parts.push(`\nCompile output:\n${result.compile_output}`);
    }

    // Execution stats
    if (result.time || result.memory) {
        const stats = [];
        if (result.time) stats.push(`Time: ${result.time}s`);
        if (result.memory) stats.push(`Memory: ${result.memory} KB`);
        parts.push(`\nStats: ${stats.join(', ')}`);
    }

    return parts.join('\n');
}

// ============================================
// File I/O Support
// ============================================

import type { UploadedFile, TestCase, TestCaseResult, ComparisonResult } from '../types';

export interface Judge0File {
    name: string;
    content: string; // base64 encoded
}

/**
 * Preprocess code to inject file support
 * This creates virtual files that the code can read
 */
function preprocessCodeWithFiles(code: string, files: UploadedFile[], language: string): string {
    if (!files || files.length === 0) return code;

    // For Python, inject file setup using io.StringIO
    if (language.toLowerCase() === 'python') {
        const fileSetup = files.map(file => {
            const content = file.encoding === 'base64'
                ? `base64.b64decode('${file.content}').decode('utf-8')`
                : `'''${file.content.replace(/'/g, "\\'")}'''`;

            return `# Setup file: ${file.name}
_file_content_${file.id} = ${content}
import io
import sys
sys.modules['builtins'].open = lambda name, *args, **kwargs: (
    io.StringIO(_file_content_${file.id}) if name == '${file.name}' 
    else _original_open(name, *args, **kwargs)
)`;
        }).join('\n');

        return `import io, base64, sys
_original_open = open

${fileSetup}

# User code starts here
${code}`;
    }

    // For JavaScript/Node.js, use virtual filesystem
    if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
        const fileSetup = files.map(file => {
            const content = file.encoding === 'base64'
                ? `Buffer.from('${file.content}', 'base64').toString('utf-8')`
                : `\`${file.content.replace(/`/g, '\\`')}\``;

            return `virtualFS['${file.name}'] = ${content};`;
        }).join('\n');

        return `const fs = require('fs');
const virtualFS = {};
${fileSetup}

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function(path, ...args) {
    if (virtualFS[path]) return virtualFS[path];
    return originalReadFileSync(path, ...args);
};

// User code starts here
${code}`;
    }

    // For other languages, just return code as-is
    // (can extend with more language-specific support later)
    return code;
}

/**
 * Execute code with file support
 */
export async function executeCodeWithFiles(
    language: string,
    code: string,
    stdin?: string,
    files?: UploadedFile[],
    compilerOptions?: string,
    commandLineArgs?: string
): Promise<Judge0Result> {
    const processedCode = preprocessCodeWithFiles(code, files || [], language);

    return executeCode(
        language,
        processedCode,
        stdin,
        compilerOptions,
        commandLineArgs
    );
}

/**
 * Compare expected output with actual output
 */
export function compareOutput(
    expected: string,
    actual: string,
    options: {
        trimWhitespace?: boolean;
        ignoreCase?: boolean;
        ignoreEmptyLines?: boolean;
    } = {}
): ComparisonResult {
    const { trimWhitespace = true, ignoreCase = false, ignoreEmptyLines = true } = options;

    // Normalize both strings
    let normalizeString = (str: string) => {
        let lines = str.split('\n');

        if (trimWhitespace) {
            lines = lines.map(line => line.trim());
        }

        if (ignoreEmptyLines) {
            lines = lines.filter(line => line.length > 0);
        }

        if (ignoreCase) {
            lines = lines.map(line => line.toLowerCase());
        }

        return lines;
    };

    const expectedLines = normalizeString(expected);
    const actualLines = normalizeString(actual);

    const differences: ComparisonResult['differences'] = [];
    const maxLen = Math.max(expectedLines.length, actualLines.length);

    let matchedLines = 0;

    for (let i = 0; i < maxLen; i++) {
        const expLine = expectedLines[i] || '';
        const actLine = actualLines[i] || '';

        if (expLine === actLine) {
            matchedLines++;
        } else {
            differences.push({
                line: i + 1,
                expected: expLine,
                actual: actLine
            });
        }
    }

    const totalLines = maxLen;
    const matched = differences.length === 0;
    const similarity = totalLines > 0 ? Math.round((matchedLines / totalLines) * 100) : 100;

    return {
        matched,
        similarity,
        differences,
        stats: {
            totalLines,
            matchedLines,
            differentLines: differences.length
        }
    };
}

/**
 * Execute multiple test cases in batch
 */
export async function executeTestCases(
    language: string,
    code: string,
    testCases: TestCase[],
    compilerOptions?: string,
    commandLineArgs?: string
): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    for (const testCase of testCases) {
        try {
            const execution = await executeCodeWithFiles(
                language,
                code,
                testCase.stdin,
                testCase.files,
                compilerOptions,
                commandLineArgs
            );

            const comparison = compareOutput(
                testCase.expectedOutput,
                execution.stdout || ''
            );

            results.push({
                testCaseId: testCase.id,
                testCaseName: testCase.name,
                passed: comparison.matched && execution.status.id === 3, // Status 3 = Accepted
                execution,
                comparison,
                timestamp: Date.now()
            });
        } catch (error: any) {
            // If execution fails, create a failed result
            results.push({
                testCaseId: testCase.id,
                testCaseName: testCase.name,
                passed: false,
                execution: {
                    stdout: null,
                    stderr: error.message,
                    compile_output: null,
                    message: null,
                    status: { id: 13, description: 'Internal Error' },
                    exit_code: 1,
                    exit_signal: null,
                    time: null,
                    wall_time: null,
                    memory: null,
                    token: ''
                },
                comparison: {
                    matched: false,
                    similarity: 0,
                    differences: [],
                    stats: { totalLines: 0, matchedLines: 0, differentLines: 0 }
                },
                timestamp: Date.now()
            });
        }
    }

    return results;
}

/**
 * Download output as file
 */
export function downloadOutput(content: string, filename: string = 'output.txt'): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Read uploaded file and convert to UploadedFile format
 */
export async function readUploadedFile(file: File): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            const isText = file.type.startsWith('text/') ||
                file.name.endsWith('.txt') ||
                file.name.endsWith('.csv') ||
                file.name.endsWith('.json') ||
                file.name.endsWith('.xml');

            const encoding: 'base64' | 'utf8' = isText ? 'utf8' : 'base64';
            const actualContent = isText ? content : content.split(',')[1]; // Remove data:... prefix for base64

            const preview = isText && actualContent.length > 200
                ? actualContent.substring(0, 200) + '...'
                : undefined;

            resolve({
                id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                content: actualContent,
                size: file.size,
                type: file.type || 'application/octet-stream',
                encoding,
                preview
            });
        };

        reader.onerror = () => reject(new Error('Failed to read file'));

        // Read as text for text files, as data URL for binary
        if (file.type.startsWith('text/') || file.name.match(/\.(txt|csv|json|xml|md)$/i)) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    });
}

