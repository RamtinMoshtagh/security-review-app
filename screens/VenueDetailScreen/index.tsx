// screens/VenueDetailScreen/index.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  Card,
  Divider,
  IconButton,
} from 'react-native-paper';
import {
  useRoute,
  RouteProp,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';

import { supabase, voteTag } from '../../lib/supabase';
import { ReviewStackParamList, RootTabParamList } from '../../navigation/types';

export type TagCount = { tag: string; count: number };
export type TagOption = { label: string; emoji: string };
export type CommentRow = {
  id: string;
  comment: string;
  created_at: string;
};

type RouteT = RouteProp<ReviewStackParamList, 'VenueDetail'>;

export const TAG_OPTIONS: TagOption[] = [
  { emoji: '✅', label: 'Respectful' },
  { emoji: '🛡️', label: 'Protected me' },
  { emoji: '🙂', label: 'Friendly' },
  { emoji: '🧘', label: 'Calm' },
  { emoji: '😡', label: 'Aggressive' },
  { emoji: '🧍🏾', label: 'Racial profiling' },
  { emoji: '❌', label: 'Sexist / inappropriate' },
  { emoji: '🥴', label: 'Drunk' },
  { emoji: '🔈', label: 'Yelled / Power tripping' },
  { emoji: '🚷', label: 'Prevented entry for no reason' },
];

const SAMPLE_COMMENTS: CommentRow[] = [
  {
    id: '1',
    comment: 'Bouncers were super friendly and helped us skip the line!',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    comment: 'Felt a bit tense at the door, but overall decent security.',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '3',
    comment: 'Guard was overly aggressive for no reason.',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const VenueDetailScreen: React.FC = () => {
  const theme      = useTheme();
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const { params } = useRoute<RouteT>();
  const { venue }  = params;

  const [loadingTags,    setLoadingTags]    = useState(true);
  const [tagCounts,      setTagCounts]      = useState<TagCount[]>([]);
  const [totalVotes,     setTotalVotes]     = useState(0);
  const [votedTags,      setVotedTags]      = useState<Set<string>>(new Set());

  const [loadingComments, setLoadingComments] = useState(false);
  const [comments,        setComments]        = useState<CommentRow[]>(SAMPLE_COMMENTS);

  // Fetch tag stats
  const loadTagStats = async () => {
    setLoadingTags(true);
    const { data, error } = await supabase
      .from('venue_tag_stats')
      .select('tag,count')
      .eq('venue', venue);

    if (!error && Array.isArray(data)) {
      setTagCounts(data as TagCount[]);
      setTotalVotes((data as TagCount[]).reduce((sum, t) => sum + t.count, 0));
    }
    setLoadingTags(false);
  };

  // Fetch comments (overwrite samples once loaded)
  const loadComments = async () => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('id, comment, created_at')
      .eq('venue', venue)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && Array.isArray(data) && data.length) {
      setComments(
        (data as unknown as CommentRow[]).map(c => ({
          ...c,
          comment: c.comment.trim().slice(0, 200),
        }))
      );
    }
    setLoadingComments(false);
  };

  useEffect(() => {
    loadTagStats();
    loadComments();
  }, [venue]);

  // Handle tag vote
  const handleTagVote = async (tag: string) => {
    if (votedTags.has(tag)) return;
    setTagCounts(prev =>
      prev.map(t => (t.tag === tag ? { ...t, count: t.count + 1 } : t))
    );
    setTotalVotes(prev => prev + 1);
    setVotedTags(prev => new Set(prev).add(tag));
    try { await voteTag(venue, tag) } catch (e) { console.error(e) }
  };

  if (loadingTags) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          How’s security at{"\n"}{venue}?
        </Text>

        {/* Tag grid */}
        <View style={styles.grid}>
          {TAG_OPTIONS.map(opt => {
            const count    = tagCounts.find(t => t.tag === opt.label)?.count ?? 0;
            const pct      = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const selected = votedTags.has(opt.label);
            return (
              <Pressable
                key={opt.label}
                style={[
                  styles.card,
                  { backgroundColor: selected
                      ? theme.colors.primary
                      : theme.colors.surface
                  }
                ]}
                onPress={() => handleTagVote(opt.label)}
                disabled={selected}
              >
                <Text style={styles.emoji}>{opt.emoji}</Text>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                  {opt.label}
                </Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, {
                    width: `${pct}%`,
                    backgroundColor: theme.colors.primary,
                  }]} />
                </View>
                <Text style={styles.count}>{count} ({pct}%)</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.note, { color: theme.colors.outline }]}>
          You can select one tag per visit—thank you!
        </Text>

        <Divider style={styles.divider} />

        {/* Comments */}
        <View style={styles.commentsHeader}>
          <Text style={[styles.commentsTitle, { color: theme.colors.onSurface }]}>
            Recent Comments
          </Text>
          <IconButton icon="refresh" size={20} onPress={loadComments} />
        </View>

        {loadingComments ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          comments.map(c => (
            <Card
              key={c.id}
              style={[styles.commentCard, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content>
                <Text style={{ color: theme.colors.onSurface }}>
                  {c.comment}
                </Text>
                <Text style={styles.commentDate}>
                  {new Date(c.created_at).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}

        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>← Back to list</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VenueDetailScreen;

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  scroll:      { padding: 16, paddingBottom: 32 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:       { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card:        { width: '48%', marginBottom: 12, padding: 12, borderRadius: 12, alignItems: 'center' },
  emoji:       { fontSize: 28, marginBottom: 4 },
  label:       { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  barBg:       { width: '100%', height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  barFill:     { height: 6 },
  count:       { fontSize: 12, textAlign: 'center' },
  note:        { textAlign: 'center', marginVertical: 12 },
  divider:     { marginVertical: 16 },
  commentsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  commentsTitle:  { fontSize: 18, fontWeight: '600' },
  commentCard:    { marginBottom: 8 },
  commentDate:    { fontSize: 10, color: '#888', marginTop: 4 },
  backBtn:        { marginTop: 16, alignSelf: 'center' },
});
