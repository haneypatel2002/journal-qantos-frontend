import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CHALLENGE_CATEGORIES } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface ChallengeCardProps {
  category: string;
  title: string;
  description: string;
  priority?: string;
  isStarted?: boolean;
  onPress: () => void;
}

export default function ChallengeCard({ category, title, description, priority, isStarted, onPress }: ChallengeCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const cat = CHALLENGE_CATEGORIES.find((c) => c.key === category);
  const bgColor = cat?.color || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor + '20' }]}>
          <Ionicons name={cat?.icon as any || 'star'} size={24} color={bgColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {priority === 'high' && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>Recommended</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.footer}>
        <Text style={styles.duration}>21 days</Text>
        <View style={styles.startBadge}>
          <Text style={styles.startText}>{isStarted ? 'Continue' : 'Start'} </Text>
          <Ionicons name="arrow-forward-circle" size={20} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  priorityBadge: {
    backgroundColor: colors.accent + '30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  startBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
