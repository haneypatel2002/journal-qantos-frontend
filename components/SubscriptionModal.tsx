import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  { emoji: '🧠', title: 'AI Deep Mood Analysis', desc: 'Get deep insights into your emotional patterns' },
  { emoji: '♾️', title: 'Unlimited Challenges', desc: 'Access all challenge categories without limits' },
  { emoji: '💬', title: 'AI Chat Assistant', desc: 'Talk to an AI that understands your journal' },
  { emoji: '🎙️', title: 'Voice Journaling', desc: 'Record voice entries and auto-transcribe' },
  { emoji: '🔔', title: 'Smart Reminders', desc: 'Get personalized journaling reminders' },
  { emoji: '📊', title: 'Advanced Statistics', desc: 'Detailed analytics of your emotional growth' },
  { emoji: '🎯', title: 'Personalized Plans', desc: 'AI-crafted 21-day plans just for you' },
  { emoji: '🏆', title: 'Streak Rewards', desc: 'Unlock rewards and achievements' },
];

export default function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock the full potential of Journal Qantos
          </Text>

          <ScrollView style={styles.featureList} showsVerticalScrollIndicator={false}>
            {PREMIUM_FEATURES.map((feature, i) => (
              <View key={i} style={styles.featureItem}>
                <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.pricingContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$4.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <TouchableOpacity style={styles.subscribeBtn} activeOpacity={0.8}>
              <Text style={styles.subscribeBtnText}>Start Free Trial</Text>
            </TouchableOpacity>
            <Text style={styles.trialText}>7-day free trial • Cancel anytime</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  closeBtnText: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  crown: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  featureList: {
    maxHeight: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pricingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
  },
  pricePeriod: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  subscribeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  trialText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
  },
});
