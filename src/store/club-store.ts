import { create } from 'zustand';

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  coverImage: string | null;
  category: string;
  isActive: boolean;
  foundedYear: number | null;
  facultyAdvisorId: string | null;
  facultyAdvisor?: { id: string; name: string; email: string } | null;
  members?: { id: string; role: string; user: { id: string; name: string; email: string; avatar: string | null } }[];
  events?: any[];
  _count?: { members: number; events: number };
}

interface ClubState {
  clubs: Club[];
  currentClub: Club | null;
  isLoading: boolean;
  error: string | null;
  fetchClubs: () => Promise<void>;
  fetchClubById: (id: string) => Promise<void>;
  createClub: (data: any) => Promise<void>;
  joinClub: (clubId: string) => Promise<void>;
  leaveClub: (clubId: string) => Promise<void>;
  clearCurrentClub: () => void;
}

function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('nexevent-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.user?.id ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

export const useClubStore = create<ClubState>()((set, get) => ({
  clubs: [],
  currentClub: null,
  isLoading: false,
  error: null,

  fetchClubs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/clubs');
      if (!res.ok) throw new Error('Failed to fetch clubs');
      const data = await res.json();
      set({ clubs: data.clubs, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to fetch clubs' });
    }
  },

  fetchClubById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/clubs/${id}`);
      if (!res.ok) throw new Error('Failed to fetch club');
      const data = await res.json();
      set({ currentClub: data.club, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to fetch club' });
    }
  },

  createClub: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const userId = getUserId();
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
        body: JSON.stringify({ ...data, userId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create club');
      }
      await get().fetchClubs();
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to create club' });
      throw err;
    }
  },

  joinClub: async (clubId: string) => {
    try {
      const userId = getUserId();
      const res = await fetch(`/api/clubs/${clubId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to join club');
      }
      await get().fetchClubById(clubId);
    } catch (err) {
      throw err;
    }
  },

  leaveClub: async (clubId: string) => {
    try {
      const userId = getUserId();
      const res = await fetch(`/api/clubs/${clubId}/members?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to leave club');
      }
      await get().fetchClubById(clubId);
    } catch (err) {
      throw err;
    }
  },

  clearCurrentClub: () => set({ currentClub: null }),
}));
