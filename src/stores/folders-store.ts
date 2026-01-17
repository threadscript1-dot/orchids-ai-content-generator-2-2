'use client';

import { create } from 'zustand';
import { api } from '@/api/client';
import { Generation } from './generation-store';

export interface Folder {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    itemCount: number;
    items?: Generation[];
}

interface FoldersState {
    folders: Folder[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchFolders: () => Promise<void>;
    fetchFolderDetails: (id: string) => Promise<Folder | null>;
    createFolder: (name: string) => Promise<Folder | null>;
    renameFolder: (id: string, name: string) => Promise<boolean>;
    deleteFolder: (id: string) => Promise<boolean>;
    addToFolder: (folderId: string, generationIds: string | string[]) => Promise<boolean>;
    removeFromFolder: (folderId: string, generationIds: string | string[]) => Promise<boolean>;
    getFoldersForGeneration: (generationId: string) => Promise<Folder[]>;
}

// Helper to map backend folder data to our frontend interface
const mapFolder = (data: any): Folder => {
    if (!data) {
        return {
            id: '',
            name: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            itemCount: 0,
            items: [],
        };
    }

    return {
        id: String(data.id || ''),
        name: data.name || '',
        createdAt: data.createdAt || data.created_at || new Date().toISOString(),
        updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
        itemCount: data.itemCount ?? data.item_count ?? 0,
        items: data.items ? mapFolderItems(data.items) : undefined,
    };
};

// Helper to map folder items (generations) to frontend format
const mapFolderItems = (items: any[]): Generation[] => {
    return items.map((item) => ({
        id: item.id,
        type: item.type as 'image' | 'video' | 'audio',
        model: item.internalModelId || item.model || '',
        status: item.status as 'queued' | 'processing' | 'success' | 'failed',
        prompt: item.prompt || '',
        cost_credits: item.costCredits ?? item.cost_credits ?? 0,
        result_assets: item.resultAssetsJson || item.result_assets || [],
        error: item.errorMsg || item.error,
        created_at: item.createdAt || item.created_at || new Date().toISOString(),
        updated_at: item.updatedAt || item.updated_at,
        is_favorite: item.is_favorite,
    }));
};

export const useFoldersStore = create<FoldersState>()((set, get) => ({
    folders: [],
    isLoading: false,
    error: null,

    fetchFolders: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await api.GET('/folders/');
            if (error) {
                set({ error: 'Failed to fetch folders', isLoading: false });
                return;
            }

            if (data && typeof data === 'object' && 'data' in data) {
                const result = (data as any).data;
                if (Array.isArray(result)) {
                    set({ folders: result.map(mapFolder), isLoading: false });
                } else {
                    set({ folders: [], isLoading: false });
                }
            } else {
                set({ folders: [], isLoading: false });
            }
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error', isLoading: false });
        }
    },

    fetchFolderDetails: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await api.GET('/folders/{id}', {
                params: { path: { id } },
            });
            set({ isLoading: false });

            if (error) {
                set({ error: 'Failed to fetch folder details' });
                return null;
            }

            if (data && typeof data === 'object' && 'data' in data) {
                return mapFolder((data as any).data);
            }
            return null;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error', isLoading: false });
            return null;
        }
    },

    createFolder: async (name: string) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/folders/', {
                body: { name },
            });

            if (error) {
                set({ error: 'Failed to create folder' });
                return null;
            }

            if (data && typeof data === 'object' && 'data' in data) {
                const newFolder = mapFolder((data as any).data);
                set((state) => ({ folders: [newFolder, ...state.folders] }));
                return newFolder;
            }
            return null;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return null;
        }
    },

    renameFolder: async (id: string, name: string) => {
        set({ error: null });
        try {
            const { error } = await api.PATCH('/folders/{id}', {
                params: { path: { id } },
                body: { name },
            });

            if (error) {
                set({ error: 'Failed to rename folder' });
                return false;
            }

            set((state) => ({
                folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)),
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return false;
        }
    },

    deleteFolder: async (id: string) => {
        set({ error: null });
        try {
            const { error } = await api.DELETE('/folders/{id}', {
                params: { path: { id } },
            });

            if (error) {
                set({ error: 'Failed to delete folder' });
                return false;
            }

            set((state) => ({
                folders: state.folders.filter((f) => f.id !== id),
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return false;
        }
    },

    addToFolder: async (folderId: string, generationIds: string | string[]) => {
        const ids = Array.isArray(generationIds) ? generationIds : [generationIds];
        set({ error: null });
        try {
            const { error } = await api.POST('/folders/{id}/items', {
                params: { path: { id: folderId } },
                body: { generation_ids: ids } as any,
            });

            if (error) {
                set({ error: 'Failed to add items to folder' });
                return false;
            }

            // Update local count
            set((state) => ({
                folders: state.folders.map((f) =>
                    f.id === folderId ? { ...f, itemCount: f.itemCount + ids.length } : f
                ),
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return false;
        }
    },

    removeFromFolder: async (folderId: string, generationIds: string | string[]) => {
        const ids = Array.isArray(generationIds) ? generationIds : [generationIds];
        set({ error: null });
        try {
            const { error } = await api.DELETE('/folders/{id}/items', {
                params: { path: { id: folderId } },
                body: { generation_ids: ids } as any,
            });

            if (error) {
                set({ error: 'Failed to remove items from folder' });
                return false;
            }

            set((state) => ({
                folders: state.folders.map((f) =>
                    f.id === folderId ? { ...f, itemCount: Math.max(0, f.itemCount - ids.length) } : f
                ),
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return false;
        }
    },

    getFoldersForGeneration: async (generationId: string) => {
        try {
            const { data, error } = await api.GET('/folders/for-generation/{generationId}', {
                params: { path: { generationId } },
            });

            if (error || !data) return [];

            if (typeof data === 'object' && 'data' in data) {
                const result = (data as any).data;
                if (Array.isArray(result)) {
                    return result.map(mapFolder);
                }
            }
            return [];
        } catch {
            return [];
        }
    },
}));
