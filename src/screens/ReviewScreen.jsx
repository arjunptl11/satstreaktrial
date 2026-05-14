import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { colors, fonts, spacing, radius } from '../utils/theme';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export default function ReviewScreen({ navigation }) {
  const { user } = useAuth();
  const { missedQuestions, removeMissedQuestion, recordAnswer } = useUserStats(user?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [removedMessage, setRemovedMessage] = useState('');
  const [reviewedCorrect, setReviewedCorrect] = useState(0);
  const [reviewedTotal, setReviewedTotal] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const currentQuestion = missedQuestions[currentIndex];

  const animateTransition = (callback) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  };

  const handleSubmit = async () => {
    if (!selectedChoice || !currentQuestion) return;

    const isCorrect = selectedChoice === currentQuestion.correctAnswer;
    setSubmitted(true);
    setReviewedTotal(prev => prev + 1);

    if (isCorrect) {
      setReviewedCorrect(prev => prev + 1);
      await removeMissedQuestion(currentQuestion.id);
      setRemovedMessage('✅ Removed from review list!');
      setTimeout(() => setRemovedMessage(''), 3000);
    }

    await recordAnswer({
      questionId: currentQuestion.id,
      domain: currentQuestion.domain,
      difficulty: currentQuestion.difficulty,
      isCorrect,
      isDailyDrill: false,
    });
  };

  const handleNext = () => {
    const nextIndex = currentIndex;
    // Since we removed from list if correct, check new length
    if (missedQuestions.length === 0 || currentIndex >= missedQuestions.length) {
      setSessionDone(true);
      return;
    }
    animateTransition(() => {
      setCurrentIndex(0); // Stay at 0 since list shrinks on correct
      setSelectedChoice(null);
      setSubmitted(false);
      setRemovedMessage('');
    });
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

  // Empty state
  if (missedQuestions.length === 0 && !sessionDone) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Mistakes</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptySub}>
            You have no questions to review. Keep practicing to improve further!
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.emptyBtn}
          >
            <Text style={styles.emptyBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Session done
  if (sessionDone) {
    const accuracy = reviewedTotal > 0 ? Math.round((reviewedCorrect / reviewedTotal) * 100) : 0;
    const remaining = missedQuestions.length;
    return (
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.sessionDoneContent}>
            <Text style={styles.sessionDoneEmoji}>
              {reviewedCorrect === reviewedTotal && reviewedTotal > 0 ? '🏆' : '💪'}
            </Text>
            <Text style={styles.sessionDoneTitle}>Review Complete!</Text>
            <Text style={styles.sessionDoneSub}>
              {remaining === 0
                ? 'You cleared your review list!'
                : `${remaining} question${remaining !== 1 ? 's' : ''} still in review`}
            </Text>

            <View style={styles.sessionStats}>
              <View style={styles.sessionStatItem}>
                <Text style={styles.sessionStatValue}>{reviewedCorrect}/{reviewedTotal}</Text>
                <Text style={styles.sessionStatLabel}>Correct</Text>
              </View>
              <View style={[styles.sessionStatItem, styles.sessionStatBorder]}>
                <Text style={styles.sessionStatValue}>{accuracy}%</Text>
                <Text style={styles.sessionStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.sessionStatItem}>
                <Text style={styles.sessionStatValue}>{remaining}</Text>
                <Text style={styles.sessionStatLabel}>Remaining</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs')}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Back to Home</Text>
            </TouchableOpacity>

            {remaining > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setCurrentIndex(0);
                  setSelectedChoice(null);
                  setSubmitted(false);
                  setReviewedCorrect(0);
                  setReviewedTotal(0);
                  setSessionDone(false);
                }}
                style={styles.reviewAgainBtn}
              >
                <Text style={styles.reviewAgainText}>Keep Reviewing ↻</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const progress = (currentIndex + 1) / missedQuestions.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Review Mistakes</Text>
          <Text style={styles.headerSub}>
            {missedQuestions.length} question{missedQuestions.length !== 1 ? 's' : ''} remaining
          </Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{reviewedCorrect}/{reviewedTotal}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Removed message */}
          {removedMessage ? (
            <View style={styles.removedBanner}>
              <Text style={styles.removedText}>{removedMessage}</Text>
            </View>
          ) : null}

          {/* Review mode badge */}
          <View style={styles.reviewModeBadge}>
            <Ionicons name="refresh-circle" size={16} color={colors.error} />
            <Text style={styles.reviewModeText}>Review Mode — Practice until you get it right</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagRow}>
            <View style={styles.domainTag}>
              <Text style={styles.domainTagText}>{currentQuestion.domain}</Text>
            </View>
            <View style={[styles.diffTag, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.diffTagText, { color: colors.error }]}>
                {currentQuestion.difficulty}
              </Text>
            </View>
          </View>

          {/* Passage */}
          {currentQuestion.passage && (
            <View style={styles.passageCard}>
              <View style={styles.passageHeader}>
                <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                <Text style={styles.passageLabel}>Passage</Text>
              </View>
              <Text style={styles.passageText}>{currentQuestion.passage}</Text>
            </View>
          )}

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>Question</Text>
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

          {/* Explanation */}
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
                  {selectedChoice === currentQuestion.correctAnswer
                    ? 'Correct! Removed from review.'
                    : 'Incorrect — try again next time'}
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

          {/* Actions */}
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
                      ? [colors.brandMid, colors.primary]
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
              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.85}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={[colors.brandMid, colors.primary]}
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitBtnText}>
                    {missedQuestions.length <= 1 ? 'Finish Review 🏁' : 'Next Question →'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {submitted && missedQuestions.length > 1 && (
            <TouchableOpacity onPress={handleEndSession} style={styles.endBtn}>
              <Text style={styles.endBtnText}>End Review Session</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  scoreText: { fontSize: fonts.sm, fontWeight: '700', color: colors.primary },

  progressTrack: { height: 4, backgroundColor: colors.errorLight },
  progressFill: { height: 4, backgroundColor: colors.error },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  removedBanner: {
    backgroundColor: colors.successLight,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: 'center',
  },
  removedText: { color: '#065F46', fontWeight: '700', fontSize: fonts.sm },

  reviewModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  reviewModeText: { fontSize: fonts.xs, color: colors.error, fontWeight: '600' },

  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  domainTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  domainTagText: { fontSize: fonts.xs, color: colors.primary, fontWeight: '600' },
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
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  passageText: { fontSize: fonts.sm, color: colors.textMid, lineHeight: 22 },

  questionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  questionLabel: {
    fontSize: fonts.xs,
    fontWeight: '700',
    color: colors.primary,
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
  choiceDefault: { backgroundColor: colors.white, borderColor: colors.border },
  choiceSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  choiceCorrect: { backgroundColor: colors.successLight, borderColor: colors.success },
  choiceIncorrect: { backgroundColor: colors.errorLight, borderColor: colors.error },
  choiceLabel: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelDefault: { backgroundColor: colors.offWhite },
  labelSelected: { backgroundColor: colors.primary },
  labelCorrect: { backgroundColor: colors.success },
  labelIncorrect: { backgroundColor: colors.error },
  choiceLabelText: { fontSize: fonts.sm, fontWeight: '800', color: colors.white },
  choiceMainText: { flex: 1, fontSize: fonts.base, lineHeight: 22 },
  choiceText: { color: colors.textDark },
  choiceTextSelected: { color: colors.primary, fontWeight: '600' },
  choiceTextCorrect: { color: '#065F46', fontWeight: '600' },
  choiceTextIncorrect: { color: '#991B1B', fontWeight: '600' },

  explanationCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  explanationCorrect: { backgroundColor: colors.successLight, borderColor: colors.success },
  explanationIncorrect: { backgroundColor: colors.errorLight, borderColor: colors.error },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: { fontSize: fonts.base, fontWeight: '700', flex: 1 },
  explanationText: { fontSize: fonts.sm, color: colors.textMid, lineHeight: 22 },

  actionRow: { marginBottom: 8 },
  submitBtn: {
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { color: colors.yellow, fontSize: fonts.lg, fontWeight: '700' },
  submitBtnTextDisabled: { color: colors.textLight },

  endBtn: { alignItems: 'center', paddingVertical: 8 },
  endBtnText: { color: colors.textMuted, fontSize: fonts.sm, fontWeight: '600' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyEmoji: { fontSize: 72, marginBottom: 20 },
  emptyTitle: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: fonts.base,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: colors.yellow, fontWeight: '800', fontSize: fonts.base },

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
  },
  sessionStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    width: '100%',
    marginBottom: 24,
  },
  sessionStatItem: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  sessionStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sessionStatValue: { fontSize: fonts['2xl'], fontWeight: '800', color: colors.white },
  sessionStatLabel: {
    fontSize: fonts.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginTop: 4,
  },
  doneBtn: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  doneBtnText: { color: colors.primaryDark, fontSize: fonts.lg, fontWeight: '800' },
  reviewAgainBtn: { marginTop: 16, paddingVertical: 12 },
  reviewAgainText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: fonts.base,
    fontWeight: '600',
  },
});
