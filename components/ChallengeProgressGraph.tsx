import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

interface DayProgress {
  day: number;
  completed: boolean;
}

interface ChallengeProgressGraphProps {
  progress: DayProgress[];
  completedDays: number;
}

const CELL_SIZE = 21;
const CELL_GAP = 5;
const COLS = 8;
const ROWS = 3;

export default function ChallengeProgressGraph({ progress, completedDays }: ChallengeProgressGraphProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const svgWidth = COLS * (CELL_SIZE + CELL_GAP);
  const svgHeight = ROWS * (CELL_SIZE + CELL_GAP);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenge Progress</Text>
        <Text style={styles.count}>
          {completedDays}/21 <Text style={styles.countLabel}>days</Text>
        </Text>
      </View>
      <View style={styles.graphContainer}>
        <Svg width={svgWidth} height={svgHeight}>
          {progress.map((day, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            return (
              <Rect
                key={i}
                x={col * (CELL_SIZE + CELL_GAP)}
                y={row * (CELL_SIZE + CELL_GAP)}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={6}
                ry={6}
                fill={day.completed ? colors.success : colors.surface}
                stroke={colors.border}
                strokeWidth={1}
                opacity={day.completed ? 1 : 0.8}
              />
            );
          })}
        </Svg>
      </View>
      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${(completedDays / 21) * 100}%` }]} />
      </View>
      <Text style={styles.percentage}>{Math.round((completedDays / 21) * 100)}% Complete</Text>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  count: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.success,
  },
  countLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  graphContainer: {
    backgroundColor: colors.card || colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  percentage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
});
