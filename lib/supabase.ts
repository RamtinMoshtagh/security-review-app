import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/db';

/* ─────────────────────── Env ------------------------------------------------------------------ */
const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env variables. Did you set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY?',
  );
}

/* ─────────────────────── Client (typed) ------------------------------------------------------- */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);

/* ─────────────────────── Helpers -------------------------------------------------------------- */
const normalise = (s: string) =>
  s.trim().replace(/[’']/g, "'").replace(/\s+/g, ' ').toLowerCase();

/* ─────────────────────── Ranked venues -------------------------------------------------------- */
export async function getTopVenuesByRating(
  rating: 'Good' | 'Bad',
  limit = 10,
) {
  const { data } = await supabase.from('reviews').select('venue').eq('rating', rating);

  if (!data) return [];

  const tally: Record<string, { display: string; count: number }> = {};
  data.forEach(({ venue }) => {
    if (!venue) return;
    const key = normalise(venue);
    tally[key] = tally[key] || { display: venue, count: 0 };
    tally[key].count += 1;
  });

  return Object.values(tally)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ display, count }) => ({ venue: display, count }));
}

/* ─────────────────────── Quick insights ------------------------------------------------------- */
export async function getInsights() {
  const [
    { data: venueData },
    { data: tagData },
    { data: toneData },
    { count: totalReviews },
  ] = await Promise.all([
    supabase.from('reviews').select('venue'),
    supabase.from('reviews').select('tags'),
    supabase.from('reviews').select('tone'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ]);

  const most = (arr: (string | null)[]) =>
    Object.entries(
      arr.reduce<Record<string, number>>((o, k) => {
        if (k) o[k] = (o[k] || 0) + 1;
        return o;
      }, {}),
    ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  return {
    mostReviewedVenue: most((venueData ?? []).map((v) => v.venue)),
    mostFlaggedTag:    most((tagData   ?? []).flatMap((t) => t.tags ?? [])),
    avgTone:           most((toneData  ?? []).map((t) => t.tone)),
    totalReviews:      totalReviews ?? 0,
  };
}

/* ─────────────────────── Review voting -------------------------------------------------------- */
/**
 * Use the Postgres function `vote_review(p_review uuid, p_delta int)` created in the DB.
 * Returns the new vote_sum.
 * NOTE: The RPC isn’t typed in the generated `Database` file, so cast the client to `any`
 * to silence TS until you update your generated types.
 */
export async function voteReview(reviewId: string, delta: 1 | -1) {
  const { data, error } = await (supabase as any).rpc('vote_review', {
    p_review: reviewId,
    p_delta : delta,
  });

  if (error) throw error;
  return (data as number) ?? 0;
}
