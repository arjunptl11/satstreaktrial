import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../../utils/theme';

export default function QuestionCard({ question, questionNumber, totalQuestions }) {
  if (!question) return null;

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return colors.easy;
    if (diff === 'Hard') return colors.error;
    return colors.medium;
  };

  const diffColor = getDifficultyColor(question.difficulty);

  return (
    <View style={styles.container}>
      {/* Tags */}
      <View style={styles.tagRow}>
        <View style={styles.domainTag}>
          <Text style={styles.domainTagText} numberOfLines={1}>
            {question.domain}
          </Text>
        </View>
        <View style={[styles.diffTag, { backgroundColor: diffColor + '22' }]}>
          <Text style={[styles.diffTagText, { color: diffColor }]}>
            {question.difficulty}
          </Text>
        </View>
        {totalQuestions && (
          <View style={styles.counterTag}>
            <Text style={styles.counterTagText}>
              {questionNumber}/{totalQuestions}
            </Text>
          </View>
        )}
      </View>

      {/* Passage */}
      {question.passage ? (
        <View style={styles.passageCard}>
          <View style={styles.passageHeaderRow}>
            <Ionicons name="document-text-outline" size={15} color={colors.primary} />
            <Text style={styles.passageHeaderText}>Passage</Text>
          </View>
          <Text style={styles.passageText}>{question.passage}</Text>
        </View>
      ) : null}

      {/* Question */}
      <View style={styles.questionCard}>
        <Text style={styles.questionNumber}>
          Question {questionNumber}
        </Text>
        <Text style={styles.questionText}>{question.prompt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  domainTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '60%',
  },
  domainTagText: {
    fontSize: fonts.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  diffTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  diffTagText: { fontSize: fonts.xs, fontWeight: '700' },
  counterTag: {
    backgroundColor: colors.offWhite,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  counterTagText: { fontSize: fonts.xs, color: colors.textMuted, fontWeight: '600' },
  passageCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  passageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  passageHeaderText: {
    fontSize: fonts.xs,
    fontWeight: '700',
    color: colors.primary,
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
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  questionNumber: {
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
});
