import { supabase } from '../config/supabase';
import type { Project, FileRecord } from '../config/supabase';
import type { FileSystemState } from '../types';
import toast from 'react-hot-toast';

/**
 * Cloud Storage Service for Vibe Code-X
 * Manages project persistence in Supabase
 */

// ============================================
// Projects
// ============================================

export async function createProject(name: string, description?: string): Promise<Project | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                name,
                description: description || null,
            })
            .select()
            .single();

        if (error) throw error;

        toast.success('Project created!');
        return data;
    } catch (error: any) {
        console.error('Error creating project:', error);
        toast.error('Failed to create project');
        return null;
    }
}

export async function getUserProjects(): Promise<Project[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

export async function getProject(projectId: string): Promise<Project | null> {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) throw error;

        // Update last accessed
        await supabase
            .from('projects')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('id', projectId);

        return data;
    } catch (error: any) {
        console.error('Error fetching project:', error);
        return null;
    }
}

export async function updateProject(
    projectId: string,
    updates: Partial<Pick<Project, 'name' | 'description' | 'is_public' | 'tags'>>
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', projectId);

        if (error) throw error;

        toast.success('Project updated!');
        return true;
    } catch (error: any) {
        console.error('Error updating project:', error);
        toast.error('Failed to update project');
        return false;
    }
}

export async function deleteProject(projectId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;

        toast.success('Project deleted');
        return true;
    } catch (error: any) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
        return false;
    }
}

// ============================================
// Files
// ============================================

export async function saveProjectFiles(
    projectId: string,
    files: FileSystemState
): Promise<boolean> {
    try {
        // Delete existing files
        await supabase
            .from('files')
            .delete()
            .eq('project_id', projectId);

        // Insert new files
        const fileRecords = Object.entries(files).map(([path, fileData]) => ({
            project_id: projectId,
            path,
            content: fileData.content,
            language: fileData.language,
            size_bytes: new Blob([fileData.content]).size,
        }));

        if (fileRecords.length > 0) {
            const { error } = await supabase
                .from('files')
                .insert(fileRecords);

            if (error) throw error;
        }

        // Update project updated_at
        await supabase
            .from('projects')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', projectId);

        return true;
    } catch (error: any) {
        console.error('Error saving files:', error);
        toast.error('Failed to save files');
        return false;
    }
}

export async function loadProjectFiles(projectId: string): Promise<FileSystemState | null> {
    try {
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .eq('project_id', projectId);

        if (error) throw error;

        const fileSystem: FileSystemState = {};

        data?.forEach((file: FileRecord) => {
            fileSystem[file.path] = {
                path: file.path,
                content: file.content || '',
                language: file.language || 'plaintext',
            };
        });

        return fileSystem;
    } catch (error: any) {
        console.error('Error loading files:', error);
        return null;
    }
}

// ============================================
// Auto-save with debouncing
// ============================================

let autoSaveTimeout: NodeJS.Timeout | null = null;

export function scheduleAutoSave(
    projectId: string,
    files: FileSystemState,
    delayMs: number = 3000
): void {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    autoSaveTimeout = setTimeout(async () => {
        const success = await saveProjectFiles(projectId, files);
        if (success) {
            console.log('Auto-saved project:', projectId);
        }
    }, delayMs);
}

export function cancelAutoSave(): void {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }
}

// ============================================
// Execution History
// ============================================

export async function saveExecutionHistory(
    code: string,
    language: string,
    projectId: string | null,
    stdin: string | null,
    stdout: string | null,
    stderr: string | null,
    status: string | null,
    executionTimeMs: number | null,
    memoryKb: number | null
): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('execution_history')
            .insert({
                user_id: user.id,
                project_id: projectId,
                code,
                language,
                stdin,
                stdout,
                stderr,
                status,
                execution_time_ms: executionTimeMs,
                memory_kb: memoryKb,
            });

        if (error) throw error;

        return true;
    } catch (error: any) {
        console.error('Error saving execution history:', error);
        return false;
    }
}

export async function getExecutionHistory(projectId?: string, limit: number = 50) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
            .from('execution_history')
            .select('*')
            .eq('user_id', user.id)
            .order('executed_at', { ascending: false })
            .limit(limit);

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
    } catch (error: any) {
        console.error('Error fetching execution history:', error);
        return [];
    }
}

// ============================================
// User Preferences
// ============================================

export async function getUserPreferences() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            // Create default preferences if they don't exist
            const { data: newPrefs } = await supabase
                .from('user_preferences')
                .insert({ user_id: user.id })
                .select()
                .single();

            return newPrefs;
        }

        return data;
    } catch (error: any) {
        console.error('Error fetching preferences:', error);
        return null;
    }
}

export async function updateUserPreferences(updates: any): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('user_preferences')
            .update(updates)
            .eq('user_id', user.id);

        if (error) throw error;

        return true;
    } catch (error: any) {
        console.error('Error updating preferences:', error);
        return false;
    }
}
