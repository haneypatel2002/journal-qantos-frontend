import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { MOOD_MAP, MoodKey } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');
const CELL_SIZE = 14;
const CELL_GAP = 3;
const WEEKS_TO_SHOW = 16;
const DAYS_IN_WEEK = 7;

interface MoodDataPoint {
  date: string;
  mood: string;
}

interface MoodGraphProps {
  data: MoodDataPoint[];
}

interface DayData {
  date: string;
  mood: string | null;
}

function getWeeksData(data: MoodDataPoint[]): DayData[][] {
  const moodMap = new Map(data.map((d) => [d.date, d.mood]));
  const weeks: DayData[][] = [];
  const today = new Date();

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS_TO_SHOW * 7 - 1));
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  let currentWeek: DayData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    currentWeek.push({
      date: dateStr,
      mood: moodMap.get(dateStr) || null
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const dateStr = currentDate.toISOString().split('T')[0];
      currentWeek.push({ date: dateStr, mood: null });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export default function MoodGraph({ data }: MoodGraphProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const weeks = getWeeksData(data);
  const svgWidth = weeks.length * (CELL_SIZE + CELL_GAP) + 40;
  const svgHeight = DAYS_IN_WEEK * (CELL_SIZE + CELL_GAP) + 40;
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMoodColor = (mood: string | null): string => {
    if (!mood) return colors.surface;
    const m = MOOD_MAP[mood as MoodKey];
    return m ? m.graphColor : colors.surface;
  };

  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const labels = useMemo(() => {
    const monthYearLabels: { label: string; x: number; isYear?: boolean }[] = [];
    let lastMonth = -1;
    let lastYear = -1;

    weeks.forEach((week, i) => {
      const firstDay = new Date(week[0].date);
      const month = firstDay.getMonth();
      const year = firstDay.getFullYear();
      
      if (year !== lastYear) {
        monthYearLabels.push({
          label: year.toString(),
          x: i * (CELL_SIZE + CELL_GAP) + 28,
          isYear: true
        });
        lastYear = year;
        lastMonth = month;
      } else if (month !== lastMonth) {
        monthYearLabels.push({
          label: firstDay.toLocaleDateString(undefined, { month: 'short' }),
          x: i * (CELL_SIZE + CELL_GAP) + 28
        });
        lastMonth = month;
      }
    });
    return monthYearLabels;
  }, [weeks]);

  const selectedMoodInfo = selectedDay?.mood ? MOOD_MAP[selectedDay.mood as MoodKey] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood History</Text>
      <View style={styles.graphContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Svg width={svgWidth} height={svgHeight}>
            {/* Month/Year labels */}
            {labels.map((l, i) => (
              <SvgText
                key={`label-${i}`}
                x={l.x}
                y={12}
                fontSize={l.isYear ? 11 : 9}
                fill={l.isYear ? colors.text : colors.textSecondary}
                fontWeight={l.isYear ? "800" : "600"}
              >
                {l.label}
              </SvgText>
            ))}

            {/* Day labels */}
            {dayLabels.map((label, i) =>
              label ? (
                <SvgText
                  key={`day-${i}`}
                  x={0}
                  y={i * (CELL_SIZE + CELL_GAP) + CELL_SIZE + 25}
                  fontSize={9}
                  fill={colors.textMuted}
                >
                  {label}
                </SvgText>
              ) : null
            )}

            {/* Grid cells */}
            {weeks.map((week, weekIdx) =>
              week.map((day, dayIdx) => {
                const isSelected = selectedDay?.date === day.date;
                return (
                  <Rect
                    key={`${weekIdx}-${dayIdx}`}
                    x={weekIdx * (CELL_SIZE + CELL_GAP) + 28}
                    y={dayIdx * (CELL_SIZE + CELL_GAP) + 22}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={3}
                    ry={3}
                    fill={day.mood ? getMoodColor(day.mood) : colors.border}
                    stroke={isSelected ? colors.primary : colors.border}
                    strokeWidth={isSelected ? 1.5 : 0.5}
                    opacity={day.mood ? 1 : 0.2}
                    onPress={() => setSelectedDay(day)}
                  />
                );
              })
            )}
          </Svg>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Less</Text>
        {Object.values(MOOD_MAP).map((mood) => (
          <View key={mood.key} style={[styles.legendDot, { backgroundColor: mood.graphColor }]} />
        ))}
        <Text style={styles.legendTitle}>More</Text>
      </View>

      {/* Selection Details */}
      {selectedDay && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailDate}>{formatDateLabel(selectedDay.date)}</Text>
            <TouchableOpacity onPress={() => setSelectedDay(null)}>
              <Text style={styles.closeText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailContent}>
            {selectedDay.mood ? (
              <View style={styles.moodResult}>
                <Text style={styles.moodEmoji}>{selectedMoodInfo?.emoji}</Text>
                <Text style={[styles.moodLabel, { color: selectedMoodInfo?.color }]}>
                  {selectedMoodInfo?.label}
                </Text>
              </View>
            ) : (
              <Text style={styles.noEntryText}>No journal entry for this day</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  graphContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  legendTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 14,
  },
  detailCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailDate: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  closeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  detailContent: {
    alignItems: 'center',
  },
  moodResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  noEntryText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
