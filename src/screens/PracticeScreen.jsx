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
import { useTheme } from '../contexts/ThemeContext';
import { fonts, spacing, radius } from '../utils/theme';
import ChoiceButton from '../components/practice/ChoiceButton';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // bold markdown
    .replace(/\*(.*?)\*/g, '$1')        // italic markdown
    .replace(/—/g, ' - ')               // em dashes
    .replace(/–/g, ' - ')               // en dashes
    .replace(/\s+/g, ' ')               // extra spaces
    .trim();
};

const formatQuestionText = (text) => {
  if (!text) return '';
  const sanitized = sanitizeText(text);
  // Break after sentence-ending punctuation before certain question words
  return sanitized.replace(/([.?!])\s+(Which|What|How|Choose|Select|According|Based)/g, '$1\n\n$2');
};

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
      ]}
    >
      <Text style={styles.xpToastText}>
        {isCorrect ? `+${xp} XP` : `+${xp} XP`}
      </Text>
    </Animated.View>
  );
}

export default function PracticeScreen({ navigation, route }) {
  const { difficulty, domain, isDailyDrill, count = 10 } = route.params || {};
  const { user } = useAuth();
  const { questions, loading, error, loadQuestions } = useQuestions();
  const { recordAnswer, updateStreak, addMissedQuestion } = useUserStats(user?.id);
  const { colors } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [lastXp, setLastXp] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [totalXpSession, setTotalXpSession] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

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
    setShowExplanation(false);

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
        setShowExplanation(false);
      });
    }
  };

  const handleEndSession = () => {
    setSessionDone(true);
  };

  const getDifficultyColors = (diff) => {
    if (diff === 'Easy') return { color: colors.easy, bg: colors.easyBg };
    if (diff === 'Hard') return { color: colors.hard, bg: colors.hardBg };
    return { color: colors.medium, bg: colors.mediumBg };
  };

  const getChoiceState = (label) => {
    if (!submitted) {
      return selectedChoice === label ? 'selected' : 'default';
    }
    if (label === currentQuestion.correctAnswer) return 'correct';
    if (label === selectedChoice && label !== currentQuestion.correctAnswer) return 'incorrect';
    return 'dimmed';
  };

  // Session complete screen
  if (sessionDone) {
    const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const isPerfect = sessionCorrect === sessionTotal && sessionTotal > 0;
    return (
      <LinearGradient
        colors={[colors.brand, colors.primary]}
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
                <Text style={styles.drillBonusText}>+5 Daily Drill Bonus XP!</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs')}
              activeOpacity={0.85}
              style={{ marginTop: 24 }}
            >
              <View style={[styles.doneBtn, { backgroundColor: colors.yellow }]}>
                <Text style={[styles.doneBtnText, { color: colors.brand }]}>Back to Home</Text>
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
                setShowExplanation(false);
                loadQuestions(difficulty, domain, count);
              }}
              style={styles.practiceAgainBtn}
            >
              <Text style={styles.practiceAgainText}>Practice Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={[colors.brand, colors.primary]} style={styles.loadingContainer}>
        <ActivityIndicator color={colors.yellow} size="large" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </LinearGradient>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <LinearGradient colors={[colors.brand, colors.primary]} style={styles.loadingContainer}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
        <Text style={styles.loadingText}>
          {error ? 'Failed to load questions' : 'No questions found'}
        </Text>
        <TouchableOpacity
          onPress={() => loadQuestions(difficulty, domain, count)}
          style={[styles.retryBtn, { backgroundColor: colors.yellow }]}
        >
          <Text style={[styles.retryText, { color: colors.brand }]}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: fonts.sm }}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const progress = (currentIndex + 1) / questions.length;
  const diffColors = getDifficultyColors(currentQuestion.difficulty);
  const passage = currentQuestion.passage;
  const hasPassage = passage && passage !== 'null' && passage.trim().length > 0;
  const isCorrectAnswer = submitted && selectedChoice === currentQuestion.correctAnswer;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
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
          style={[styles.backBtn, { backgroundColor: colors.cardAlt }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isDailyDrill ? 'Daily Drill' : difficulty || 'Practice'}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {currentIndex + 1} of {questions.length}
          </Text>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
          <Text style={[styles.scoreText, { color: colors.primary }]}>{sessionCorrect}/{sessionTotal}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.primaryXLight }]}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Domain + Difficulty tags */}
          <View style={styles.tagRow}>
            <View style={[styles.domainTag, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
              <Text style={[styles.domainTagText, { color: colors.primary }]}>{currentQuestion.domain}</Text>
            </View>
            <View style={[styles.diffTag, { backgroundColor: diffColors.bg }]}>
              <Text style={[styles.diffTagText, { color: diffColors.color }]}>
                {currentQuestion.difficulty}
              </Text>
            </View>
          </View>

          {/* Passage */}
          {hasPassage && (
            <View style={[styles.passageCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <View style={styles.passageHeader}>
                <Ionicons name="document-text-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.passageLabel, { color: colors.textMuted }]}>Passage</Text>
              </View>
              <Text style={[styles.passageText, { color: colors.textSecondary }]}>{sanitizeText(passage)}</Text>
            </View>
          )}

          {/* Question */}
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionLabel, { color: colors.primary }]}>Question {currentIndex + 1}</Text>
            <Text style={[styles.questionText, { color: colors.text }]}>{formatQuestionText(currentQuestion.prompt)}</Text>
          </View>

          {/* Choices */}
          <View style={styles.choicesContainer}>
            {CHOICE_LABELS.map(label => {
              const choiceText = currentQuestion.choices[label];
              if (!choiceText) return null;
              return (
                <ChoiceButton
                  key={label}
                  letter={label}
                  text={sanitizeText(choiceText)}
                  state={getChoiceState(label)}
                  onPress={() => !submitted && setSelectedChoice(label)}
                  disabled={submitted}
                />
              );
            })}
          </View>

          {/* Answer result + expandable explanation */}
          {submitted && (
            <View style={styles.resultSection}>
              {/* Result header */}
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
                <Text
                  style={[
                    styles.resultTitle,
                    { color: isCorrectAnswer ? colors.successText : colors.errorText },
                  ]}
                >
                  {isCorrectAnswer ? 'Correct!' : 'Incorrect'}
                </Text>
                {!isCorrectAnswer && (
                  <Text style={[styles.correctAnswerHint, { color: colors.successText }]}>
                    Correct: {currentQuestion.correctAnswer}
                  </Text>
                )}
              </View>

              {/* See Explanation toggle */}
              <TouchableOpacity
                onPress={() => setShowExplanation(prev => !prev)}
                style={[styles.explanationToggle, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}
                activeOpacity={0.75}
              >
                <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                <Text style={[styles.explanationToggleText, { color: colors.primary }]}>
                  {showExplanation ? 'Hide Explanation' : 'See Explanation'}
                </Text>
                <Ionicons
                  name={showExplanation ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>

              {showExplanation && (
                <View style={[styles.explanationBox, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
                  <Text style={[styles.explanationText, { color: colors.primaryText }]}>
                    {currentQuestion.explanation
                      ? sanitizeText(currentQuestion.explanation)
                      : `The correct answer is ${currentQuestion.correctAnswer}.`}
                  </Text>
                </View>
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
                      ? [colors.primary, colors.accentDark]
                      : [colors.border, colors.border]
                  }
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text
                    style={[
                      styles.submitBtnText,
                      { color: selectedChoice ? colors.white : colors.textLight },
                    ]}
                  >
                    Submit Answer
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }}>
                {currentIndex < questions.length - 1 ? (
                  <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.85}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.accentDark]}
                      style={styles.submitBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.submitBtnText, { color: colors.white }]}>Next Question</Text>
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
                      <Text style={[styles.submitBtnText, { color: colors.brand }]}>
                        Finish Session
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {!submitted && currentIndex < questions.length - 1 && (
            <TouchableOpacity onPress={handleEndSession} style={styles.endEarlyBtn}>
              <Text style={[styles.endEarlyText, { color: colors.textMuted }]}>End Session Early</Text>
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
  safe: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { color: '#ffffff', fontSize: fonts.lg, fontWeight: '600' },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: radius.full,
    marginTop: 8,
  },
  retryText: { fontWeight: '800', fontSize: fonts.base },

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

  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  domainTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  domainTagText: { fontSize: fonts.xs, fontWeight: '600' },
  diffTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  diffTagText: { fontSize: fonts.xs, fontWeight: '700' },

  passageCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
    borderWidth: 1.5,
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
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  passageText: {
    fontSize: fonts.sm,
    lineHeight: 22,
  },

  questionCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  questionLabel: {
    fontSize: fonts.xs,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  questionText: {
    fontSize: fonts.base,
    lineHeight: 24,
    fontWeight: '500',
  },

  choicesContainer: { marginBottom: 16 },

  resultSection: { marginBottom: 16 },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  resultTitle: { fontSize: fonts.base, fontWeight: '700', flex: 1 },
  correctAnswerHint: { fontSize: fonts.sm, fontWeight: '600' },

  explanationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  explanationToggleText: { flex: 1, fontSize: fonts.sm, fontWeight: '700' },

  explanationBox: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    marginTop: 4,
  },
  explanationText: {
    fontSize: fonts.sm,
    lineHeight: 22,
  },

  actionRow: { marginBottom: 8 },
  submitBtn: {
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: fonts.lg,
    fontWeight: '700',
  },

  endEarlyBtn: { alignItems: 'center', paddingVertical: 8 },
  endEarlyText: { fontSize: fonts.sm, fontWeight: '600' },

  xpToast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: '#1a00be',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  xpToastText: { color: '#FFDD00', fontWeight: '800', fontSize: fonts.base },

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
    color: '#FFDD00',
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
    color: '#ffffff',
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
  drillBonusText: { color: '#FFDD00', fontWeight: '700', fontSize: fonts.base },
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
  doneBtnText: {
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
