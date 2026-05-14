import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, spacing, radius } from '../utils/theme';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
    .replace(/—/g, ' - ').replace(/–/g, ' - ')
    .replace(/\s+/g, ' ').trim();
};

export default function ReviewScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { missedQuestions, removeMissedQuestion, recordAnswer } = useUserStats(user?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [removedMessage, setRemovedMessage] = useState('');
  const [reviewedCorrect, setReviewedCorrect] = useState(0);
  const [reviewedTotal, setReviewedTotal] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

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
      setRemovedMessage('Removed from review list!');
      setTimeout(() => setRemovedMessage(''), 3000);
    }
    await recordAnswer({ questionId: currentQuestion.id, domain: currentQuestion.domain, difficulty: currentQuestion.difficulty, isCorrect, isDailyDrill: false });
  };

  const handleNext = () => {
    if (missedQuestions.length === 0 || currentIndex >= missedQuestions.length) { setSessionDone(true); return; }
    animateTransition(() => { setCurrentIndex(0); setSelectedChoice(null); setSubmitted(false); setRemovedMessage(''); setShowExplanation(false); });
  };

  const getChoiceState = (label) => {
    if (!submitted) return selectedChoice === label ? 'selected' : 'default';
    if (label === currentQuestion.correctAnswer) return 'correct';
    if (label === selectedChoice) return 'incorrect';
    return 'default';
  };

  const choiceColors = {
    default: { border: colors.border, bg: colors.card, labelBg: colors.cardAlt, labelText: colors.text, text: colors.text },
    selected: { border: colors.primary, bg: colors.primaryLight, labelBg: colors.primary, labelText: '#fff', text: colors.primaryText },
    correct: { border: colors.success, bg: colors.successLight, labelBg: colors.success, labelText: '#fff', text: colors.successText },
    incorrect: { border: colors.error, bg: colors.errorLight, labelBg: colors.error, labelText: '#fff', text: colors.errorText },
  };

  if (missedQuestions.length === 0 && !sessionDone) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardAlt }]}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Review Mistakes</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>No questions to review. Keep practicing!</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.emptyBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.emptyBtnText, { color: colors.yellow }]}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (sessionDone) {
    const accuracy = reviewedTotal > 0 ? Math.round((reviewedCorrect / reviewedTotal) * 100) : 0;
    const remaining = missedQuestions.length;
    return (
      <LinearGradient colors={[colors.primaryDark, colors.primary]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.sessionDoneContent}>
            <Text style={styles.sessionDoneEmoji}>{reviewedCorrect === reviewedTotal && reviewedTotal > 0 ? '🏆' : '💪'}</Text>
            <Text style={[styles.sessionDoneTitle, { color: colors.yellow }]}>Review Complete!</Text>
            <Text style={styles.sessionDoneSub}>{remaining === 0 ? 'You cleared your review list!' : `${remaining} question${remaining !== 1 ? 's' : ''} still in review`}</Text>
            <View style={styles.sessionStats}>
              {[{ val: `${reviewedCorrect}/${reviewedTotal}`, label: 'Correct' }, { val: `${accuracy}%`, label: 'Accuracy' }, { val: remaining, label: 'Remaining' }].map((s, i) => (
                <View key={i} style={[styles.sessionStatItem, i === 1 && styles.sessionStatBorder]}>
                  <Text style={[styles.sessionStatValue, { color: colors.yellow }]}>{s.val}</Text>
                  <Text style={styles.sessionStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={[styles.doneBtn, { backgroundColor: colors.yellow }]}>
              <Text style={[styles.doneBtnText, { color: colors.primaryDark }]}>Back to Home</Text>
            </TouchableOpacity>
            {remaining > 0 && (
              <TouchableOpacity onPress={() => { setCurrentIndex(0); setSelectedChoice(null); setSubmitted(false); setReviewedCorrect(0); setReviewedTotal(0); setSessionDone(false); }} style={styles.reviewAgainBtn}>
                <Text style={styles.reviewAgainText}>Keep Reviewing</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardAlt }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Review Mistakes</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>{missedQuestions.length} remaining</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <Text style={[styles.scoreText, { color: colors.primary }]}>{reviewedCorrect}/{reviewedTotal}</Text>
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.errorLight }]}>
        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / missedQuestions.length) * 100}%`, backgroundColor: colors.error }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {removedMessage ? (
            <View style={[styles.removedBanner, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.removedText, { color: colors.successText }]}>{removedMessage}</Text>
            </View>
          ) : null}

          <View style={[styles.reviewModeBadge, { backgroundColor: colors.errorLight, borderColor: colors.errorLight }]}>
            <Ionicons name="refresh-circle" size={16} color={colors.error} />
            <Text style={[styles.reviewModeText, { color: colors.error }]}>Review Mode</Text>
          </View>

          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{currentQuestion.domain}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.tagText, { color: colors.error }]}>{currentQuestion.difficulty}</Text>
            </View>
          </View>

          {currentQuestion.passage && currentQuestion.passage !== 'null' && currentQuestion.passage.trim().length > 0 && (
            <View style={[styles.passageCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <View style={styles.passageHeader}>
                <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                <Text style={[styles.passageLabel, { color: colors.primary }]}>Passage</Text>
              </View>
              <Text style={[styles.passageText, { color: colors.textSecondary }]}>{sanitizeText(currentQuestion.passage)}</Text>
            </View>
          )}

          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionLabel, { color: colors.primary }]}>Question</Text>
            <Text style={[styles.questionText, { color: colors.text }]}>{sanitizeText(currentQuestion.prompt)}</Text>
          </View>

          <View style={styles.choicesContainer}>
            {CHOICE_LABELS.map(label => {
              const choiceText = currentQuestion.choices[label];
              if (!choiceText) return null;
              const state = getChoiceState(label);
              const c = choiceColors[state];
              return (
                <TouchableOpacity key={label} onPress={() => !submitted && setSelectedChoice(label)}
                  style={[styles.choiceBtn, { backgroundColor: c.bg, borderColor: c.border }]}
                  activeOpacity={submitted ? 1 : 0.75} disabled={submitted}>
                  <View style={[styles.choiceLabel, { backgroundColor: c.labelBg }]}>
                    <Text style={[styles.choiceLabelText, { color: c.labelText }]}>{label}</Text>
                  </View>
                  <Text style={[styles.choiceMainText, { color: c.text }]}>{sanitizeText(choiceText)}</Text>
                  {submitted && label === currentQuestion.correctAnswer && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                  {submitted && label === selectedChoice && label !== currentQuestion.correctAnswer && <Ionicons name="close-circle" size={20} color={colors.error} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {submitted && (
            <>
              <TouchableOpacity onPress={() => setShowExplanation(v => !v)}
                style={[styles.explainToggle, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
                <Ionicons name="bulb-outline" size={18} color={colors.primary} />
                <Text style={[styles.explainToggleText, { color: colors.primary }]}>
                  {showExplanation ? 'Hide Explanation' : 'See Explanation'}
                </Text>
                <Ionicons name={showExplanation ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
              </TouchableOpacity>
              {showExplanation && (
                <View style={[styles.explanationCard, {
                  backgroundColor: selectedChoice === currentQuestion.correctAnswer ? colors.successLight : colors.errorLight,
                  borderColor: selectedChoice === currentQuestion.correctAnswer ? colors.success : colors.error,
                }]}>
                  <Text style={[styles.explanationText, { color: selectedChoice === currentQuestion.correctAnswer ? colors.successText : colors.errorText }]}>
                    {sanitizeText(currentQuestion.explanation) || `The correct answer is ${currentQuestion.correctAnswer}.`}
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.actionRow}>
            {!submitted ? (
              <TouchableOpacity onPress={handleSubmit} disabled={!selectedChoice} activeOpacity={0.85} style={{ flex: 1 }}>
                <LinearGradient colors={selectedChoice ? [colors.brandMid, colors.primary] : [colors.border, colors.border]}
                  style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={[styles.submitBtnText, { color: selectedChoice ? colors.yellow : colors.textLight }]}>Submit Answer</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={{ flex: 1 }}>
                <LinearGradient colors={[colors.brandMid, colors.primary]} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={[styles.submitBtnText, { color: colors.yellow }]}>
                    {missedQuestions.length <= 1 ? 'Finish Review' : 'Next Question →'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {submitted && missedQuestions.length > 1 && (
            <TouchableOpacity onPress={() => setSessionDone(true)} style={styles.endBtn}>
              <Text style={[styles.endBtnText, { color: colors.textMuted }]}>End Review Session</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: fonts.base, fontWeight: '700' },
  headerSub: { fontSize: fonts.xs },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1.5 },
  scoreText: { fontSize: fonts.sm, fontWeight: '700' },
  progressTrack: { height: 4 },
  progressFill: { height: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  removedBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.sm, padding: 12, marginBottom: 12, borderWidth: 1 },
  removedText: { fontWeight: '700', fontSize: fonts.sm },
  reviewModeBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 12, gap: 6, borderWidth: 1 },
  reviewModeText: { fontSize: fonts.xs, fontWeight: '600' },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1 },
  tagText: { fontSize: fonts.xs, fontWeight: '600' },
  passageCard: { borderRadius: radius.md, padding: spacing.md, marginBottom: 14, borderWidth: 1.5 },
  passageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  passageLabel: { fontSize: fonts.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  passageText: { fontSize: fonts.sm, lineHeight: 22 },
  questionCard: { borderRadius: radius.md, padding: spacing.md, marginBottom: 14, borderWidth: 1.5 },
  questionLabel: { fontSize: fonts.xs, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  questionText: { fontSize: fonts.base, lineHeight: 26, fontWeight: '500' },
  choicesContainer: { gap: 10, marginBottom: 16 },
  choiceBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, padding: 14, borderWidth: 2, gap: 12 },
  choiceLabel: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  choiceLabelText: { fontSize: fonts.sm, fontWeight: '800' },
  choiceMainText: { flex: 1, fontSize: fonts.base, lineHeight: 22 },
  explainToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.sm, paddingVertical: 12, marginBottom: 10, borderWidth: 1.5 },
  explainToggleText: { fontSize: fonts.sm, fontWeight: '700' },
  explanationCard: { borderRadius: radius.md, padding: spacing.md, marginBottom: 16, borderWidth: 1.5 },
  explanationText: { fontSize: fonts.sm, lineHeight: 22 },
  actionRow: { marginBottom: 8 },
  submitBtn: { borderRadius: radius.sm, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: fonts.lg, fontWeight: '700' },
  endBtn: { alignItems: 'center', paddingVertical: 8 },
  endBtnText: { fontSize: fonts.sm, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyEmoji: { fontSize: 72, marginBottom: 20 },
  emptyTitle: { fontSize: fonts['2xl'], fontWeight: '800', marginBottom: 8 },
  emptySub: { fontSize: fonts.base, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  emptyBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: radius.full },
  emptyBtnText: { fontWeight: '800', fontSize: fonts.base },
  sessionDoneContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  sessionDoneEmoji: { fontSize: 80, marginBottom: 20 },
  sessionDoneTitle: { fontSize: fonts['3xl'], fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  sessionDoneSub: { fontSize: fonts.base, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 32 },
  sessionStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', overflow: 'hidden', width: '100%', marginBottom: 24 },
  sessionStatItem: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  sessionStatBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  sessionStatValue: { fontSize: fonts['2xl'], fontWeight: '800' },
  sessionStatLabel: { fontSize: fonts.xs, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 4 },
  doneBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: radius.full, alignItems: 'center' },
  doneBtnText: { fontSize: fonts.lg, fontWeight: '800' },
  reviewAgainBtn: { marginTop: 16, paddingVertical: 12 },
  reviewAgainText: { color: 'rgba(255,255,255,0.65)', fontSize: fonts.base, fontWeight: '600' },
});
