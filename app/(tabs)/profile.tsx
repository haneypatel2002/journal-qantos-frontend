import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SubscriptionModal from '../../components/SubscriptionModal';
import { fetchUser, clearUser, updateUser, deleteUserAccount, toggleTheme } from '../../store/userSlice';
import { MOOD_MAP, MoodKey, DARK_COLORS } from '../../utils/constants';
import { useTheme } from '../../hooks/useTheme';
import type { AppDispatch, RootState } from '../../store/store';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { id: userId, name, streakCount, entryCount, moodDistribution, loading } = useSelector(
    (state: RootState) => state.user
  );
  const { challenges } = useSelector((state: RootState) => state.challenge);
  
  const [showSubscription, setShowSubscription] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name || '');

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId));
    }
  }, [userId]);

  useEffect(() => {
    setEditName(name);
  }, [name]);

  const completedChallenges = challenges.filter((c) => c.status === 'completed').length;

  const handleUpdate = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (userId) {
      await dispatch(updateUser({ id: userId, name: editName.trim() }));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'This will clear your local profile. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          dispatch(clearUser());
          router.replace('/');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your journal entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            if (userId) {
              await dispatch(deleteUserAccount(userId));
              router.replace('/');
            }
          },
        },
      ]
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsIcon}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons name={isEditing ? "close" : "create-outline"} size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          
          {isEditing ? (
            <View style={styles.editSection}>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.memberSince}>Journal Qantos Member</Text>
            </>
          )}
        </View>

        {/* Theme Toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sunny" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>App Theme (Light/Dark)</Text>
          </View>
          <View style={styles.themeRow}>
            <View style={styles.themeInfo}>
              <Text style={styles.themeLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
              <Text style={styles.themeDesc}>Adjust how Journal Qantos looks</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => {
                dispatch(toggleTheme());
              }}
              trackColor={{ false: '#767577', true: colors.primary + '50' }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="flame" size={22} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{streakCount}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="book" size={22} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{entryCount}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="trophy" size={22} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{completedChallenges}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
        </View>

        {/* Mood Breakdown */}
        {moodDistribution.length > 0 && (
          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>Your Moods</Text>
            {moodDistribution.map((item) => {
              const m = MOOD_MAP[item._id as MoodKey];
              return (
                <View key={item._id} style={styles.moodRow}>
                  <Text style={styles.moodEmoji}>{m?.emoji || '?'}</Text>
                  <Text style={styles.moodLabel}>{m?.label || item._id}</Text>
                  <Text style={styles.moodCount}>{item.count}x</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Premium */}
        {/* <TouchableOpacity
          style={styles.premiumCard}
          onPress={() => setShowSubscription(true)}
          activeOpacity={0.8}
        >
          <View style={styles.premiumIconContainer}>
            <MaterialCommunityIcons name="crown" size={28} color={colors.warning} />
          </View>
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
            <Text style={styles.premiumDesc}>Unlock AI insights, unlimited challenges & more</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity> */}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <SubscriptionModal
        visible={showSubscription}
        onClose={() => setShowSubscription(false)}
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
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  settingsIcon: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  memberSince: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editSection: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  themeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  moodSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 11,
    marginTop: 11,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  moodLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  moodCount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  premiumIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  premiumDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  logoutBtn: {
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error + '40',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  deleteBtn: {
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
