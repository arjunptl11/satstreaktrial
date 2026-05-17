import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, spacing, radius } from '../utils/theme';
import { LEVELS } from '../utils/constants';

function BarChart({ data, colors }) {
  const maxXp = Math.max(...data.map(d => d.xp), 1);
  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((item, index) => {
          const barHeight = Math.max((item.xp / maxXp) * 100, item.xp > 0 ? 4 : 2);
          return (
            <View key={index} style={chartStyles.barWrapper}>
              <View style={[chartStyles.barBg, { backgroundColor: colors.primaryXLight }]}>
                <View
                  style={[
                    chartStyles.barFill,
                    { height: `${barHeight}%` },
                    item.xp > 0 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border },
                  ]}
                />
              </View>
              <Text style={[chartStyles.barLabel, { color: colors.textMuted }]}>{item.day}</Text>
              {item.xp > 0 && (
                <Text style={[chartStyles.barXp, { color: colors.primary }]}>{item.xp}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { marginTop: 8 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  barBg: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: fonts.xs,
    fontWeight: '600',
    marginTop: 4,
  },
  barXp: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
});

export default function StatsScreen() {
  const { user } = useAuth();
  const { stats, domainStats, weeklyData } = useUserStats();
  const { colors } = useTheme();

  const accuracy =
    stats.total_questions > 0
      ? Math.round((stats.total_correct / stats.total_questions) * 100)
      : 0;

  const xpInLevel = stats.xp % 100;
  const xpToNext = 100 - xpInLevel;
  const levelProgress = xpInLevel / 100;

  const totalWeeklyXp = weeklyData.reduce((sum, d) => sum + d.xp, 0);
  const activeDays = weeklyData.filter(d => d.xp > 0).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.headerBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Progress</Text>
        <Text style={[styles.screenSub, { color: colors.textMuted }]}>Track your SAT prep journey</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak + XP Summary Row */}
        <View style={styles.summaryRow}>
          {/* Streak Card */}
          <LinearGradient
            colors={[colors.streak, colors.accent]}
            style={styles.summaryCardLeft}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.summaryEmoji}>🔥</Text>
            <Text style={styles.summaryValue}>{stats.streak}</Text>
            <Text style={styles.summaryLabel}>Day Streak</Text>
            <Text style={styles.summaryExtra}>Best: {stats.best_streak || 0}</Text>
          </LinearGradient>

          {/* XP Card */}
          <LinearGradient
            colors={[colors.brand, colors.primary]}
            style={styles.summaryCardRight}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.summaryEmoji}>⚡</Text>
            <Text style={[styles.summaryValue, { color: colors.yellow }]}>{stats.xp}</Text>
            <Text style={styles.summaryLabel}>Total XP</Text>
            <Text style={styles.summaryExtra}>Level {stats.level}</Text>
          </LinearGradient>
        </View>

        {/* Level Progress */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="trophy" size={18} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Level {stats.level}</Text>
            </View>
            <Text style={[styles.cardRight, { color: colors.primary }]}>{xpToNext} XP to next level</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.primaryXLight }]}>
            <View
              style={[styles.progressFill, { width: `${Math.max(levelProgress * 100, 2)}%`, backgroundColor: colors.primary }]}
            />
          </View>
          <View style={styles.levelFooter}>
            <Text style={[styles.levelFooterText, { color: colors.textMuted }]}>Level {stats.level}</Text>
            <Text style={[styles.levelFooterText, { color: colors.textMuted }]}>Level {stats.level + 1}</Text>
          </View>
        </View>

        {/* Accuracy & Questions */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statBoxIcon, { backgroundColor: colors.primaryXLight }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statBoxValue, { color: colors.text }]}>{accuracy}%</Text>
            <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Accuracy</Text>
            <Text style={[styles.statBoxSub, { color: colors.textLight }]}>
              {stats.total_correct}/{stats.total_questions} correct
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statBoxIcon, { backgroundColor: colors.accentXLight }]}>
              <Ionicons name="help-circle" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.statBoxValue, { color: colors.text }]}>{stats.total_questions}</Text>
            <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Questions</Text>
            <Text style={[styles.statBoxSub, { color: colors.textLight }]}>Total attempted</Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>This Week</Text>
            </View>
            <Text style={[styles.cardRight, { color: colors.primary }]}>{totalWeeklyXp} XP · {activeDays} days</Text>
          </View>
          <BarChart data={weeklyData} colors={colors} />
        </View>

        {/* Domain Performance */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="bar-chart" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Domain Performance</Text>
          </View>
          {domainStats.map((domain, index) => {
            const pct =
              domain.total_questions > 0
                ? Math.round((domain.total_correct / domain.total_questions) * 100)
                : 0;
            const barColor =
              pct >= 80 ? colors.success : pct >= 60 ? colors.accent : colors.error;
            return (
              <View key={index} style={styles.domainRow}>
                <View style={styles.domainInfo}>
                  <Text style={[styles.domainName, { color: colors.text }]} numberOfLines={1}>
                    {domain.domain}
                  </Text>
                  <Text style={[styles.domainSub, { color: colors.textMuted }]}>
                    {domain.total_correct}/{domain.total_questions} correct
                  </Text>
                </View>
                <View style={styles.domainBarContainer}>
                  <View style={[styles.domainBarBg, { backgroundColor: colors.primaryXLight }]}>
                    <View
                      style={[
                        styles.domainBarFill,
                        { width: `${Math.max(pct, 2)}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                  <Text style={[styles.domainPct, { color: barColor }]}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Personal Records */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="medal" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Records</Text>
          </View>
          <View style={styles.recordsGrid}>
            <View style={[styles.recordItem, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
              <Text style={styles.recordEmoji}>🔥</Text>
              <Text style={[styles.recordValue, { color: colors.primary }]}>{stats.best_streak || stats.streak}</Text>
              <Text style={[styles.recordLabel, { color: colors.textMuted }]}>Best Streak</Text>
            </View>
            <View style={[styles.recordItem, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
              <Text style={styles.recordEmoji}>📚</Text>
              <Text style={[styles.recordValue, { color: colors.primary }]}>{stats.total_questions}</Text>
              <Text style={[styles.recordLabel, { color: colors.textMuted }]}>Questions Done</Text>
            </View>
            <View style={[styles.recordItem, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
              <Text style={styles.recordEmoji}>🎯</Text>
              <Text style={[styles.recordValue, { color: colors.primary }]}>{accuracy}%</Text>
              <Text style={[styles.recordLabel, { color: colors.textMuted }]}>Accuracy</Text>
            </View>
            <View style={[styles.recordItem, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
              <Text style={styles.recordEmoji}>⚡</Text>
              <Text style={[styles.recordValue, { color: colors.primary }]}>{stats.xp}</Text>
              <Text style={[styles.recordLabel, { color: colors.textMuted }]}>Total XP</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: {
    paddingHorizontal: spacing.md,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
  },
  screenTitle: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
  },
  screenSub: { fontSize: fonts.sm, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: spacing.md },

  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCardLeft: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryCardRight: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryEmoji: { fontSize: 32, marginBottom: 4 },
  summaryValue: { fontSize: fonts['3xl'], fontWeight: '900', color: '#ffffff' },
  summaryLabel: {
    fontSize: fonts.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  summaryExtra: {
    fontSize: fonts.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  card: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: fonts.lg,
    fontWeight: '700',
  },
  cardRight: { fontSize: fonts.xs, fontWeight: '600' },

  progressBg: {
    height: 12,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  levelFooterText: { fontSize: fonts.xs, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  statBoxIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statBoxValue: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
  },
  statBoxLabel: {
    fontSize: fonts.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  statBoxSub: { fontSize: fonts.xs, marginTop: 2 },

  domainRow: {
    marginBottom: 14,
  },
  domainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainName: {
    fontSize: fonts.sm,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  domainSub: { fontSize: fonts.xs },
  domainBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  domainBarBg: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  domainBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  domainPct: {
    fontSize: fonts.xs,
    fontWeight: '700',
    width: 32,
    textAlign: 'right',
  },

  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recordItem: {
    width: '46%',
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  recordEmoji: { fontSize: 28, marginBottom: 6 },
  recordValue: {
    fontSize: fonts.xl,
    fontWeight: '800',
  },
  recordLabel: {
    fontSize: fonts.xs,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});
