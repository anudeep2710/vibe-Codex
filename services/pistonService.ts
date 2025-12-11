// Piston API Service for executing code in various languages
// API Docs: https://piston.readthedocs.io/en/latest/api-v2/

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export interface PistonRuntime {
    language: string;
    version: string;
    aliases: string[];
    runtime?: string;
}

export interface ExecuteRequest {
    language: string;
    version: string;
    files: Array<{
        name?: string;
        content: string;
    }>;
    stdin?: string;
    args?: string[];
    compile_timeout?: number;
    run_timeout?: number;
    compile_memory_limit?: number;
    run_memory_limit?: number;
}

export interface ExecuteResponse {
    language: string;
    version: string;
    run: {
        stdout: string;
        stderr: string;
        code: number;
        signal: string | null;
        output: string;
    };
    compile?: {
        stdout: string;
        stderr: string;
        code: number;
        signal: string | null;
        output: string;
    };
}

export interface PackageInfo {
    language: string;
    language_version: string;
    installed: boolean;
}

export interface InstallPackageRequest {
    language: string;
    version: string;
}

// Language to Piston mapping
const LANGUAGE_MAP: Record<string, { language: string; version: string; extension: string }> = {
    'python': { language: 'python', version: '3.10.0', extension: '.py' },
    'javascript': { language: 'javascript', version: '18.15.0', extension: '.js' },
    'typescript': { language: 'typescript', version: '5.0.3', extension: '.ts' },
    'java': { language: 'java', version: '15.0.2', extension: '.java' },
    'cpp': { language: 'c++', version: '10.2.0', extension: '.cpp' },
    'c': { language: 'c', version: '10.2.0', extension: '.c' },
    'go': { language: 'go', version: '1.16.2', extension: '.go' },
    'rust': { language: 'rust', version: '1.68.2', extension: '.rs' },
    'ruby': { language: 'ruby', version: '3.0.1', extension: '.rb' },
    'php': { language: 'php', version: '8.2.3', extension: '.php' },
    'swift': { language: 'swift', version: '5.3.3', extension: '.swift' },
    'kotlin': { language: 'kotlin', version: '1.8.20', extension: '.kt' },
    'csharp': { language: 'csharp', version: '6.12.0', extension: '.cs' },
    'bash': { language: 'bash', version: '5.2.0', extension: '.sh' },
};

// Get available runtimes from Piston API
export async function getRuntimes(): Promise<PistonRuntime[]> {
    try {
        const response = await fetch(`${PISTON_API_URL}/runtimes`);
        if (!response.ok) {
            throw new Error(`Failed to fetch runtimes: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching Piston runtimes:', error);
        throw error;
    }
}

// Get installed packages
export async function getPackages(): Promise<PackageInfo[]> {
    try {
        const response = await fetch(`${PISTON_API_URL}/packages`);
        if (!response.ok) {
            throw new Error(`Failed to fetch packages: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching packages:', error);
        throw error;
    }
}

// Install a package
export async function installPackage(language: string, version: string): Promise<PackageInfo> {
    try {
        const response = await fetch(`${PISTON_API_URL}/packages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language,
                version,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to install package: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error installing package:', error);
        throw error;
    }
}

// Uninstall a package
export async function uninstallPackage(language: string, version: string): Promise<void> {
    try {
        const response = await fetch(`${PISTON_API_URL}/packages`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language,
                version,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to uninstall package: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error uninstalling package:', error);
        throw error;
    }
}

// Execute code
export async function executeCode(
    language: string,
    code: string,
    stdin?: string
): Promise<ExecuteResponse> {
    const langConfig = LANGUAGE_MAP[language.toLowerCase()];

    if (!langConfig) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}`);
    }

    const request: ExecuteRequest = {
        language: langConfig.language,
        version: langConfig.version,
        files: [
            {
                name: `main${langConfig.extension}`,
                content: code,
            },
        ],
        stdin: stdin || '',
        compile_timeout: 10000, // 10 seconds
        run_timeout: 3000, // 3 seconds
        compile_memory_limit: -1,
        run_memory_limit: -1,
    };

    try {
        const response = await fetch(`${PISTON_API_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`Execution failed: ${response.statusText}`);
        }

        const result: ExecuteResponse = await response.json();
        return result;
    } catch (error) {
        console.error('Error executing code:', error);
        throw error;
    }
}

// Check if a language supports execution
export function canExecute(language: string): boolean {
    return language.toLowerCase() in LANGUAGE_MAP;
}

// Get supported languages
export function getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_MAP);
}

// Get language config
export function getLanguageConfig(language: string) {
    return LANGUAGE_MAP[language.toLowerCase()];
}
