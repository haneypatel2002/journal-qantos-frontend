import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 75;
const ITEM_GAP = 12;
const STEP_DISTANCE = ITEM_WIDTH + ITEM_GAP;
const VISIBLE_DAYS = 30;

interface CalendarSliderProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  entryDates?: string[];
  loading?: boolean;
}

// Helper: get local YYYY-MM-DD string (avoids UTC issues with toISOString)
function getLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDays(count: number): { date: string; dayName: string; dayNum: number; month: string; year: string }[] {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateStr(d);
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('en', { month: 'short' });
    const year = d.getFullYear().toString();
    days.push({ date: dateStr, dayName, dayNum, month, year });
  }
  return days;
}

// Today's date string computed once per render cycle using local time
const getTodayStr = () => getLocalDateStr(new Date());

export default function CalendarSlider({ selectedDate, onDateSelect, entryDates = [], loading = false }: CalendarSliderProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const days = useMemo(() => getDays(VISIBLE_DAYS), []);
  const [hasScrolledInitially, setHasScrolledInitially] = useState(false);
  const todayStr = useMemo(() => getTodayStr(), []);

  // Scroll to a specific date index
  const scrollToIndex = (index: number, animated: boolean = true) => {
    if (index >= 0 && scrollRef.current) {
      const targetX = 20 + (index * STEP_DISTANCE) + (ITEM_WIDTH / 2) - (SCREEN_WIDTH / 2);
      scrollRef.current.scrollTo({
        x: Math.max(0, targetX),
        animated,
      });
    }
  };

  // On mount: scroll to today (last item) reliably
  useEffect(() => {
    if (!hasScrolledInitially) {
      const todayIndex = days.findIndex((d) => d.date === todayStr);
      // Use multiple attempts to ensure scroll happens after layout
      const timer1 = setTimeout(() => scrollToIndex(todayIndex >= 0 ? todayIndex : days.length - 1, false), 50);
      const timer2 = setTimeout(() => scrollToIndex(todayIndex >= 0 ? todayIndex : days.length - 1, false), 200);
      const timer3 = setTimeout(() => scrollToIndex(todayIndex >= 0 ? todayIndex : days.length - 1, false), 500);
      setHasScrolledInitially(true);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, []);

  // When selectedDate changes (user taps a date), scroll to it
  useEffect(() => {
    if (hasScrolledInitially) {
      const index = days.findIndex((d) => d.date === selectedDate);
      scrollToIndex(index);
    }
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={STEP_DISTANCE}
        decelerationRate="fast"
      >
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const hasEntry = entryDates.includes(day.date);
          const isToday = day.date === todayStr;

          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayItem,
                isToday && !isSelected && styles.dayItemToday,
                isSelected && !isToday && styles.dayItemSelected,
                isSelected && isToday && styles.dayItemTodaySelected,
              ]}
              onPress={() => onDateSelect(day.date)}
              activeOpacity={0.8}
              disabled={loading && isSelected}
            >
              <Text style={[
                styles.dayName,
                isToday && !isSelected && styles.dayNameToday,
                isSelected && !isToday && styles.dayNameSelected,
                isSelected && isToday && styles.dayNameTodaySelected,
              ]}>
                {isToday ? 'Today' : day.dayName}
              </Text>
              
              {loading && isSelected ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginVertical: 4.5 }} />
              ) : (
                <Text style={[
                  styles.dayNum,
                  isToday && !isSelected && styles.dayNumToday,
                  isSelected && !isToday && styles.dayNumSelected,
                  isSelected && isToday && styles.dayNumTodaySelected,
                ]}>
                  {day.dayNum}
                </Text>
              )}

              <View style={styles.footer}>
                {hasEntry ? (
                  <View style={[styles.dot, isSelected && styles.dotSelected]} />
                ) : (
                  <Text style={[
                    styles.month,
                    isToday && !isSelected && styles.monthToday,
                    isSelected && styles.monthSelected,
                  ]}>
                    {day.month} {day.year}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  dayItem: {
    width: ITEM_WIDTH,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.surface,
    marginRight: ITEM_GAP,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dayItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    elevation: 6,
    // shadowColor: colors.primary,
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 4 },
  },
  dayItemTodaySelected: {
    backgroundColor: colors.primary,
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
    elevation: 8,
    // shadowColor: colors.primary,
    // shadowOpacity: 0.4,
    // shadowRadius: 10,
    // shadowOffset: { width: 0, height: 4 },
  },
  dayItemToday: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '15',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  dayName: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  dayNameSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  dayNameToday: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  dayNameTodaySelected: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  dayNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  dayNumSelected: {
    color: '#FFFFFF',
  },
  dayNumToday: {
    color: colors.primary,
    fontWeight: '900',
  },
  dayNumTodaySelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  footer: {
    height: 16,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  monthSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  monthToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  dotSelected: {
    backgroundColor: '#FFFFFF',
    width: 5,
    height: 5,
  },
});
