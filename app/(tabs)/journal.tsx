import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import Toast from '../../components/Toast';

export default function JournalScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { id: userId, name, streakCount, entryCount } = useSelector((state: RootState) => state.user);
  const { selectedDate, currentEntry, entries, saving, loading } = useSelector((state: RootState) => state.journal);

  const [mood, setMood] = useState<MoodKey | null>(null);
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const hasChanges = useMemo(() => {
    if (!currentEntry) return mood !== null || content.trim() !== '';
    const isDifferentMood = currentEntry.mood !== mood;
    const isDifferentContent = currentEntry.content !== content;
    return isDifferentMood || isDifferentContent;
  }, [currentEntry, mood, content]);

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
    setMood(null);
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
      
      const message = currentEntry ? 'Your journal entry has been updated✨' : 'Your journal entry has been saved✨';
      setToastMsg(message);
      setShowToast(true);
    });
  };

  const nowDate = new Date();
  const todayLocal = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;
  const isToday = selectedDate === todayLocal;
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const scrollToEditor = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: 520,
        animated: true,
      });
    }, 150);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={{ paddingBottom: 300 }}>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hello, {name} 👋</Text>
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
            </View>

            <StreakCounter streak={streakCount} totalEntries={entryCount} />

            <CalendarSlider
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              entryDates={entryDates}
              loading={loading || saving}
            />

            <View style={styles.section}>
              <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
            </View>

            <JournalEditor
              content={content}
              onContentChange={setContent}
              placeholder={isToday ? "How's your day going?" : `What happened on ${formattedDate}?`}
              loading={loading}
              onFocus={scrollToEditor}
            />

            <View style={styles.saveContainer}>
              <TouchableOpacity
                style={[
                  styles.saveBtn, 
                  (!mood || !hasChanges) && styles.saveBtnDisabled
                ]}
                onPress={handleSave}
                disabled={saving || !mood || !hasChanges}
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
                      {currentEntry ? (hasChanges ? 'Update Entry' : 'No Changes') : 'Save Entry'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast 
        visible={showToast} 
        message={toastMsg} 
        onHide={() => setShowToast(false)} 
      />
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
    paddingBottom: 200, // More bottom padding to ensure accessibility
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
