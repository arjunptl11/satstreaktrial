export const ACHIEVEMENTS = [
  { id: 'streak_3', name: 'First Streak', emoji: '🔥', requirement: '3-day streak', xp: 20 },
  { id: 'streak_7', name: 'Week Warrior', emoji: '💪', requirement: '7-day streak', xp: 50 },
  { id: 'streak_14', name: 'Streak Master', emoji: '👑', requirement: '14-day streak', xp: 100 },
  { id: 'streak_30', name: 'Month Legend', emoji: '🏆', requirement: '30-day streak', xp: 250 },
  { id: 'xp_100', name: 'Getting Started', emoji: '⭐', requirement: 'Earn 100 XP', xp: 0 },
  { id: 'xp_500', name: 'Knowledge Seeker', emoji: '🎓', requirement: 'Earn 500 XP', xp: 50 },
  { id: 'xp_1000', name: 'SAT Scholar', emoji: '🧠', requirement: 'Earn 1,000 XP', xp: 100 },
  { id: 'questions_50', name: 'Practice Pro', emoji: '📚', requirement: 'Answer 50 questions', xp: 30 },
  { id: 'questions_200', name: 'Question Master', emoji: '🎯', requirement: 'Answer 200 questions', xp: 100 },
  { id: 'accuracy_80', name: 'High Achiever', emoji: '🌟', requirement: '80% overall accuracy', xp: 150 },
  { id: 'perfect_session', name: 'Perfectionist', emoji: '💯', requirement: '10/10 in a session', xp: 50 },
  { id: 'domain_master', name: 'Domain Expert', emoji: '📊', requirement: '90% in any domain', xp: 100 },
];

export const XP = {
  CORRECT: 10,
  INCORRECT: 2,
  DAILY_BONUS: 5,
  GOAL_COMPLETE: 10,
};

export const LEVELS = {
  calculateLevel: (xp) => Math.floor(xp / 100) + 1,
  xpForNextLevel: (xp) => {
    const level = Math.floor(xp / 100) + 1;
    return level * 100 - xp;
  },
};

export const DAILY_GOALS = [20, 50, 100];

export const DOMAINS = [
  'All Domains',
  'Information and Ideas',
  'Craft and Structure',
  'Expression of Ideas',
  'Standard English Conventions',
];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
