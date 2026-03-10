import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchEntries, setSelectedDate } from '../store/journalSlice';
import { MOOD_MAP, MoodKey } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';
import type { AppDispatch, RootState } from '../store/store';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AllEntriesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { id: userId } = useSelector((state: RootState) => state.user);
  const { entries, loading } = useSelector((state: RootState) => state.journal);

  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedSpecificDate, setSelectedSpecificDate] = useState<string | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    if (userId) {
      dispatch(fetchEntries(userId));
    }
  }, [userId]);

  const entryDateSet = useMemo(() => new Set(entries.map(e => e.date)), [entries]);

  const monthlyFilters = useMemo(() => {
    const months = ['All'];
    entries.forEach(entry => {
      const date = new Date(entry.date + 'T00:00:00');
      const monthYear = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      if (!months.includes(monthYear)) {
        months.push(monthYear);
      }
    });
    return months;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let result = entries;
    
    if (selectedSpecificDate) {
      return result.filter(entry => entry.date === selectedSpecificDate);
    }

    if (selectedMonth !== 'All') {
      result = result.filter(entry => {
        const date = new Date(entry.date + 'T00:00:00');
        const monthYear = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        return monthYear === selectedMonth;
      });
    }

    return result;
  }, [entries, selectedMonth, selectedSpecificDate]);

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, options);
  };

  const handleShare = async (item: any) => {
    try {
      const mood = MOOD_MAP[item.mood as MoodKey];
      const message = `✨ Journal Entry - ${formatDate(item.date)}\n\nMood: ${mood?.emoji} ${mood?.label || item.mood}\n\n"${item.content}"\n\nShared via Journal Qantos`;
      
      await Share.share({
        message,
        title: 'My Journal Entry',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const clearFilters = () => {
    setSelectedMonth('All');
    setSelectedSpecificDate(null);
  };

  // Calendar Logic
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    
    // Add empty slots for days of previous month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    return calendarDays;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const calendarDays = useMemo(() => generateCalendarDays(), [viewDate]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Calendar Date Picker Modal */}
      <Modal visible={isDatePickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setIsDatePickerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Calendar UI */}
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                  <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.calendarMonthText}>
                  {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                  <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.daysHeader}>
                {DAYS_OF_WEEK.map(day => (
                  <Text key={day} style={styles.dayHeaderText}>{day}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => {
                  if (day === null) return <View key={`empty-${index}`} style={styles.calendarDay} />;
                  
                  const dayString = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasEntry = entryDateSet.has(dayString);
                  const isSelected = selectedSpecificDate === dayString;
                  const isToday = new Date().toISOString().split('T')[0] === dayString;

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDay,
                        isSelected && styles.selectedDay,
                        !isSelected && isToday && styles.todayDay
                      ]}
                      onPress={() => {
                        setSelectedSpecificDate(dayString);
                        setSelectedMonth('All');
                        setIsDatePickerVisible(false);
                      }}
                    >
                      <Text style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        !isSelected && isToday && styles.todayDayText
                      ]}>{day}</Text>
                      {hasEntry && <View style={[styles.entryDot, isSelected && styles.selectedEntryDot]} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalClearBtn}
              onPress={() => {
                clearFilters();
                setIsDatePickerVisible(false);
              }}
            >
              <Text style={styles.modalClearBtnText}>View All Entries</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Journal History</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity 
            style={[styles.calBtn, selectedSpecificDate && styles.calBtnActive]} 
            onPress={() => setIsDatePickerVisible(true)}
          >
            <Ionicons name="calendar-outline" size={22} color={selectedSpecificDate ? '#FFF' : colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {entries.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedMonth === 'All' && !selectedSpecificDate && styles.filterChipActive
              ]}
              onPress={clearFilters}
            >
              <Text style={[
                styles.filterText,
                selectedMonth === 'All' && !selectedSpecificDate && styles.filterTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>

            {monthlyFilters.filter(f => f !== 'All').map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedMonth === filter && !selectedSpecificDate && styles.filterChipActive
                ]}
                onPress={() => {
                  setSelectedMonth(filter);
                  setSelectedSpecificDate(null);
                }}
              >
                <Text style={[
                  styles.filterText,
                  selectedMonth === filter && !selectedSpecificDate && styles.filterTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredEntries.length > 0 ? (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredEntries.map((item) => {
            const mood = MOOD_MAP[item.mood as MoodKey];
            return (
              <TouchableOpacity 
                key={item._id} 
                style={styles.entryCard}
                onPress={() => {
                  dispatch(setSelectedDate(item.date));
                  router.push('/(tabs)/journal');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.moodBadge}>
                    <Text style={styles.moodEmoji}>{mood?.emoji || '📝'}</Text>
                    <Text style={[styles.moodLabel, { color: mood?.color || colors.primary }]}>
                      {mood?.label || item.mood}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  <TouchableOpacity 
                    style={styles.shareBtn} 
                    onPress={() => handleShare(item)}
                  >
                    <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.entryContent} numberOfLines={4}>
                  {item.content}
                </Text>
                
                <View style={styles.cardFooter}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.timeText}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.readMoreText}>View details →</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="filter-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No entries found</Text>
          <Text style={styles.emptySub}>Try a different filter or search by date.</Text>
          {(selectedMonth !== 'All' || selectedSpecificDate) && (
            <TouchableOpacity 
              style={styles.resetBtn}
              onPress={clearFilters}
            >
              <Text style={styles.resetBtnText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: 10,
  },
  shareBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  entryContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
    fontWeight: '500',
  },
  readMoreText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  calendarMonthText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    width: 38,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 12,
  },
  dayText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  todayDay: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todayDayText: {
    color: colors.primary,
    fontWeight: '700',
  },
  entryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: 4,
  },
  selectedEntryDot: {
    backgroundColor: '#FFFFFF',
  },
  modalClearBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalClearBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});


