import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import ScratchCard from '../../components/ScratchCard';
import ChallengeProgressGraph from '../../components/ChallengeProgressGraph';
import { fetchUser } from '../../store/userSlice';
import { completeDay, fetchChallenges } from '../../store/challengeSlice';
import { CHALLENGE_CATEGORIES } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import type { AppDispatch, RootState } from '../../store/store';
import { useTheme } from '../../hooks/useTheme';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { id: userId } = useSelector((state: RootState) => state.user);
  const { challenges } = useSelector((state: RootState) => state.challenge);

  const challenge = challenges.find((c) => c._id === id);

  useEffect(() => {
    if (userId && !challenge) {
      dispatch(fetchChallenges(userId));
    }
  }, [userId, id]);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading challenge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Fix: Calculate days since start using consistent date formatting to avoid timezone offsets
  const startDate = new Date(challenge.startDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const cat = CHALLENGE_CATEGORIES.find((c) => c.key === challenge.category);

  const handleScratchAndComplete = (dayNum: number, note?: string) => {
    dispatch(completeDay({ challengeId: challenge._id, day: dayNum, note })).then((action: any) => {
      // Refresh user to update entry counts/streaks since a journal entry was created
      dispatch(fetchUser(userId!));
      if (action.payload?.completedDays === 21) {
        Alert.alert('🎉 Congratulations!', 'You completed the 21-day challenge! Amazing work!');
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <View style={{ width: 44 }} />
      </View> */}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Challenge Header Info */}
        <View style={styles.challengeHeader}>
          <View style={[styles.mainIconBg, { backgroundColor: (cat?.color || colors.primary) + '20' }]}>
            <Ionicons name={cat?.icon as any || 'star'} size={40} color={cat?.color || colors.primary} />
          </View>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDesc}>{challenge.description}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {challenge.status === 'active' ? '🟢 Active' : challenge.status === 'completed' ? '✅ Completed' : '⏹ Ended'}
            </Text>
          </View>
        </View>

        {/* Progress Graph */}
        <ChallengeProgressGraph
          progress={challenge.progress}
          completedDays={challenge.completedDays}
        />

        {/* Scratch Cards */}
        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>Daily Tasks</Text>
          {challenge.progress.map((day) => {
            const isUnlocked = day.day <= daysSinceStart + 1;
            return (
              <ScratchCard
                key={day.day}
                day={day.day}
                task={day.task}
                completed={day.completed}
                scratched={day.scratched}
                unlocked={isUnlocked}
                onScratch={() => {}}
                onComplete={() => handleScratchAndComplete(day.day)}
              />
            );
          })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth:1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  challengeHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  mainIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  challengeDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  statusBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  cardsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
