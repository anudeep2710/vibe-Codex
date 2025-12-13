import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileSystemState } from '../types';

/**
 * Download a single file
 */
export function downloadFile(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
}

/**
 * Download entire project as ZIP
 */
export async function downloadProjectAsZip(
    projectName: string,
    files: FileSystemState
): Promise<void> {
    const zip = new JSZip();

    // Add all files to ZIP
    Object.entries(files).forEach(([path, fileData]) => {
        zip.file(path, fileData.content);
    });

    // Generate ZIP file
    const blob = await zip.generateAsync({ type: 'blob' });

    // Download
    const filename = `${projectName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.zip`;
    saveAs(blob, filename);
}

/**
 * Download multiple files as separate downloads
 */
export function downloadMultipleFiles(files: FileSystemState) {
    Object.entries(files).forEach(([path, fileData]) => {
        // Small delay to prevent browser blocking
        setTimeout(() => {
            downloadFile(path, fileData.content);
        }, 100);
    });
}

/**
 * Create a downloadable link element
 */
export function createDownloadLink(content: string, filename: string): HTMLAnchorElement {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    return link;
}
