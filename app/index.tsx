import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { createUser, loadStoredUser } from '../store/userSlice';
import { useTheme } from '../hooks/useTheme';
import type { AppDispatch, RootState } from '../store/store';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { loading, isOnboarded, error } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(loadStoredUser());
  }, []);

  useEffect(() => {
    if (isOnboarded) {
      router.replace('/(tabs)/journal');
    }
  }, [isOnboarded]);

  const handleContinue = () => {
    if (name.trim().length < 2) return;
    dispatch(createUser(name.trim()));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {/* <Text style={styles.logo}>📓</Text> */}
          <Ionicons name="book-sharp" size={55} color={colors.primary} style={styles.journalIcon} />
          <Text style={styles.appName}>Journal Qantos</Text>
          <Text style={styles.tagline}>Your AI-Powered Journaling Companion</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcomeText}>What should we call you?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={30}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[styles.button, name.trim().length < 2 && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading || name.trim().length < 2}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Start Journaling →</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="pencil-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Daily Journal</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Mood Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="trophy-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>21-Day Challenges</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  form: {
    marginBottom: 48,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  journalIcon:{
    marginBottom: 16, 
    marginTop: 16 
  }
});
