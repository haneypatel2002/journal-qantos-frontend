import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MOODS, MoodKey } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';

interface MoodSelectorProps {
  selectedMood: MoodKey | null;
  onMoodSelect: (mood: MoodKey) => void;
}
export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling?</Text>
      <View style={styles.moodGrid}>
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.key;
          return (
            <TouchableOpacity
              key={mood.key}
              style={[
                styles.moodItem,
                { borderColor: isSelected ? mood.color : colors.border },
                isSelected && { backgroundColor: mood.color + '30' },
              ]}
              onPress={() => onMoodSelect(mood.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, isSelected && { color: mood.color }]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
