import { Project, FileSystemState, FileData } from '../types';

const DB_NAME = 'GenAICodeAgent';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';

// IndexedDB helper class
class StorageService {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create projects store
                if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
                    const objectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
                    objectStore.createIndex('createdAt', 'createdAt', { unique: false });
                    objectStore.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    // Get all projects
    async getAllProjects(): Promise<Project[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(PROJECTS_STORE, 'readonly');
            const store = transaction.objectStore(PROJECTS_STORE);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // Get single project by ID
    async getProject(id: string): Promise<Project | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(PROJECTS_STORE, 'readonly');
            const store = transaction.objectStore(PROJECTS_STORE);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    // Save/update project
    async saveProject(project: Project): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(PROJECTS_STORE, 'readwrite');
            const store = transaction.objectStore(PROJECTS_STORE);
            const request = store.put(project);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Delete project
    async deleteProject(id: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(PROJECTS_STORE, 'readwrite');
            const store = transaction.objectStore(PROJECTS_STORE);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Migrate from localStorage to IndexedDB
    async migrateFromLocalStorage(): Promise<void> {
        const localStorageKey = 'vibing_code_projects';
        const savedData = localStorage.getItem(localStorageKey);

        if (!savedData) return;

        try {
            const projects: Project[] = JSON.parse(savedData);

            // Save each project to IndexedDB
            for (const project of projects) {
                await this.saveProject(project);
            }

            // Remove from localStorage after successful migration
            localStorage.removeItem(localStorageKey);
            console.log('Successfully migrated projects from localStorage to IndexedDB');
        } catch (error) {
            console.error('Failed to migrate from localStorage:', error);
        }
    }

    // Export all projects as JSON
    async exportAllProjects(): Promise<string> {
        const projects = await this.getAllProjects();
        return JSON.stringify(projects, null, 2);
    }

    // Import projects from JSON
    async importProjects(jsonData: string): Promise<number> {
        try {
            const projects: Project[] = JSON.parse(jsonData);
            let imported = 0;

            for (const project of projects) {
                // Generate new ID to avoid conflicts
                const newProject = {
                    ...project,
                    id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: Date.now()
                };
                await this.saveProject(newProject);
                imported++;
            }

            return imported;
        } catch (error) {
            console.error('Failed to import projects:', error);
            throw new Error('Invalid project data format');
        }
    }

    // Clear all data (for testing or reset)
    async clearAll(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(PROJECTS_STORE, 'readwrite');
            const store = transaction.objectStore(PROJECTS_STORE);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Export singleton instance
export const storageService = new StorageService();
