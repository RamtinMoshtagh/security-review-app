// navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

/* ───────────────────────── Review-tab stack ───────────────────────── */

export type ReviewStackParamList = {
  ReviewFlow:   { prefillVenue?: string } | undefined;
  Confirmation: undefined;
  VenueDetail:  { venue: string };
  VenueList:    { filter?: 'good' | 'bad' | `tag:${string}` } | undefined;
};

/* ───────────────────────── Bottom-tab root ──────────────────────────
   The Review tab hosts a nested stack, so we wrap its params with
   `NavigatorScreenParams<…>` — this lets us write:
       navigation.navigate('ReviewStack', { screen: 'VenueList', params: { filter: 'good' } })
   without TypeScript errors.
*/

export type RootTabParamList = {
  Home:         undefined;
  ReviewStack:  NavigatorScreenParams<ReviewStackParamList>;
  Insights:     undefined;
};  
