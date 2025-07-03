import { supabase } from '../lib/supabase';
import { useReviewStore } from '../store/useReviewStore';
import { classifyBehavior } from './classifyAgent';
import { Database } from '../types/db';

// Supabase generated type for insert
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

/**
 * Persists the current review from the Zustand store into Supabase.
 * Returns `true` on success, `false` on error.
 */
export async function saveReview(): Promise<boolean> {
  const { venue, rating, tags, story } = useReviewStore.getState();

  if (!venue || !rating) {
    console.warn('Attempted to saveReview with missing venue or rating');
    return false;
  }

  const ai = classifyBehavior(rating, tags, story);

  const payload: ReviewInsert = {
    venue,
    rating,
    tags,
    story,
    behavior_type: ai.behaviorType,
    safety_score: ai.safetyScore,
    tone: ai.tone,
  };

  const { error } = await supabase.from('reviews').insert([payload]);

  if (error) {
    console.error('Error saving review:', error);
    return false;
  }

  return true;
}
