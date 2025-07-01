import { create } from 'zustand';

interface ReviewState {
  venue: string;
  rating: 'Good' | 'Okay' | 'Bad' | null;
  tags: string[];
  story: string;
  setVenue: (venue: string) => void;
  setRating: (rating: 'Good' | 'Okay' | 'Bad') => void;
  toggleTag: (tag: string) => void;
  setStory: (story: string) => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  venue: '',
  rating: null,
  tags: [],
  story: '',
  setVenue: (venue) => set({ venue }),
  setRating: (rating) => set({ rating }),
  toggleTag: (tag) => {
    const { tags } = get();
    set({ tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] });
  },
  setStory: (story) => set({ story }),
  reset: () => set({ venue: '', rating: null, tags: [], story: '' }),
}));
