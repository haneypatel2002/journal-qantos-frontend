import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import MoodGraph from '../../components/MoodGraph';
import { fetchMoodData } from '../../store/journalSlice';
import { MOOD_MAP, MoodKey } from '../../utils/constants';
import { useTheme } from '../../hooks/useTheme';
import type { AppDispatch, RootState } from '../../store/store';

export default function MoodGraphScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { id: userId } = useSelector((state: RootState) => state.user);
  const { moodData, entries } = useSelector((state: RootState) => state.journal);

  useEffect(() => {
    if (userId) {
      dispatch(fetchMoodData({ userId, months: 4 }));
    }
  }, [userId, entries.length]);

  // Calculate mood distribution from entries
  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  const totalEntries = entries.length;
  const sortedMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mood Overview</Text>
          <Text style={styles.subtitle}>Your emotional patterns</Text>
        </View>

        <MoodGraph data={moodData} />

        {/* Mood Distribution */}
        <View style={styles.distributionContainer}>
          <Text style={styles.sectionTitle}>Mood Distribution</Text>
          {sortedMoods.length > 0 ? (
            sortedMoods.map(([mood, count]) => {
              const m = MOOD_MAP[mood as MoodKey];
              const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;

              return (
                <View key={mood} style={styles.moodRow}>
                  <View style={styles.moodInfo}>
                    <Text style={styles.moodEmoji}>{m?.emoji || '?'}</Text>
                    <Text style={styles.moodLabel}>{m?.label || mood}</Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { width: `${percentage}%`, backgroundColor: m?.graphColor || colors.primary },
                      ]}
                    />
                  </View>
                  <Text style={styles.moodCount}>{percentage}%</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={44} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>Start journaling to see your mood distribution</Text>
            </View>
          )}
        </View>

        {/* Monthly Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Journal History</Text>
          <TouchableOpacity 
            style={styles.insightCard}
            onPress={() => router.push('/all-entries')}
            activeOpacity={0.7}
          >
            <Text style={styles.insightEmoji}>
              {sortedMoods.length > 0 ? MOOD_MAP[sortedMoods[0][0] as MoodKey]?.emoji || '😊' : <Ionicons name="bulb-outline" size={28} color={colors.primary} />}
            </Text>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>
                {sortedMoods.length > 0
                  ? `You feel ${sortedMoods[0][0]} most often`
                  : 'No data yet'}
              </Text>
              <Text style={styles.insightDesc}>
                {sortedMoods.length > 0
                  ? `${sortedMoods[0][0]} appeared in ${Math.round((sortedMoods[0][1] / totalEntries) * 100)}% of your entries`
                  : 'Add journal entries to see insights'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  distributionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  moodCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    width: 40,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryContainer: {
    paddingHorizontal: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  insightDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
