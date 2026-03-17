import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../hooks/useTheme';
import type { AppDispatch, RootState } from '../store/store';
import { createUser } from '../store/userSlice';
import { registerForPushNotificationsAsync, scheduleDailyJournalReminder } from '../utils/notifications';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { name } = useLocalSearchParams<{ name: string }>();
  const { isOnboarded, loading } = useSelector((state: RootState) => state.user);

  // Animation values
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(30)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(20)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const descTranslateY = useRef(new Animated.Value(20)).current;
  const featureRowOpacity = useRef(new Animated.Value(0)).current;
  const featureRowTranslateY = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const screenFadeOut = useRef(new Animated.Value(1)).current;

  // 1. Create user on mount
  useEffect(() => {
    if (name) {
      dispatch(createUser(name));
    }
  }, []);

  // 2. Function to navigate on button press
  const handleGetStarted = async () => {
    if (isOnboarded) {
      // Set up daily journal reminder
      try {
        await registerForPushNotificationsAsync();
        await scheduleDailyJournalReminder(9, 0); // Set to 9:00 AM daily
      } catch (error) {
        console.log('Notification setup error:', error);
      }

      Animated.timing(screenFadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)/journal');
      });
    }
  };

  // 3. Run animations
  useEffect(() => {
    // Glow pulse loop
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.05,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    // Staggered entrance sequence
    Animated.sequence([
      // Icon bounces in with rotation
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // "Welcome to Punch" fades up
      Animated.parallel([
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(welcomeTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Greeting with user name fades up
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(nameTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Description fades up
      Animated.parallel([
        Animated.timing(descOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(descTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Feature pills row
      Animated.parallel([
        Animated.timing(featureRowOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(featureRowTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Button
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    glowLoop.start();

    return () => {
      glowLoop.stop();
    };
  }, []);

  const iconRotateInterpolate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFadeOut }]}>
      {/* Background glow */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            opacity: glowOpacity,
            backgroundColor: colors.primary,
          },
        ]}
      />

      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [
                { scale: iconScale },
                { rotate: iconRotateInterpolate },
              ],
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name="book-sharp" size={64} color={colors.primary} />
          </View>
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View
          style={{
            opacity: welcomeOpacity,
            transform: [{ translateY: welcomeTranslateY }],
          }}
        >
          <Text style={styles.welcomeLabel}>WELCOME TO</Text>
          <Text style={styles.appName}>Punch</Text>
        </Animated.View>

        {/* User Greeting */}
        <Animated.View
          style={{
            opacity: nameOpacity,
            transform: [{ translateY: nameTranslateY }],
          }}
        >
          <Text style={styles.greetingText}>
            Hey, {name || 'there'}! 👋
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View
          style={{
            opacity: descOpacity,
            transform: [{ translateY: descTranslateY }],
          }}
        >
          <Text style={styles.descriptionText}>
            {/* Your personal AI-powered journaling companion.{'\n'} */}
            Track your mood, build habits, and grow with{'\n'}
            daily reflections and 21-day challenges.
          </Text>
        </Animated.View>

        {/* Feature pills */}
        <Animated.View
          style={[
            styles.featurePillRow,
            {
              opacity: featureRowOpacity,
              transform: [{ translateY: featureRowTranslateY }],
            },
          ]}
        >
          <View style={[styles.featurePill, { borderColor: colors.primary + '40' }]}>
            <Ionicons name="pencil-outline" size={14} color={colors.primary} />
            <Text style={styles.featurePillText}>Journal</Text>
          </View>
          <View style={[styles.featurePill, { borderColor: colors.primary + '40' }]}>
            <Ionicons name="bar-chart-outline" size={14} color={colors.primary} />
            <Text style={styles.featurePillText}>Mood</Text>
          </View>
          <View style={[styles.featurePill, { borderColor: colors.primary + '40' }]}>
            <Ionicons name="trophy-outline" size={14} color={colors.primary} />
            <Text style={styles.featurePillText}>Challenges</Text>
          </View>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, (!isOnboarded || loading) && styles.buttonDisabled]}
            disabled={!isOnboarded || loading}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            {!isOnboarded || loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Get Started →</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    glowCircle: {
      position: 'absolute',
      width: width * 1.2,
      height: width * 1.2,
      borderRadius: width * 0.6,
      top: '10%',
      alignSelf: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    iconWrapper: {
      marginBottom: 28,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcomeLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
      letterSpacing: 3,
      marginBottom: 4,
    },
    appName: {
      fontSize: 48,
      fontWeight: '900',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -1,
      marginBottom: 16,
    },
    greetingText: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    descriptionText: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    featurePillRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 48,
    },
    featurePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: colors.surface,
    },
    featurePillText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    buttonContainer: {
      width: '100%',
      marginTop: 20,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      width: '100%',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
    },
  });
