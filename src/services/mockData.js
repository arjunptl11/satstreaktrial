export const MOCK_USER = {
  id: 'mock-user-1',
  email: 'demo@satstreak.app',
  display_name: 'Demo User',
};

export const MOCK_STATS = {
  streak: 7,
  best_streak: 12,
  total_questions: 85,
  total_correct: 68,
  xp: 720,
  level: 8,
  last_practice_date: new Date().toISOString().split('T')[0],
  questions_today: 5,
  total_days_active: 14,
  dailyDrillDone: false,
};

export const MOCK_DOMAIN_STATS = [
  { domain: 'Information and Ideas', total_questions: 30, total_correct: 24 },
  { domain: 'Craft and Structure', total_questions: 20, total_correct: 17 },
  { domain: 'Expression of Ideas', total_questions: 20, total_correct: 15 },
  { domain: 'Standard English Conventions', total_questions: 15, total_correct: 12 },
];

export const MOCK_WEEKLY = [
  { day: 'S', xp: 0 },
  { day: 'M', xp: 50 },
  { day: 'T', xp: 80 },
  { day: 'W', xp: 30 },
  { day: 'T', xp: 60 },
  { day: 'F', xp: 45 },
  { day: 'S', xp: 70 },
];

export const MOCK_ACHIEVEMENTS_UNLOCKED = ['streak_3', 'xp_100', 'questions_50'];
