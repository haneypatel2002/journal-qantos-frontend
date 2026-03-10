import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MoodKey } from '../../utils/constants';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CalendarSlider from '../../components/CalendarSlider';
import MoodSelector from '../../components/MoodSelector';
import JournalEditor from '../../components/JournalEditor';
import StreakCounter from '../../components/StreakCounter';
import { saveEntry, fetchEntryByDate, fetchEntries, setSelectedDate } from '../../store/journalSlice';
import { fetchUser } from '../../store/userSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export default function JournalScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { id: userId, name, streakCount, entryCount } = useSelector((state: RootState) => state.user);
  const { selectedDate, currentEntry, entries, saving, loading } = useSelector((state: RootState) => state.journal);

  const [mood, setMood] = useState<MoodKey | null>(null);
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);

  const entryDates = entries.map((e) => e.date);

  useEffect(() => {
    if (userId) {
      dispatch(fetchEntries(userId));
      dispatch(fetchUser(userId));
    }
  }, [userId]);

  useEffect(() => {
    if (userId && selectedDate) {
      dispatch(fetchEntryByDate({ userId, date: selectedDate }));
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    if (currentEntry) {
      setMood(currentEntry.mood as MoodKey);
      setContent(currentEntry.content);
    } else {
      setMood(null);
      setContent('');
    }
    setLoaded(true);
  }, [currentEntry]);

  const handleDateSelect = useCallback((date: string) => {
    dispatch(setSelectedDate(date));
    setMood(null); // Clear local state immediately for better UX
    setContent('');
    setLoaded(false);
  }, [dispatch]);

  const handleSave = () => {
    if (!userId || !mood) {
      Alert.alert('Missing Info', 'Please select a mood before saving.');
      return;
    }

    dispatch(saveEntry({ userId, date: selectedDate, mood, content })).then(() => {
      dispatch(fetchUser(userId));
      Alert.alert('Saved! ✨', 'Your journal entry has been saved.');
    });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 20}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {name} 👋</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>

          {/* Stats */}
          <StreakCounter streak={streakCount} totalEntries={entryCount} />

          {/* Calendar */}
          <CalendarSlider
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            entryDates={entryDates}
            loading={loading}
          />

          {/* Mood */}
          <View style={styles.section}>
            <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
          </View>

          {/* Editor */}
          <JournalEditor
            content={content}
            onContentChange={setContent}
            placeholder={isToday ? "How's your day going?" : `What happened on ${formattedDate}?`}
            loading={loading}
          />

          {/* Save Button */}
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={[styles.saveBtn, !mood && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || !mood}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnContent}>
                  <Ionicons 
                    name={currentEntry ? "cloud-upload-outline" : "sparkles-outline"} 
                    size={20} 
                    color="#FFFFFF" 
                    style={styles.btnIcon} 
                  />
                  <Text style={styles.saveBtnText}>
                    {currentEntry ? 'Update Entry' : 'Save Entry'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
     </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 120, // Increased to allow space when keyboard is open
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  saveContainer: {
    paddingHorizontal: 16,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
