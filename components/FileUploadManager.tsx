import React, { useState, useRef } from 'react';
import { Upload, X, File, FileText, Database, Code } from 'lucide-react';
import type { UploadedFile } from '../types';
import { readUploadedFile } from '../services/judge0Service';

interface FileUploadManagerProps {
    files: UploadedFile[];
    onFilesChange: (files: UploadedFile[]) => void;
    maxFileSize?: number; // in bytes, default 100KB
    maxFiles?: number; // default 5
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
    files,
    onFilesChange,
    maxFileSize = 100 * 1024, // 100KB
    maxFiles = 5
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        await processFiles(droppedFiles);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            await processFiles(selectedFiles);
        }
    };

    const processFiles = async (fileList: File[]) => {
        setError(null);

        // Check max files limit
        if (files.length + fileList.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Process each file
        const newFiles: UploadedFile[] = [];

        for (const file of fileList) {
            // Check file size
            if (file.size > maxFileSize) {
                setError(`File "${file.name}" exceeds ${Math.round(maxFileSize / 1024)}KB limit`);
                continue;
            }

            try {
                const uploadedFile = await readUploadedFile(file);
                newFiles.push(uploadedFile);
            } catch (err) {
                setError(`Failed to read file: ${file.name}`);
            }
        }

        onFilesChange([...files, ...newFiles]);
    };

    const removeFile = (fileId: string) => {
        onFilesChange(files.filter(f => f.id !== fileId));
        setError(null);
    };

    const getFileIcon = (type: string) => {
        if (type.includes('text')) return <FileText className="w-4 h-4" />;
        if (type.includes('json') || type.includes('xml')) return <Code className="w-4 h-4" />;
        if (type.includes('csv')) return <Database className="w-4 h-4" />;
        return <File className="w-4 h-4" />;
    };

    return (
        <div className="space-y-3">
            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragging
                        ? 'border-accent bg-accent/10 scale-[1.02]'
                        : 'border-border hover:border-accent/50 hover:bg-accent/5'
                    }`}
            >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-accent' : 'text-muted'}`} />
                <p className="text-sm text-text mb-1">
                    {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
                </p>
                <p className="text-xs text-muted">
                    Max {maxFiles} files, up to {Math.round(maxFileSize / 1024)}KB each
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".txt,.csv,.json,.xml,.md,.dat"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
                    {error}
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Uploaded Files ({files.length}/{maxFiles})
                    </p>
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="bg-[#0d1117] border border-border rounded-lg p-3 flex items-start space-x-3 group hover:border-accent/30 transition-colors"
                        >
                            <div className="text-accent mt-0.5">
                                {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-text truncate">
                                        {file.name}
                                    </p>
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-muted">
                                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                                    <span>•</span>
                                    <span className="capitalize">{file.encoding}</span>
                                </div>
                                {file.preview && (
                                    <pre className="mt-2 text-xs text-muted/80 bg-black/20 rounded p-2 overflow-hidden whitespace-pre-wrap break-all">
                                        {file.preview}
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
