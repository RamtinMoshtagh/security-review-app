import { create } from 'zustand';

export type Rating = 'Good' | 'Okay' | 'Bad' | null;

interface ReviewState {
  venue: string;
  rating: Rating;
  tags: string[];
  story: string;

  // ─────────────────────────── Mutators
  setVenue: (venue: string) => void;
  setRating: (rating: Exclude<Rating, null>) => void;
  toggleTag: (tag: string) => void;
  setStory: (story: string) => void;
  reset: () => void;
}

/**
 * Centralised Zustand slice for a single in‑progress review.
 * Call `reset()` once the review is submitted.
 */
export const useReviewStore = create<ReviewState>((set, get) => ({
  venue: '',
  rating: null,
  tags: [],
  story: '',

  setVenue: (venue) => set({ venue }),
  setRating: (rating) => set({ rating }),

  toggleTag: (tag) => {
    const { tags } = get();
    set({ tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] });
  },

  setStory: (story) => set({ story }),

  reset: () => set({ venue: '', rating: null, tags: [], story: '' }),
}));
