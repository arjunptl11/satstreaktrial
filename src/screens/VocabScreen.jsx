import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, spacing, radius } from '../utils/theme';
import { buildVocabQuiz } from '../services/vocabService';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export default function VocabScreen({ navigation, route }) {
  const { isDailyVocab = true, count = 10 } = route.params || {};
  const { user } = useAuth();
  const { colors } = useTheme();
  const {
    seenVocabWords,
    recordVocabAnswer,
    updateStreak,
    markDailyVocabDone,
    loading: statsLoading,
  } = useUserStats();

  const [quiz, setQuiz] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [allMastered, setAllMastered] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Build quiz once stats are loaded
  useEffect(() => {
    if (statsLoading) return;
    const q = buildVocabQuiz(seenVocabWords, count);
    setQuiz(q);
    setAllMastered(!!q._allMastered);
    updateStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsLoading]);

  const currentWord = quiz[currentIndex];

  const animateTransition = useCallback((cb) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const handleSubmit = async () => {
    if (selectedIndex == null || !currentWord) return;
    const isCorrect = selectedIndex === currentWord.correctIndex;
    setSubmitted(true);

    const xp = await recordVocabAnswer({
      word: currentWord.word,
      isCorrect,
      isDailyVocab,
    });

    setSessionCorrect(prev => prev + (isCorrect ? 1 : 0));
    setSessionTotal(prev => prev + 1);
    setSessionXp(prev => prev + xp);
  };

  const handleNext = () => {
    if (currentIndex >= quiz.length - 1) {
      if (isDailyVocab) markDailyVocabDone();
      setSessionDone(true);
    } else {
      animateTransition(() => {
        setCurrentIndex(i => i + 1);
        setSelectedIndex(null);
        setSubmitted(false);
      });
    }
  };

  const getChoiceStyle = (idx) => {
    if (!submitted) {
      if (selectedIndex === idx) {
        return { borderColor: colors.primary, backgroundColor: colors.primaryXLight };
      }
      return { borderColor: colors.border, backgroundColor: colors.card };
    }
    if (idx === currentWord.correctIndex) {
      return { borderColor: colors.success, backgroundColor: colors.successLight };
    }
    if (idx === selectedIndex) {
      return { borderColor: colors.error, backgroundColor: colors.errorLight };
    }
    return { borderColor: colors.border, backgroundColor: colors.card, opacity: 0.5 };
  };

  const getChoiceTextColor = (idx) => {
    if (!submitted) return selectedIndex === idx ? colors.primary : colors.text;
    if (idx === currentWord.correctIndex) return colors.successText;
    if (idx === selectedIndex) return colors.errorText;
    return colors.textMuted;
  };

  // Session done screen
  if (sessionDone) {
    const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const isPerfect = sessionCorrect === sessionTotal && sessionTotal > 0;
    return (
      <LinearGradient colors={[colors.brand, colors.primary]} style={styles.doneGradient}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.doneContent}>
            <Text style={styles.doneEmoji}>
              {isPerfect ? '📚' : accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
            </Text>
            <Text style={styles.doneTitle}>
              {isPerfect ? 'Perfect Vocab Run!' : 'Vocab Quiz Complete!'}
            </Text>
            <Text style={styles.doneSub}>
              {sessionCorrect} of {sessionTotal} words mastered
            </Text>

            <View style={styles.doneStats}>
              <View style={styles.doneStat}>
                <Text style={styles.doneStatVal}>{sessionCorrect}/{sessionTotal}</Text>
                <Text style={styles.doneStatLabel}>Correct</Text>
              </View>
              <View style={[styles.doneStat, styles.doneStatDiv]}>
                <Text style={styles.doneStatVal}>{accuracy}%</Text>
                <Text style={styles.doneStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneStatVal, { color: colors.yellow }]}>+{sessionXp}</Text>
                <Text style={styles.doneStatLabel}>XP Earned</Text>
              </View>
            </View>

            {isDailyVocab && (
              <View style={styles.bonusCard}>
                <Text style={styles.bonusText}>+5 Daily Vocab Bonus XP!</Text>
              </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={{ marginTop: 24 }}>
              <View style={[styles.doneBtn, { backgroundColor: colors.yellow }]}>
                <Text style={[styles.doneBtnText, { color: colors.brand }]}>Back to Home</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Loading or empty
  if (statsLoading || quiz.length === 0) {
    return (
      <LinearGradient colors={[colors.brand, colors.primary]} style={styles.loadingContainer}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📖</Text>
        <Text style={styles.loadingText}>Loading vocab...</Text>
      </LinearGradient>
    );
  }

  const progress = (currentIndex + 1) / quiz.length;
  const isCorrectAnswer = submitted && selectedIndex === currentWord.correctIndex;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Leave Vocab Quiz?', 'Your progress so far is saved.', [
              { text: 'Stay', style: 'cancel' },
              { text: 'Leave', onPress: () => navigation.goBack() },
            ]);
          }}
          style={[styles.backBtn, { backgroundColor: colors.cardAlt }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isDailyVocab ? 'Daily Vocab' : 'Vocab Practice'}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {currentIndex + 1} of {quiz.length}
          </Text>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
          <Text style={[styles.scoreText, { color: colors.primary }]}>{sessionCorrect}/{sessionTotal}</Text>
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.primaryXLight }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {allMastered && (
            <View style={[styles.masteredBanner, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
              <Text style={[styles.masteredText, { color: colors.successText }]}>
                🏆 You've seen every vocab word! Reviewing now.
              </Text>
            </View>
          )}

          <Text style={[styles.promptLabel, { color: colors.primary }]}>What does this word mean?</Text>

          <LinearGradient
            colors={[colors.brand, colors.primary]}
            style={styles.wordCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.wordText}>{currentWord.word}</Text>
            {currentWord.partOfSpeech && (
              <Text style={styles.posText}>{currentWord.partOfSpeech}</Text>
            )}
          </LinearGradient>

          <View style={styles.choices}>
            {currentWord.choices.map((choice, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => !submitted && setSelectedIndex(idx)}
                disabled={submitted}
                activeOpacity={0.7}
                style={[styles.choice, getChoiceStyle(idx)]}
              >
                <View style={[styles.choiceLetter, { backgroundColor: colors.primary }]}>
                  <Text style={styles.choiceLetterText}>{CHOICE_LABELS[idx]}</Text>
                </View>
                <Text style={[styles.choiceText, { color: getChoiceTextColor(idx) }]}>
                  {choice}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {submitted && (
            <View
              style={[
                styles.resultHeader,
                {
                  backgroundColor: isCorrectAnswer ? colors.successLight : colors.errorLight,
                  borderColor: isCorrectAnswer ? colors.success : colors.error,
                },
              ]}
            >
              <Ionicons
                name={isCorrectAnswer ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={isCorrectAnswer ? colors.success : colors.error}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultTitle, { color: isCorrectAnswer ? colors.successText : colors.errorText }]}>
                  {isCorrectAnswer ? 'Correct!' : 'Not quite'}
                </Text>
                {!isCorrectAnswer && (
                  <Text style={[styles.resultDef, { color: colors.errorText }]}>
                    {currentWord.word}: {currentWord.correctDefinition}
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.actionRow}>
            {!submitted ? (
              <TouchableOpacity onPress={handleSubmit} disabled={selectedIndex == null} activeOpacity={0.85}>
                <LinearGradient
                  colors={selectedIndex != null ? [colors.primary, colors.accentDark] : [colors.border, colors.border]}
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.submitBtnText, { color: selectedIndex != null ? colors.white : colors.textLight }]}>
                    Submit
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                <LinearGradient
                  colors={
                    currentIndex < quiz.length - 1
                      ? [colors.primary, colors.accentDark]
                      : [colors.yellow, colors.yellowDark]
                  }
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text
                    style={[
                      styles.submitBtnText,
                      { color: currentIndex < quiz.length - 1 ? colors.white : colors.brand },
                    ]}
                  >
                    {currentIndex < quiz.length - 1 ? 'Next Word' : 'Finish Quiz'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { color: '#ffffff', fontSize: fonts.lg, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: fonts.base, fontWeight: '700' },
  headerSub: { fontSize: fonts.xs },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  scoreText: { fontSize: fonts.sm, fontWeight: '700' },

  progressTrack: { height: 4 },
  progressFill: { height: 4 },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  masteredBanner: {
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  masteredText: { fontSize: fonts.sm, fontWeight: '700', textAlign: 'center' },

  promptLabel: {
    fontSize: fonts.xs,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  wordCard: {
    borderRadius: radius.lg,
    paddingVertical: 36,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  wordText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFDD00',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  posText: {
    fontSize: fonts.sm,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },

  choices: { gap: 10, marginBottom: 16 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 2,
    padding: 14,
    gap: 12,
  },
  choiceLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceLetterText: {
    fontSize: fonts.sm,
    fontWeight: '800',
    color: '#ffffff',
  },
  choiceText: {
    flex: 1,
    fontSize: fonts.base,
    fontWeight: '500',
    lineHeight: 22,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  resultTitle: { fontSize: fonts.base, fontWeight: '700' },
  resultDef: { fontSize: fonts.sm, marginTop: 4, lineHeight: 20 },

  actionRow: { marginBottom: 8 },
  submitBtn: {
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: fonts.lg, fontWeight: '700' },

  // Session done
  doneGradient: { flex: 1 },
  doneContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  doneEmoji: { fontSize: 80, marginBottom: 20 },
  doneTitle: {
    fontSize: fonts['3xl'],
    fontWeight: '800',
    color: '#FFDD00',
    marginBottom: 8,
    textAlign: 'center',
  },
  doneSub: {
    fontSize: fonts.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 28,
  },
  doneStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    width: '100%',
  },
  doneStat: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  doneStatDiv: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  doneStatVal: { fontSize: fonts['2xl'], fontWeight: '800', color: '#ffffff' },
  doneStatLabel: {
    fontSize: fonts.xs,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    marginTop: 4,
  },
  bonusCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,221,0,0.2)',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,221,0,0.4)',
  },
  bonusText: { color: '#FFDD00', fontWeight: '700', fontSize: fonts.base },
  doneBtn: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  doneBtnText: { fontSize: fonts.lg, fontWeight: '800' },
});
