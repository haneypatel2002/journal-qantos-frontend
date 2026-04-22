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
  const svgWidth = weeks.length * (CELL_SIZE + CELL_GAP) + 10;
  const svgHeight = DAYS_IN_WEEK * (CELL_SIZE + CELL_GAP) + 25;
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Traditional GitHub style

  const getMoodColor = (mood: string | null): string => {
    if (!mood) return colors.surface;
    const m = MOOD_MAP[mood as MoodKey];
    return m ? m.graphColor : colors.surface;
  };

  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const labels = useMemo(() => {
    const monthYearLabels: { label: string; x: number; isYear?: boolean; isCurrent?: boolean }[] = [];
    let lastMonth = -1;
    let lastYear = -1;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    weeks.forEach((week, i) => {
      const firstDay = new Date(week[0].date + 'T00:00:00');
      const month = firstDay.getMonth();
      const year = firstDay.getFullYear();
      
      const isCurrentMonth = month === currentMonth && year === currentYear;

      if (year !== lastYear) {
        // If year changes within the first few weeks, remove the initial year label to avoid overlap
        if (i > 0 && i < 4 && monthYearLabels.length > 0) {
          monthYearLabels.pop();
        }
        const monthName = firstDay.toLocaleDateString(undefined, { month: 'short' });
        monthYearLabels.push({
          label: `${monthName} ${year}`,
          x: i * (CELL_SIZE + CELL_GAP),
          isYear: true
        });
        lastYear = year;
        lastMonth = month;
      } else if (month !== lastMonth && (i % 4 === 0 || isCurrentMonth)) { 
        // Avoid month label overlapping if it's too close to the start label
        if (i > 0 && i < 3 && monthYearLabels.length > 0) {
          lastMonth = month; // Consume the month change but don't label it to avoid overlap
        } else {
          monthYearLabels.push({
            label: firstDay.toLocaleDateString(undefined, { month: 'short' }),
            x: i * (CELL_SIZE + CELL_GAP),
            isCurrent: isCurrentMonth
          });
          lastMonth = month;
        }
      }
    });
    return monthYearLabels;
  }, [weeks]);

  const selectedMoodInfo = selectedDay?.mood ? MOOD_MAP[selectedDay.mood as MoodKey] : null;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mood History</Text>
      </View>

      <View style={styles.graphWrapper}>
        <View style={styles.dayLabelsCol}>
          {dayLabels.map((l, i) => (
            <Text key={i} style={styles.dayLabelText}>{l}</Text>
          ))}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollPadding}
          ref={(ref) => ref?.scrollToEnd({ animated: false })}
        >
          <Svg width={svgWidth} height={svgHeight}>
            {/* Month labels */}
            {labels.map((l, i) => (
              <SvgText
                key={`label-${i}`}
                x={l.x}
                y={10}
                fontSize={9}
                fill={l.isCurrent ? colors.primary : (l.isYear ? colors.text : colors.textMuted)}
                fontWeight={l.isCurrent || l.isYear ? "800" : "700"}
              >
                {l.label}
              </SvgText>
            ))}

            {/* Grid cells */}
            {weeks.map((week, weekIdx) =>
              week.map((day, dayIdx) => {
                const isSelected = selectedDay?.date === day.date;
                const isToday = day.date === todayStr;
                const moodColor = day.mood ? getMoodColor(day.mood) : colors.surface;
                
                return (
                  <Rect
                    key={`${weekIdx}-${dayIdx}`}
                    x={weekIdx * (CELL_SIZE + CELL_GAP)}
                    y={dayIdx * (CELL_SIZE + CELL_GAP) + 18}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={3}
                    ry={3}
                    fill={moodColor}
                    stroke={isSelected ? colors.primary : (isToday ? colors.primaryLight : 'grey')}
                    strokeWidth={isSelected ? 1.5 : (isToday ? 1 : 0.5)}
                    opacity={day.mood ? 1 : 0.4}
                    onPress={() => setSelectedDay(day)}
                  />
                );
              })
            )}
          </Svg>
        </ScrollView>
      </View>

      {/* Selection Details */}
      {selectedDay && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View>
              <Text style={styles.detailDate}>{formatDateLabel(selectedDay.date)}</Text>
              {selectedDay.mood ? (
                <View style={styles.moodBadge}>
                  <Text style={styles.moodEmoji}>{selectedMoodInfo?.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: selectedMoodInfo?.color }]}>
                    {selectedMoodInfo?.label}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noEntryText}>No activity recorded</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => setSelectedDay(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  legendMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendSmallText: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  graphWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  dayLabelsCol: {
    paddingTop: 18, // Aligns with grid y offset
    marginRight: 8,
    width: 25,
  },
  dayLabelText: {
    fontSize: 9,
    height: CELL_SIZE + CELL_GAP,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  scrollPadding: {
    paddingRight: 10,
  },
  detailCard: {
    backgroundColor: colors.primary + '08',
    padding: 16,
    borderRadius: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  noEntryText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
  },
});

