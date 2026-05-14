import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts, spacing, radius } from '../../utils/theme';

const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/—/g, ' - ')
    .replace(/–/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function QuestionCard({ question, questionNumber, totalQuestions }) {
  const { colors } = useTheme();

  if (!question) return null;

  const getDifficultyStyle = (diff) => {
    if (diff === 'Easy') return { color: colors.easy, bg: colors.easyBg };
    if (diff === 'Hard') return { color: colors.error, bg: colors.errorLight };
    return { color: colors.medium, bg: colors.mediumBg };
  };

  const diff = getDifficultyStyle(question.difficulty);
  const hasPassage = question.passage && question.passage !== 'null' && question.passage.trim().length > 0;

  return (
    <View>
      {/* Tags */}
      <View style={styles.tagRow}>
        <View style={[styles.domainTag, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <Text style={[styles.domainTagText, { color: colors.primary }]} numberOfLines={1}>
            {question.domain}
          </Text>
        </View>
        <View style={[styles.diffTag, { backgroundColor: diff.bg }]}>
          <Text style={[styles.diffTagText, { color: diff.color }]}>{question.difficulty}</Text>
        </View>
        {totalQuestions && (
          <View style={[styles.counterTag, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <Text style={[styles.counterTagText, { color: colors.textMuted }]}>
              {questionNumber}/{totalQuestions}
            </Text>
          </View>
        )}
      </View>

      {/* Passage */}
      {hasPassage && (
        <View style={[styles.passageCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <View style={styles.passageHeaderRow}>
            <Ionicons name="document-text-outline" size={15} color={colors.primary} />
            <Text style={[styles.passageHeaderText, { color: colors.primary }]}>Passage</Text>
          </View>
          <Text style={[styles.passageText, { color: colors.textSecondary }]}>
            {sanitizeText(question.passage)}
          </Text>
        </View>
      )}

      {/* Question */}
      <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
        <Text style={[styles.questionNumber, { color: colors.primary }]}>
          Question {questionNumber}
        </Text>
        <Text style={[styles.questionText, { color: colors.text }]}>
          {sanitizeText(question.prompt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  domainTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, maxWidth: '60%' },
  domainTagText: { fontSize: fonts.xs, fontWeight: '600' },
  diffTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  diffTagText: { fontSize: fonts.xs, fontWeight: '700' },
  counterTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1 },
  counterTagText: { fontSize: fonts.xs, fontWeight: '600' },
  passageCard: { borderRadius: radius.md, padding: spacing.md, marginBottom: 12, borderWidth: 1.5 },
  passageHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  passageHeaderText: { fontSize: fonts.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  passageText: { fontSize: fonts.sm, lineHeight: 22 },
  questionCard: { borderRadius: radius.md, padding: spacing.md, borderWidth: 1.5, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  questionNumber: { fontSize: fonts.xs, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  questionText: { fontSize: fonts.base, lineHeight: 26, fontWeight: '500' },
});
