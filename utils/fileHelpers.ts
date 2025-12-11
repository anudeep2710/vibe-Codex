import { FileData, FileSystemState } from '../types';

// Validate file path
export const isValidFilePath = (path: string): boolean => {
    if (!path || path.trim() === '') return false;

    // Prevent directory traversal
    if (path.includes('..') || path.startsWith('/')) return false;

    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(path)) return false;

    return true;
};

// Get file extension
export const getFileExtension = (path: string): string => {
    const parts = path.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// Get language from file extension
export const getLanguageFromPath = (path: string): string => {
    const ext = getFileExtension(path);

    const languageMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'json': 'json',
        'md': 'markdown',
        'yaml': 'yaml',
        'yml': 'yaml',
        'xml': 'xml',
        'sql': 'sql',
        'sh': 'shell',
        'bash': 'shell',
    };

    return languageMap[ext] || 'plaintext';
};

// Get file icon name based on extension
export const getFileIcon = (path: string): string => {
    const ext = getFileExtension(path);

    const iconMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'react',
        'js': 'javascript',
        'jsx': 'react',
        'py': 'python',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
    };

    return iconMap[ext] || 'file';
};

// Generate unique file path if duplicate exists
export const generateUniqueFilePath = (basePath: string, existingFiles: FileSystemState): string => {
    if (!existingFiles[basePath]) return basePath;

    const ext = getFileExtension(basePath);
    const nameWithoutExt = basePath.substring(0, basePath.length - ext.length - 1);

    let counter = 1;
    let newPath = `${nameWithoutExt}_${counter}.${ext}`;

    while (existingFiles[newPath]) {
        counter++;
        newPath = `${nameWithoutExt}_${counter}.${ext}`;
    }

    return newPath;
};

// Create new file data
export const createFileData = (path: string, content: string = ''): FileData => {
    return {
        path,
        content,
        language: getLanguageFromPath(path),
    };
};

// Rename file in file system
export const renameFileInFileSystem = (
    files: FileSystemState,
    oldPath: string,
    newPath: string
): FileSystemState => {
    if (!files[oldPath] || files[newPath]) {
        return files;
    }

    const newFiles = { ...files };
    newFiles[newPath] = { ...files[oldPath], path: newPath };
    delete newFiles[oldPath];

    return newFiles;
};

// Delete file from file system
export const deleteFileFromFileSystem = (
    files: FileSystemState,
    path: string
): FileSystemState => {
    const newFiles = { ...files };
    delete newFiles[path];
    return newFiles;
};

// Duplicate file in file system
export const duplicateFileInFileSystem = (
    files: FileSystemState,
    path: string
): FileSystemState => {
    if (!files[path]) return files;

    const newPath = generateUniqueFilePath(path, files);
    const newFiles = { ...files };
    newFiles[newPath] = { ...files[path], path: newPath };

    return newFiles;
};

// Build folder tree structure (for future folder support)
export interface FolderNode {
    name: string;
    path: string;
    isFolder: boolean;
    children?: FolderNode[];
}

export const buildFolderTree = (files: FileSystemState): FolderNode[] => {
    const tree: FolderNode[] = [];
    const folderMap = new Map<string, FolderNode>();

    // Sort files by path
    const sortedPaths = Object.keys(files).sort();

    sortedPaths.forEach(path => {
        const parts = path.split('/');

        // Handle nested paths
        for (let i = 0; i < parts.length; i++) {
            const currentPath = parts.slice(0, i + 1).join('/');
            const isFile = i === parts.length - 1;

            if (!folderMap.has(currentPath)) {
                const node: FolderNode = {
                    name: parts[i],
                    path: currentPath,
                    isFolder: !isFile,
                    children: isFile ? undefined : [],
                };

                folderMap.set(currentPath, node);

                if (i === 0) {
                    tree.push(node);
                } else {
                    const parentPath = parts.slice(0, i).join('/');
                    const parent = folderMap.get(parentPath);
                    if (parent && parent.children) {
                        parent.children.push(node);
                    }
                }
            }
        }
    });

    return tree;
};
