import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
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

function getDays(count: number): { date: string; dayName: string; dayNum: number; month: string; year: string }[] {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('en', { month: 'short' });
    const year = d.getFullYear().toString();
    days.push({ date: dateStr, dayName, dayNum, month, year });
  }
  return days;
}

export default function CalendarSlider({ selectedDate, onDateSelect, entryDates = [], loading = false }: CalendarSliderProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const days = useMemo(() => getDays(VISIBLE_DAYS), []);
  const [initialScrolled, setInitialScrolled] = useState(false);

  // Auto-scroll logic: Only scroll on mount or when externally changed
  useEffect(() => {
    const index = days.findIndex((d) => d.date === selectedDate);
    if (index >= 0 && scrollRef.current) {
      // Calculate centering x
      // paddingHorizontal (20) + (index * step) + (item_width / 2) - (screen_width / 2)
      const targetX = 20 + (index * STEP_DISTANCE) + (ITEM_WIDTH / 2) - (SCREEN_WIDTH / 2);
      
      const scrollToDate = () => {
        scrollRef.current?.scrollTo({
          x: Math.max(0, targetX),
          animated: true,
        });
      };

      if (!initialScrolled) {
        setTimeout(scrollToDate, 100);
        setInitialScrolled(true);
      } else {
        // Only auto-scroll if the selection isn't already roughly in the middle
        // This avoids jumpy behavior when a user is manually tapping nearby dates
        scrollToDate();
      }
    }
  }, [selectedDate, days]);

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
          const isToday = day.date === new Date().toISOString().split('T')[0];

          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayItem,
                isSelected && styles.dayItemSelected,
                isToday && !isSelected && styles.dayItemToday,
              ]}
              onPress={() => onDateSelect(day.date)}
              activeOpacity={0.8}
              disabled={loading && isSelected}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                {day.dayName}
              </Text>
              
              {loading && isSelected ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginVertical: 4.5 }} />
              ) : (
                <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                  {day.dayNum}
                </Text>
              )}

              <View style={styles.footer}>
                {hasEntry ? (
                  <View style={[styles.dot, isSelected && styles.dotSelected]} />
                ) : (
                  <Text style={[styles.month, isSelected && styles.monthSelected]}>
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
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  dayItemToday: {
    borderColor: colors.primary,
    borderWidth: 1.5,
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
  dayNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  dayNumSelected: {
    color: '#FFFFFF',
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
