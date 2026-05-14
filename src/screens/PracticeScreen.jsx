import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useQuestions } from '../hooks/useQuestions';
import { useUserStats } from '../hooks/useUserStats';
import { colors, fonts, spacing, radius } from '../utils/theme';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

function XPToast({ xp, isCorrect, visible }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -20, duration: 400, useNativeDriver: true }),
          ]).start();
        }, 1200);
      });
    }
  }, [visible, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.xpToast,
        { opacity, transform: [{ translateY }] },
        isCorrect ? styles.xpToastCorrect : styles.xpToastIncorrect,
      ]}
    >
      <Text style={styles.xpToastText}>
        {isCorrect ? `+${xp} XP ⚡` : `+${xp} XP`}
      </Text>
    </Animated.View>
  );
}

export default function PracticeScreen({ navigation, route }) {
  const { difficulty, domain, isDailyDrill, count = 10 } = route.params || {};
  const { user } = useAuth();
  const { questions, loading, error, loadQuestions } = useQuestions();
  const { recordAnswer, updateStreak, addMissedQuestion } = useUserStats(user?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [lastXp, setLastXp] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [totalXpSession, setTotalXpSession] = useState(0);

  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadQuestions(difficulty, domain, count);
    updateStreak();
  }, []);

  const currentQuestion = questions[currentIndex];

  const animateCardTransition = useCallback((callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const handleSubmit = async () => {
    if (!selectedChoice || !currentQuestion) return;

    const isCorrect = selectedChoice === currentQuestion.correctAnswer;
    setSubmitted(true);

    const xp = await recordAnswer({
      questionId: currentQuestion.id,
      domain: currentQuestion.domain,
      difficulty: currentQuestion.difficulty,
      isCorrect,
      isDailyDrill,
    });

    if (!isCorrect) {
      addMissedQuestion(currentQuestion);
    }

    setLastXp(xp);
    setLastCorrect(isCorrect);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    setSessionCorrect(prev => prev + (isCorrect ? 1 : 0));
    setSessionTotal(prev => prev + 1);
    setXpGained(prev => prev + xp);
    setTotalXpSession(prev => prev + xp);
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setSessionDone(true);
    } else {
      animateCardTransition(() => {
        setCurrentIndex(prev => prev + 1);
        setSelectedChoice(null);
        setSubmitted(false);
        setShowToast(false);
      });
    }
  };

  const handleEndSession = () => {
    setSessionDone(true);
  };

  const getChoiceStyle = (label) => {
    if (!submitted) {
      return selectedChoice === label ? styles.choiceSelected : styles.choiceDefault;
    }
    if (label === currentQuestion.correctAnswer) return styles.choiceCorrect;
    if (label === selectedChoice && label !== currentQuestion.correctAnswer)
      return styles.choiceIncorrect;
    return styles.choiceDefault;
  };

  const getChoiceTextStyle = (label) => {
    if (!submitted) {
      return selectedChoice === label ? styles.choiceTextSelected : styles.choiceText;
    }
    if (label === currentQuestion.correctAnswer) return styles.choiceTextCorrect;
    if (label === selectedChoice && label !== currentQuestion.correctAnswer)
      return styles.choiceTextIncorrect;
    return styles.choiceText;
  };

  const getChoiceLabelStyle = (label) => {
    if (!submitted) {
      return selectedChoice === label ? styles.labelSelected : styles.labelDefault;
    }
    if (label === currentQuestion.correctAnswer) return styles.labelCorrect;
    if (label === selectedChoice && label !== currentQuestion.correctAnswer)
      return styles.labelIncorrect;
    return styles.labelDefault;
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return colors.easy;
    if (diff === 'Hard') return colors.error;
    return colors.medium;
  };

  // Session complete screen
  if (sessionDone) {
    const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const isPerfect = sessionCorrect === sessionTotal && sessionTotal > 0;
    return (
      <LinearGradient
        colors={[colors.navyDark, colors.navyPrimary]}
        style={styles.sessionDoneGradient}
      >
        <SafeAreaView style={styles.sessionDoneSafe}>
          <ScrollView contentContainerStyle={styles.sessionDoneContent}>
            <Text style={styles.sessionDoneEmoji}>
              {isPerfect ? '🏆' : accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
            </Text>
            <Text style={styles.sessionDoneTitle}>
              {isPerfect ? 'Perfect Session!' : 'Session Complete!'}
            </Text>
            <Text style={styles.sessionDoneSub}>
              {isPerfect
                ? 'You nailed every question!'
                : 'Great work — every question counts!'}
            </Text>

            <View style={styles.sessionStats}>
              <View style={styles.sessionStatItem}>
                <Text style={styles.sessionStatValue}>{sessionCorrect}/{sessionTotal}</Text>
                <Text style={styles.sessionStatLabel}>Correct</Text>
              </View>
              <View style={[styles.sessionStatItem, styles.sessionStatBorder]}>
                <Text style={styles.sessionStatValue}>{accuracy}%</Text>
                <Text style={styles.sessionStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.sessionStatItem}>
                <Text style={[styles.sessionStatValue, { color: colors.yellow }]}>
                  +{totalXpSession}
                </Text>
                <Text style={styles.sessionStatLabel}>XP Earned</Text>
              </View>
            </View>

            {isDailyDrill && (
              <View style={styles.drillBonusCard}>
                <Text style={styles.drillBonusText}>⚡ +5 Daily Drill Bonus XP!</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs')}
              activeOpacity={0.85}
              style={{ marginTop: 24 }}
            >
              <View style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Back to Home</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setCurrentIndex(0);
                setSelectedChoice(null);
                setSubmitted(false);
                setSessionCorrect(0);
                setSessionTotal(0);
                setTotalXpSession(0);
                setSessionDone(false);
                loadQuestions(difficulty, domain, count);
              }}
              style={styles.practiceAgainBtn}
            >
              <Text style={styles.practiceAgainText}>Practice Again ↻</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={[colors.navyDark, colors.navyPrimary]} style={styles.loadingContainer}>
        <ActivityIndicator color={colors.yellow} size="large" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </LinearGradient>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <LinearGradient colors={[colors.navyDark, colors.navyPrimary]} style={styles.loadingContainer}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
        <Text style={styles.loadingText}>
          {error ? 'Failed to load questions' : 'No questions found'}
        </Text>
        <TouchableOpacity
          onPress={() => loadQuestions(difficulty, domain, count)}
          style={styles.retryBtn}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: fonts.sm }}>← Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const progress = (currentIndex + 1) / questions.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Leave Session?',
              'Your progress will be saved.',
              [
                { text: 'Stay', style: 'cancel' },
                { text: 'Leave', onPress: () => navigation.goBack() },
              ]
            );
          }}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isDailyDrill ? '⚡ Daily Drill' : difficulty || 'Practice'}
          </Text>
          <Text style={styles.headerSub}>
            {currentIndex + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{sessionCorrect}/{sessionTotal}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Domain + Difficulty tags */}
          <View style={styles.tagRow}>
            <View style={styles.domainTag}>
              <Text style={styles.domainTagText}>{currentQuestion.domain}</Text>
            </View>
            <View
              style={[
                styles.diffTag,
                { backgroundColor: getDifficultyColor(currentQuestion.difficulty) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.diffTagText,
                  { color: getDifficultyColor(currentQuestion.difficulty) },
                ]}
              >
                {currentQuestion.difficulty}
              </Text>
            </View>
          </View>

          {/* Passage */}
          {currentQuestion.passage && (
            <View style={styles.passageCard}>
              <View style={styles.passageHeader}>
                <Ionicons name="document-text-outline" size={16} color={colors.navyPrimary} />
                <Text style={styles.passageLabel}>Passage</Text>
              </View>
              <Text style={styles.passageText}>{currentQuestion.passage}</Text>
            </View>
          )}

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>Question {currentIndex + 1}</Text>
            <Text style={styles.questionText}>{currentQuestion.prompt}</Text>
          </View>

          {/* Choices */}
          <View style={styles.choicesContainer}>
            {CHOICE_LABELS.map(label => {
              const choiceText = currentQuestion.choices[label];
              if (!choiceText) return null;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => !submitted && setSelectedChoice(label)}
                  style={[styles.choiceBtn, getChoiceStyle(label)]}
                  activeOpacity={submitted ? 1 : 0.75}
                  disabled={submitted}
                >
                  <View style={[styles.choiceLabel, getChoiceLabelStyle(label)]}>
                    <Text style={styles.choiceLabelText}>{label}</Text>
                  </View>
                  <Text style={[styles.choiceMainText, getChoiceTextStyle(label)]}>
                    {choiceText}
                  </Text>
                  {submitted && label === currentQuestion.correctAnswer && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  )}
                  {submitted && label === selectedChoice && label !== currentQuestion.correctAnswer && (
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation (after submit) */}
          {submitted && (
            <View
              style={[
                styles.explanationCard,
                selectedChoice === currentQuestion.correctAnswer
                  ? styles.explanationCorrect
                  : styles.explanationIncorrect,
              ]}
            >
              <View style={styles.explanationHeader}>
                <Ionicons
                  name={
                    selectedChoice === currentQuestion.correctAnswer
                      ? 'checkmark-circle'
                      : 'close-circle'
                  }
                  size={22}
                  color={
                    selectedChoice === currentQuestion.correctAnswer
                      ? colors.success
                      : colors.error
                  }
                />
                <Text
                  style={[
                    styles.explanationTitle,
                    {
                      color:
                        selectedChoice === currentQuestion.correctAnswer
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {selectedChoice === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                </Text>
              </View>
              {currentQuestion.explanation ? (
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              ) : (
                <Text style={styles.explanationText}>
                  The correct answer is {currentQuestion.correctAnswer}.
                </Text>
              )}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {!submitted ? (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!selectedChoice}
                activeOpacity={0.85}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={
                    selectedChoice
                      ? [colors.navyLight, colors.navyPrimary]
                      : [colors.border, colors.border]
                  }
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text
                    style={[
                      styles.submitBtnText,
                      !selectedChoice && styles.submitBtnTextDisabled,
                    ]}
                  >
                    Submit Answer
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.nextRow}>
                {currentIndex < questions.length - 1 ? (
                  <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.85}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={[colors.navyLight, colors.navyPrimary]}
                      style={styles.submitBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.submitBtnText}>Next Question →</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleEndSession}
                    activeOpacity={0.85}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={[colors.yellow, colors.yellowDark]}
                      style={styles.submitBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.submitBtnText, { color: colors.navyDark }]}>
                        Finish Session 🏆
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {!submitted && currentIndex < questions.length - 1 && (
            <TouchableOpacity onPress={handleEndSession} style={styles.endEarlyBtn}>
              <Text style={styles.endEarlyText}>End Session Early</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* XP Toast */}
      <XPToast xp={lastXp} isCorrect={lastCorrect} visible={showToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { color: colors.white, fontSize: fonts.lg, fontWeight: '600' },
  retryBtn: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: radius.full,
    marginTop: 8,
  },
  retryText: { color: colors.navyDark, fontWeight: '800', fontSize: fonts.base },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: fonts.base, fontWeight: '700', color: colors.textDark },
  headerSub: { fontSize: fonts.xs, color: colors.textMuted },
  scoreBadge: {
    backgroundColor: colors.navyXLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.navyBorder,
  },
  scoreText: { fontSize: fonts.sm, fontWeight: '700', color: colors.navyPrimary },

  progressTrack: {
    height: 4,
    backgroundColor: colors.navyXLight,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.navyPrimary,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  domainTag: {
    backgroundColor: colors.navyXLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.navyBorder,
  },
  domainTagText: { fontSize: fonts.xs, color: colors.navyPrimary, fontWeight: '600' },
  diffTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  diffTagText: { fontSize: fonts.xs, fontWeight: '700' },

  passageCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  passageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  passageLabel: {
    fontSize: fonts.xs,
    fontWeight: '700',
    color: colors.navyPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  passageText: {
    fontSize: fonts.sm,
    color: colors.textMid,
    lineHeight: 22,
  },

  questionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.navyBorder,
    shadowColor: colors.navyPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  questionLabel: {
    fontSize: fonts.xs,
    fontWeight: '700',
    color: colors.navyPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  questionText: {
    fontSize: fonts.base,
    color: colors.textDark,
    lineHeight: 24,
    fontWeight: '500',
  },

  choicesContainer: { gap: 10, marginBottom: 16 },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 2,
    gap: 12,
  },
  choiceDefault: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  choiceSelected: {
    backgroundColor: colors.navyXLight,
    borderColor: colors.navyPrimary,
  },
  choiceCorrect: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  choiceIncorrect: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  choiceLabel: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelDefault: { backgroundColor: colors.offWhite },
  labelSelected: { backgroundColor: colors.navyPrimary },
  labelCorrect: { backgroundColor: colors.success },
  labelIncorrect: { backgroundColor: colors.error },
  choiceLabelText: { fontSize: fonts.sm, fontWeight: '800', color: colors.white },
  choiceMainText: { flex: 1, fontSize: fonts.base, lineHeight: 22 },
  choiceText: { color: colors.textDark },
  choiceTextSelected: { color: colors.navyPrimary, fontWeight: '600' },
  choiceTextCorrect: { color: '#065F46', fontWeight: '600' },
  choiceTextIncorrect: { color: '#991B1B', fontWeight: '600' },

  explanationCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  explanationCorrect: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  explanationIncorrect: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: { fontSize: fonts.base, fontWeight: '700' },
  explanationText: {
    fontSize: fonts.sm,
    color: colors.textMid,
    lineHeight: 22,
  },

  actionRow: { marginBottom: 8 },
  nextRow: { flex: 1 },
  submitBtn: {
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: colors.yellow,
    fontSize: fonts.lg,
    fontWeight: '700',
  },
  submitBtnTextDisabled: { color: colors.textLight },

  endEarlyBtn: { alignItems: 'center', paddingVertical: 8 },
  endEarlyText: { color: colors.textMuted, fontSize: fonts.sm, fontWeight: '600' },

  xpToast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  xpToastCorrect: { backgroundColor: colors.navyPrimary },
  xpToastIncorrect: { backgroundColor: colors.textMuted },
  xpToastText: { color: colors.yellow, fontWeight: '800', fontSize: fonts.base },

  // Session done
  sessionDoneGradient: { flex: 1 },
  sessionDoneSafe: { flex: 1 },
  sessionDoneContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sessionDoneEmoji: { fontSize: 80, marginBottom: 20 },
  sessionDoneTitle: {
    fontSize: fonts['3xl'],
    fontWeight: '800',
    color: colors.yellow,
    marginBottom: 8,
    textAlign: 'center',
  },
  sessionDoneSub: {
    fontSize: fonts.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  sessionStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    width: '100%',
  },
  sessionStatItem: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  sessionStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sessionStatValue: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
    color: colors.white,
  },
  sessionStatLabel: {
    fontSize: fonts.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginTop: 4,
  },
  drillBonusCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,221,0,0.2)',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,221,0,0.4)',
  },
  drillBonusText: { color: colors.yellow, fontWeight: '700', fontSize: fonts.base },
  doneBtn: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  doneBtnText: {
    color: colors.navyDark,
    fontSize: fonts.lg,
    fontWeight: '800',
  },
  practiceAgainBtn: { marginTop: 16, paddingVertical: 12 },
  practiceAgainText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: fonts.base,
    fontWeight: '600',
  },
});
