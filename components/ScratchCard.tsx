import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface ScratchCardProps {
  day: number;
  task: string;
  completed: boolean;
  scratched: boolean;
  unlocked: boolean;
  onScratch: () => void;
  onComplete: (note?: string) => void;
}

export default function ScratchCard({
  day,
  task,
  completed,
  scratched,
  unlocked,
  onScratch,
  onComplete,
}: ScratchCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isRevealed, setIsRevealed] = useState(scratched);
  const [note, setNote] = useState('');

  const handleScratch = () => {
    if (!unlocked || isRevealed) return;
    setIsRevealed(true);
    onScratch();
  };

  if (!unlocked) {
    return (
      <View style={[styles.card, styles.locked]}>
        <Ionicons name="lock-closed" size={20} color={colors.textMuted} style={styles.lockIcon} />
        <Text style={styles.dayLabel}>Day {day}</Text>
      </View>
    );
  }

  if (!isRevealed) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.scratchable]}
        onPress={handleScratch}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={28} color="#FFFFFF" style={styles.scratchIcon} />
        <Text style={[styles.dayLabel, { color: '#FFFFFF' }]}>Day {day}</Text>
        <Text style={styles.scratchHint}>Tap to reveal</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, styles.revealed, completed && styles.completedCard]}>
      <Text style={styles.dayLabel}>Day {day}</Text>
      <Text style={styles.taskText}>{task}</Text>

      {!completed && (
        <TextInput
          style={styles.noteInput}
          placeholder="How did it go? (Optional reflection)"
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />
      )}

      <TouchableOpacity
        style={[styles.completeBtn, completed && styles.completedBtn]}
        onPress={() => onComplete(note)}
        disabled={completed}
        activeOpacity={0.7}
      >
        <Text style={[styles.completeBtnText, completed && styles.completedBtnText]}>
          {completed ? (
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          ) : null}
          {completed ? '  Done' : 'Mark Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  locked: {
    backgroundColor: colors.surface,
    opacity: 0.5,
    flexDirection: 'row',
    gap: 10,
  },
  scratchable: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  revealed: {
    backgroundColor: colors.surface,
  },
  completedCard: {
    borderColor: colors.success + '50',
    backgroundColor: colors.success + '10',
  },
  lockIcon: {
    marginRight: 8,
  },
  scratchIcon: {
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  scratchHint: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 4,
  },
  taskText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
    marginTop: 6,
  },
  noteInput: {
    width: '100%',
    backgroundColor: colors.surfaceLight || colors.background,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    minHeight: 60,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  completedBtn: {
    backgroundColor: colors.success + '15',
    borderColor: colors.success + '30',
    borderWidth: 1,
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  completedBtnText: {
    color: colors.success,
  },
});
