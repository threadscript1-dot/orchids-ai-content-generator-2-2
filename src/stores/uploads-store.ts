import { create } from 'zustand';
import { api } from '@/api/client';

export interface Upload {
    id: string;
    url: string;
    original_name: string | null;
    type: 'image' | 'video' | 'audio';
    mime_type: string;
    size: number;
    created_at: string;
}

interface UploadsState {
    uploads: Upload[];
    isLoading: boolean;
    error: string | null;
    nextCursor: string | null;
    hasMore: boolean;

    fetchUploads: (type?: 'image' | 'video' | 'audio', reset?: boolean) => Promise<void>;
    deleteUploads: (ids: string[]) => Promise<{ deleted: string[]; notFound: string[] }>;
    reset: () => void;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
    uploads: [],
    isLoading: false,
    error: null,
    nextCursor: null,
    hasMore: true,

    fetchUploads: async (type, reset = false) => {
        const state = get();
        if (state.isLoading) return;
        if (!reset && !state.hasMore) return;

        set({ isLoading: true, error: null });

        try {
            const cursor = reset ? undefined : state.nextCursor ?? undefined;

            const { data, error } = await api.GET('/uploads/', {
                params: {
                    query: { type, cursor, limit: '20' },
                },
            });

            if (error) {
                set({ error: 'Failed to fetch uploads', isLoading: false });
                return;
            }

            const items = data?.items ?? [];
            const nextCursor = data?.next_cursor ?? null;

            set({
                uploads: reset ? items : [...state.uploads, ...items],
                nextCursor,
                hasMore: nextCursor !== null,
                isLoading: false,
            });
        } catch (e) {
            set({ error: 'Failed to fetch uploads', isLoading: false });
        }
    },

    deleteUploads: async (ids) => {
        const { data, error } = await api.DELETE('/uploads/', {
            body: { ids },
        });

        if (error || !data) {
            throw new Error('Failed to delete uploads');
        }

        // Remove deleted uploads from state
        set((state) => ({
            uploads: state.uploads.filter((u) => !data.deleted.includes(u.id)),
        }));

        return { deleted: data.deleted, notFound: data.not_found };
    },

    reset: () => {
        set({ uploads: [], nextCursor: null, hasMore: true, error: null });
    },
}));
