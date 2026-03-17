import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure how notifications should be handled when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const requestPermissions = async () => {
    if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get permissions for notifications!');
        return false;
    }

    return true;
};

export const registerForPushNotificationsAsync = async () => {
    // We only need permissions for local notifications in Expo Go.
    // Fetching the actual Push Token is what causes the crash in Expo Go SDK 53+.
    
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Notification permissions not granted');
            return false;
        }

        return true; // Successfully got permission, skip token fetching for Expo Go compatibility
    } else {
        console.log('Must use physical device for native notifications');
        return false;
    }
};

// --- JOURNAL QANTOS REMINDERS ---

/**
 * Daily Journal Reminder (Recurring)
 */
export const scheduleDailyJournalReminder = async (hour: number = 9, minute: number = 0) => {
    // Clear existing daily journal reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
        if (notification.content.data?.type === 'daily_reminder') {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
    }

    console.log(`Scheduling daily reminder for ${hour}:${minute}`);
    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "✍️ Time to Reflect",
                body: "Don't forget to record your thoughts today. Your journal is waiting!",
                data: { type: 'daily_reminder', url: '/(tabs)/journal' },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            } as any,
        });
        console.log(`Daily reminder scheduled successfully with ID: ${id}`);
    } catch (error) {
        console.error('Failed to schedule daily reminder:', error);
    }
};

/**
 * Journal Entry Saved Notification (Immediate)
 */
export const notifyJournalEntrySaved = async () => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Success! 🎉",
            body: "Your journal entry has been saved securely.",
            data: { type: 'journal_saved' },
        },
        trigger: null,
    });
};

/**
 * Challenge Completion Notification (Immediate)
 */
export const notifyChallengeCompleted = async (dayNumber: number) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Day Completed! 🏆",
            body: `Amazing job! You've completed day ${dayNumber} of your challenge.`,
            data: { type: 'challenge_complete', day: dayNumber },
        },
        trigger: null,
    });
};

/**
 * Test Notification (Quick Check)
 */
export const scheduleQuickTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Test Notification ⚡️",
            body: "If you see this, notifications are correctly configured!",
            data: { type: 'test' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(Date.now() + 5 * 1000),
        } as Notifications.DateTriggerInput,
    });
};

export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};
