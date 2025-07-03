/*
 * classifyBehavior.ts – lightweight heuristic engine that converts a
 * review’s rating + tags + free‑text story into a behaviour classification,
 * safety score (1‑5), and tonal label.
 *
 * NOTE: This is a naive, fully on‑device implementation – when your backend
 * budget allows, consider swapping it out for an OpenAI API call with proper
 * moderation / sentiment analysis.
 */

export type Rating = 'Good' | 'Okay' | 'Bad' | null;

export interface ClassificationResult {
  behaviorType: 'Discriminatory' | 'Aggressive' | 'Strict' | 'Respectful' | 'Fair';
  safetyScore: number; // 1‑5
  tone: 'Positive' | 'Negative' | 'Mixed';
}

// Static keyword lists ────────────────────────────────────────────────
const TAG_RED_FLAGS = [
  'Racial profiling',
  'Sexist / inappropriate',
  'Aggressive',
  'Yelled / Power tripping',
  'Prevented entry for no reason',
] as const;

const TEXT_RED_FLAGS = [
  'racist',
  'sexist',
  'rude',
  'yell',
  'yelled',
  'aggressive',
  'garbage',
  'shout',
  'shouted',
  'scream',
  'screamed',
  'violent',
  'disrespectful',
];

// Helper – basic contains ignoring diacritics and case
function includesAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

export function classifyBehavior(
  rating: Rating,
  tags: string[],
  story: string,
): ClassificationResult {
  let behaviorType: ClassificationResult['behaviorType'] = 'Fair';
  const lowerStory = story.toLowerCase();

  const containsRedFlag =
    tags.some((t) => TAG_RED_FLAGS.includes(t as (typeof TAG_RED_FLAGS)[number])) ||
    includesAny(lowerStory, TEXT_RED_FLAGS);

  // Behaviour group
  if (
    tags.includes('Racial profiling') ||
    tags.includes('Sexist / inappropriate') ||
    includesAny(lowerStory, ['racist', 'sexist'])
  )
    behaviorType = 'Discriminatory';
  else if (
    tags.includes('Aggressive') ||
    tags.includes('Yelled / Power tripping') ||
    includesAny(lowerStory, ['yell', 'shout', 'scream'])
  )
    behaviorType = 'Aggressive';
  else if (tags.includes('Prevented entry for no reason')) behaviorType = 'Strict';
  else if (tags.some((t) => ['Respectful', 'Friendly', 'Calm'].includes(t))) behaviorType = 'Respectful';

  // ───────────────────────────── Safety score
  let score = rating === 'Good' ? 5 : rating === 'Okay' ? 3 : 1; // default 1 on null / Bad
  if (tags.includes('Respectful') || tags.includes('Protected me')) score += 1;
  if (containsRedFlag) score -= 1;
  score = Math.max(1, Math.min(score, 5));

  // ───────────────────────────── Tone
  let tone: ClassificationResult['tone'] = 'Mixed';
  if (score >= 4) tone = 'Positive';
  else if (score <= 2 || containsRedFlag) tone = 'Negative';

  return { behaviorType, safetyScore: score, tone };
}
