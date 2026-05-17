export const MOCK_USER = {
  id: 'mock-user-1',
  email: 'demo@satstreak.app',
  display_name: 'Demo User',
};

export const ZERO_STATS = {
  streak: 0,
  best_streak: 0,
  total_questions: 0,
  total_correct: 0,
  xp: 0,
  level: 1,
  last_practice_date: null,
  questions_today: 0,
  dailyVocabDone: false,
};

export const EMPTY_DOMAIN_STATS = [
  { domain: 'Information and Ideas', total_questions: 0, total_correct: 0 },
  { domain: 'Craft and Structure', total_questions: 0, total_correct: 0 },
  { domain: 'Expression of Ideas', total_questions: 0, total_correct: 0 },
  { domain: 'Standard English Conventions', total_questions: 0, total_correct: 0 },
];

export const EMPTY_WEEKLY = [
  { day: 'S', xp: 0 },
  { day: 'M', xp: 0 },
  { day: 'T', xp: 0 },
  { day: 'W', xp: 0 },
  { day: 'T', xp: 0 },
  { day: 'F', xp: 0 },
  { day: 'S', xp: 0 },
];
