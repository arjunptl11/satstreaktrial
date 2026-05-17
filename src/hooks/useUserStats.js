import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './useAuth';
import { ZERO_STATS, EMPTY_DOMAIN_STATS, EMPTY_WEEKLY } from '../services/mockData';
import { XP, LEVELS } from '../utils/constants';

const LOCAL_STATS_PREFIX = 'local_stats_';
const LOCAL_ANSWERED_PREFIX = 'local_answered_';
const LOCAL_VOCAB_PREFIX = 'local_vocab_';
const MISSED_QUESTIONS_PREFIX = 'missed_questions_';

const isRemoteUser = (userId) =>
  isSupabaseConfigured && !!userId && userId !== 'mock-user-1';

const rowToStats = (row) => ({
  xp: row.xp ?? 0,
  level: row.level ?? 1,
  streak: row.streak ?? 0,
  best_streak: row.best_streak ?? 0,
  total_questions: row.total_questions ?? 0,
  total_correct: row.total_correct ?? 0,
  questions_today: row.questions_today ?? 0,
  last_practice_date: row.last_practice_date ?? null,
  dailyVocabDone: row.daily_vocab_done ?? false,
});

const statsToRow = (s) => ({
  xp: s.xp,
  level: s.level,
  streak: s.streak,
  best_streak: s.best_streak,
  total_questions: s.total_questions,
  total_correct: s.total_correct,
  questions_today: s.questions_today,
  last_practice_date: s.last_practice_date,
  daily_vocab_done: s.dailyVocabDone,
  updated_at: new Date().toISOString(),
});

const UserStatsContext = createContext(null);

export function UserStatsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [stats, setStats] = useState(ZERO_STATS);
  const [domainStats, setDomainStats] = useState(EMPTY_DOMAIN_STATS);
  const [weeklyData, setWeeklyData] = useState(EMPTY_WEEKLY);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState([]);
  const [seenVocabWords, setSeenVocabWords] = useState([]);
  const [loading, setLoading] = useState(true);

  const statsRef = useRef(stats);
  statsRef.current = stats;
  const remote = isRemoteUser(userId);

  // ---------- Load on user change ----------
  useEffect(() => {
    let cancelled = false;

    const reset = () => {
      setStats(ZERO_STATS);
      setDomainStats(EMPTY_DOMAIN_STATS);
      setAnsweredQuestionIds([]);
      setSeenVocabWords([]);
      setMissedQuestions([]);
    };

    const loadAll = async () => {
      if (!userId) {
        reset();
        setLoading(false);
        return;
      }
      setLoading(true);
      reset();

      if (remote) {
        const { data: statsRow } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (statsRow) {
          setStats(rowToStats(statsRow));
        } else {
          await supabase.from('user_stats').insert({ user_id: userId });
          setStats(ZERO_STATS);
        }

        const { data: answers } = await supabase
          .from('answered_questions')
          .select('question_id, domain, is_correct, answered_at')
          .eq('user_id', userId);

        if (cancelled) return;

        if (answers) {
          setAnsweredQuestionIds(answers.map(a => a.question_id));
          const domainMap = {};
          EMPTY_DOMAIN_STATS.forEach(d => {
            domainMap[d.domain] = { domain: d.domain, total_questions: 0, total_correct: 0 };
          });
          answers.forEach(a => {
            if (!domainMap[a.domain]) {
              domainMap[a.domain] = { domain: a.domain, total_questions: 0, total_correct: 0 };
            }
            domainMap[a.domain].total_questions += 1;
            if (a.is_correct) domainMap[a.domain].total_correct += 1;
          });
          setDomainStats(Object.values(domainMap));
        }

        const { data: vocab } = await supabase
          .from('seen_vocab')
          .select('word')
          .eq('user_id', userId);

        if (cancelled) return;
        if (vocab) setSeenVocabWords(vocab.map(v => v.word));
      } else {
        try {
          const savedStats = await AsyncStorage.getItem(LOCAL_STATS_PREFIX + userId);
          if (savedStats) setStats(JSON.parse(savedStats));

          const savedAnswered = await AsyncStorage.getItem(LOCAL_ANSWERED_PREFIX + userId);
          if (savedAnswered) {
            const parsed = JSON.parse(savedAnswered);
            setAnsweredQuestionIds(parsed.ids || []);
            if (parsed.domainStats) setDomainStats(parsed.domainStats);
          }

          const savedVocab = await AsyncStorage.getItem(LOCAL_VOCAB_PREFIX + userId);
          if (savedVocab) setSeenVocabWords(JSON.parse(savedVocab));

          const savedMissed = await AsyncStorage.getItem(MISSED_QUESTIONS_PREFIX + userId);
          if (savedMissed) setMissedQuestions(JSON.parse(savedMissed));
        } catch {}
      }

      if (!cancelled) setLoading(false);
    };

    loadAll();
    return () => { cancelled = true; };
  }, [userId, remote]);

  // ---------- Persist stats ----------
  const persistStats = useCallback(async (newStats) => {
    setStats(newStats);
    if (remote) {
      supabase.from('user_stats').update(statsToRow(newStats)).eq('user_id', userId).then(() => {});
    } else if (userId) {
      AsyncStorage.setItem(LOCAL_STATS_PREFIX + userId, JSON.stringify(newStats)).catch(() => {});
    }
  }, [userId, remote]);

  const persistAnsweredLocal = useCallback(async (questionId, domain, isCorrect) => {
    if (!userId) return;
    try {
      const existing = await AsyncStorage.getItem(LOCAL_ANSWERED_PREFIX + userId);
      const parsed = existing
        ? JSON.parse(existing)
        : { ids: [], domainStats: EMPTY_DOMAIN_STATS.map(d => ({ ...d })) };
      const idStr = String(questionId);
      if (!parsed.ids.includes(idStr)) parsed.ids.push(idStr);
      // update domain stats in local copy
      const idx = parsed.domainStats.findIndex(d => d.domain === domain);
      if (idx >= 0) {
        parsed.domainStats[idx].total_questions += 1;
        if (isCorrect) parsed.domainStats[idx].total_correct += 1;
      } else if (domain) {
        parsed.domainStats.push({ domain, total_questions: 1, total_correct: isCorrect ? 1 : 0 });
      }
      AsyncStorage.setItem(LOCAL_ANSWERED_PREFIX + userId, JSON.stringify(parsed)).catch(() => {});
    } catch {}
  }, [userId]);

  // ---------- Record question answer ----------
  const recordAnswer = useCallback(async ({ questionId, domain, difficulty, isCorrect, isDailyDrill }) => {
    const current = statsRef.current;
    const xpGained = isCorrect ? XP.CORRECT : XP.INCORRECT;
    const totalXp = xpGained;

    const newXp = current.xp + totalXp;
    const newStats = {
      ...current,
      xp: newXp,
      level: LEVELS.calculateLevel(newXp),
      total_questions: current.total_questions + 1,
      total_correct: current.total_correct + (isCorrect ? 1 : 0),
      questions_today: (current.questions_today || 0) + 1,
    };

    setDomainStats(prev => {
      const idx = prev.findIndex(d => d.domain === domain);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          total_questions: next[idx].total_questions + 1,
          total_correct: next[idx].total_correct + (isCorrect ? 1 : 0),
        };
        return next;
      }
      return domain
        ? [...prev, { domain, total_questions: 1, total_correct: isCorrect ? 1 : 0 }]
        : prev;
    });

    setAnsweredQuestionIds(prev => prev.includes(String(questionId)) ? prev : [...prev, String(questionId)]);

    await persistStats(newStats);

    if (remote) {
      supabase.from('answered_questions').upsert({
        user_id: userId,
        question_id: String(questionId),
        is_correct: isCorrect,
        domain: domain || null,
        difficulty: difficulty || null,
      }, { onConflict: 'user_id,question_id' }).then(() => {});
    } else {
      persistAnsweredLocal(questionId, domain, isCorrect);
    }

    return totalXp;
  }, [persistStats, persistAnsweredLocal, remote, userId]);

  // ---------- Record vocab answer ----------
  const recordVocabAnswer = useCallback(async ({ word, isCorrect, isDailyVocab }) => {
    const current = statsRef.current;
    const xpGained = isCorrect ? XP.CORRECT : XP.INCORRECT;
    const bonus = isDailyVocab && !current.dailyVocabDone ? XP.DAILY_BONUS : 0;
    const totalXp = xpGained + bonus;

    const newXp = current.xp + totalXp;
    const newStats = {
      ...current,
      xp: newXp,
      level: LEVELS.calculateLevel(newXp),
    };

    setSeenVocabWords(prev => prev.includes(word) ? prev : [...prev, word]);
    await persistStats(newStats);

    if (remote) {
      supabase.from('seen_vocab').upsert({
        user_id: userId,
        word,
        is_correct: isCorrect,
      }, { onConflict: 'user_id,word' }).then(() => {});
    } else if (userId) {
      try {
        const existing = await AsyncStorage.getItem(LOCAL_VOCAB_PREFIX + userId);
        const parsed = existing ? JSON.parse(existing) : [];
        if (!parsed.includes(word)) parsed.push(word);
        AsyncStorage.setItem(LOCAL_VOCAB_PREFIX + userId, JSON.stringify(parsed)).catch(() => {});
      } catch {}
    }

    return totalXp;
  }, [persistStats, remote, userId]);

  // ---------- Streak ----------
  const updateStreak = useCallback(async () => {
    const current = statsRef.current;
    const today = new Date().toISOString().split('T')[0];
    if (current.last_practice_date === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = current.last_practice_date === yesterday ? current.streak + 1 : 1;
    const newBest = Math.max(newStreak, current.best_streak || 0);

    const newStats = {
      ...current,
      streak: newStreak,
      best_streak: newBest,
      last_practice_date: today,
      questions_today: 0,
      dailyVocabDone: false,
    };
    await persistStats(newStats);
  }, [persistStats]);

  const markDailyVocabDone = useCallback(async () => {
    const current = statsRef.current;
    if (current.dailyVocabDone) return;
    await persistStats({ ...current, dailyVocabDone: true });
  }, [persistStats]);

  const addMissedQuestion = useCallback(async (question) => {
    setMissedQuestions(prev => {
      if (prev.find(q => q.id === question.id)) return prev;
      const updated = [...prev, question];
      if (userId) {
        AsyncStorage.setItem(MISSED_QUESTIONS_PREFIX + userId, JSON.stringify(updated)).catch(() => {});
      }
      return updated;
    });
  }, [userId]);

  const removeMissedQuestion = useCallback(async (questionId) => {
    setMissedQuestions(prev => {
      const updated = prev.filter(q => q.id !== questionId);
      if (userId) {
        AsyncStorage.setItem(MISSED_QUESTIONS_PREFIX + userId, JSON.stringify(updated)).catch(() => {});
      }
      return updated;
    });
  }, [userId]);

  const value = {
    stats,
    domainStats,
    weeklyData,
    unlockedAchievements,
    missedQuestions,
    answeredQuestionIds,
    seenVocabWords,
    loading,
    recordAnswer,
    recordVocabAnswer,
    updateStreak,
    markDailyVocabDone,
    addMissedQuestion,
    removeMissedQuestion,
  };

  return <UserStatsContext.Provider value={value}>{children}</UserStatsContext.Provider>;
}

export const useUserStats = () => {
  const ctx = useContext(UserStatsContext);
  if (!ctx) {
    throw new Error('useUserStats must be used within UserStatsProvider');
  }
  return ctx;
};
