export const MOODS = [
  { key: 'happy', label: 'Happy', emoji: '😊', icon: 'emoticon-happy-outline', color: '#FFD93D', graphColor: '#4CAF50' },
  { key: 'calm', label: 'Calm', emoji: '😌', icon: 'leaf-outline', color: '#74C0FC', graphColor: '#2196F3' },
  { key: 'neutral', label: 'Neutral', emoji: '😐', icon: 'emoticon-neutral-outline', color: '#B8C4CE', graphColor: '#9E9E9E' },
  { key: 'sad', label: 'Sad', emoji: '😢', icon: 'emoticon-sad-outline', color: '#A78BFA', graphColor: '#7C4DFF' },
  { key: 'angry', label: 'Angry', emoji: '😡', icon: 'emoticon-angry-outline', color: '#FF6B6B', graphColor: '#F44336' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', icon: 'emoticon-confused-outline', color: '#FDAA48', graphColor: '#FF9800' },
] as const;

export type MoodKey = (typeof MOODS)[number]['key'];

export const MOOD_MAP = MOODS.reduce((acc, m) => {
  acc[m.key] = m;
  return acc;
}, {} as Record<MoodKey, (typeof MOODS)[number]>);

export const CHALLENGE_CATEGORIES = [
  { key: 'feel_better', label: 'Feel Better', emoji: '💛', icon: 'heart', color: '#FFD93D', gradient: ['#FFE066', '#FFD93D'] },
  { key: 'focus', label: 'Focus', emoji: '🎯', icon: 'disc', color: '#74C0FC', gradient: ['#89D4F5', '#74C0FC'] },
  { key: 'self_improvement', label: 'Self Improvement', emoji: '🚀', icon: 'rocket', color: '#A78BFA', gradient: ['#C4B5FD', '#A78BFA'] },
  { key: 'meditation', label: 'Meditation', emoji: '🧘', icon: 'leaf', color: '#6EE7B7', gradient: ['#86EFAC', '#6EE7B7'] },
  { key: 'productivity', label: 'Productivity', emoji: '⚡', icon: 'flash', color: '#FDAA48', gradient: ['#FCD34D', '#FDAA48'] },
] as const;

export const DARK_COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  secondary: '#00CEC9',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  card: '#20203A',
  text: '#FFFFFF',
  textSecondary: '#8B8BA7',
  textMuted: '#5A5A7A',
  accent: '#FF6B9D',
  success: '#00E676',
  warning: '#FFD93D',
  error: '#FF5252',
  border: '#2D2D4A',
};

export const LIGHT_COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  secondary: '#00BFA5',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceLight: '#F1F3F5',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#4A4A6A',
  textMuted: '#8B8BA7',
  accent: '#FF6B9D',
  success: '#00C853',
  warning: '#FFD600',
  error: '#D32F2F',
  border: '#E9ECEF',
};

export const COLORS = DARK_COLORS;

export const FONTS = {
  regular: 'SpaceMono',
};
