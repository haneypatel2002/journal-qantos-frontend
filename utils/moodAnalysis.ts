import { MoodKey } from './constants';

interface MoodCounts {
  happy: number;
  calm: number;
  neutral: number;
  sad: number;
  angry: number;
  anxious: number;
}

export interface ChallengeSuggestion {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export function analyzeMoods(moods: MoodKey[]): ChallengeSuggestion[] {
  const counts: MoodCounts = { happy: 0, calm: 0, neutral: 0, sad: 0, angry: 0, anxious: 0 };
  moods.forEach((m) => {
    if (counts[m] !== undefined) counts[m]++;
  });

  const total = moods.length;
  const suggestions: ChallengeSuggestion[] = [];
  const negative = counts.sad + counts.angry + counts.anxious;
  const positive = counts.happy + counts.calm;

  if (negative > total * 0.4 || counts.sad > 3) {
    suggestions.push({
      category: 'feel_better',
      title: 'Feel Better Challenge',
      description: 'A 21-day journey to lift your spirits.',
      priority: 'high',
    });
  }

  if (counts.anxious > 2 || negative > 3) {
    suggestions.push({
      category: 'meditation',
      title: 'Meditation Challenge',
      description: 'Build a peaceful meditation practice.',
      priority: 'high',
    });
  }

  suggestions.push({
    category: 'focus',
    title: 'Focus Challenge',
    description: 'Sharpen your concentration in 21 days.',
    priority: negative > positive ? 'medium' : 'low',
  });

  suggestions.push({
    category: 'self_improvement',
    title: 'Self Improvement Challenge',
    description: 'Transform yourself with daily growth.',
    priority: 'medium',
  });

  suggestions.push({
    category: 'productivity',
    title: 'Productivity Boost',
    description: 'Supercharge your productivity.',
    priority: 'low',
  });

  return suggestions;
}
