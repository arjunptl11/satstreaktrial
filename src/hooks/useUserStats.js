import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_STATS, MOCK_DOMAIN_STATS, MOCK_WEEKLY, MOCK_ACHIEVEMENTS_UNLOCKED } from '../services/mockData';
import { XP, LEVELS } from '../utils/constants';

const LOCAL_STATS_KEY = 'local_stats';
const MISSED_QUESTIONS_KEY = 'missed_questions';

export function useUserStats(userId) {
  const [stats, setStats] = useState(MOCK_STATS);
  const [domainStats, setDomainStats] = useState(MOCK_DOMAIN_STATS);
  const [weeklyData, setWeeklyData] = useState(MOCK_WEEKLY);
  const [unlockedAchievements, setUnlockedAchievements] = useState(MOCK_ACHIEVEMENTS_UNLOCKED);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const saveLocalStats = async (newStats) => {
    try {
      await AsyncStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(newStats));
    } catch {}
    setStats(newStats);
  };

  const loadLocalStats = async () => {
    try {
      const saved = await AsyncStorage.getItem(LOCAL_STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats(parsed);
      }
      const savedMissed = await AsyncStorage.getItem(MISSED_QUESTIONS_KEY);
      if (savedMissed) {
        setMissedQuestions(JSON.parse(savedMissed));
      }
    } catch {}
  };

  useEffect(() => {
    loadLocalStats();
  }, [userId]);

  const recordAnswer = async ({ questionId, domain, difficulty, isCorrect, isDailyDrill }) => {
    const xpGained = isCorrect ? XP.CORRECT : XP.INCORRECT;
    const bonus = isDailyDrill && !stats.dailyDrillDone ? XP.DAILY_BONUS : 0;
    const totalXp = xpGained + bonus;

    const newXp = stats.xp + totalXp;
    const newStats = {
      ...stats,
      xp: newXp,
      level: LEVELS.calculateLevel(newXp),
      total_questions: stats.total_questions + 1,
      total_correct: stats.total_correct + (isCorrect ? 1 : 0),
      questions_today: (stats.questions_today || 0) + 1,
      dailyDrillDone: isDailyDrill ? true : stats.dailyDrillDone,
    };

    // Update domain stats
    const domainIndex = domainStats.findIndex(d => d.domain === domain);
    if (domainIndex >= 0) {
      const newDomainStats = [...domainStats];
      newDomainStats[domainIndex] = {
        ...newDomainStats[domainIndex],
        total_questions: newDomainStats[domainIndex].total_questions + 1,
        total_correct: newDomainStats[domainIndex].total_correct + (isCorrect ? 1 : 0),
      };
      setDomainStats(newDomainStats);
    }

    await saveLocalStats(newStats);
    return totalXp;
  };

  const updateStreak = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.last_practice_date === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = stats.last_practice_date === yesterday ? stats.streak + 1 : 1;
    const newBest = Math.max(newStreak, stats.best_streak || 0);

    const newStats = {
      ...stats,
      streak: newStreak,
      best_streak: newBest,
      last_practice_date: today,
      questions_today: 0,
      dailyDrillDone: false,
    };
    await saveLocalStats(newStats);
  };

  const addMissedQuestion = async (question) => {
    setMissedQuestions(prev => {
      const exists = prev.find(q => q.id === question.id);
      if (exists) return prev;
      const updated = [...prev, question];
      AsyncStorage.setItem(MISSED_QUESTIONS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const removeMissedQuestion = async (questionId) => {
    setMissedQuestions(prev => {
      const updated = prev.filter(q => q.id !== questionId);
      AsyncStorage.setItem(MISSED_QUESTIONS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const resetDailyStats = async () => {
    const newStats = {
      ...stats,
      questions_today: 0,
      dailyDrillDone: false,
    };
    await saveLocalStats(newStats);
  };

  return {
    stats,
    domainStats,
    weeklyData,
    unlockedAchievements,
    missedQuestions,
    loading,
    recordAnswer,
    updateStreak,
    addMissedQuestion,
    removeMissedQuestion,
    resetDailyStats,
  };
}
