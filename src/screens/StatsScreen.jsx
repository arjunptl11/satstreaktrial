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
import { colors, fonts, spacing, radius } from '../utils/theme';
import { LEVELS } from '../utils/constants';

function BarChart({ data }) {
  const maxXp = Math.max(...data.map(d => d.xp), 1);
  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((item, index) => {
          const barHeight = Math.max((item.xp / maxXp) * 100, item.xp > 0 ? 4 : 2);
          return (
            <View key={index} style={chartStyles.barWrapper}>
              <View style={chartStyles.barBg}>
                <View
                  style={[
                    chartStyles.barFill,
                    { height: `${barHeight}%` },
                    item.xp > 0 && chartStyles.barActive,
                  ]}
                />
              </View>
              <Text style={chartStyles.barLabel}>{item.day}</Text>
              {item.xp > 0 && (
                <Text style={chartStyles.barXp}>{item.xp}</Text>
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
    backgroundColor: colors.navyXLight,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: 6,
  },
  barActive: { backgroundColor: colors.navyPrimary },
  barLabel: {
    fontSize: fonts.xs,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  barXp: {
    fontSize: 9,
    color: colors.navyPrimary,
    fontWeight: '700',
    marginTop: 1,
  },
});

export default function StatsScreen() {
  const { user } = useAuth();
  const { stats, domainStats, weeklyData } = useUserStats(user?.id);

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>My Progress</Text>
        <Text style={styles.screenSub}>Track your SAT prep journey</Text>
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
            colors={[colors.navyDark, colors.navyPrimary]}
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
            colors={[colors.yellow, colors.yellowDark]}
            style={styles.summaryCardRight}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.summaryEmoji}>⚡</Text>
            <Text style={[styles.summaryValue, { color: colors.navyDark }]}>{stats.xp}</Text>
            <Text style={[styles.summaryLabel, { color: colors.navyDark }]}>Total XP</Text>
            <Text style={[styles.summaryExtra, { color: colors.navyPrimary }]}>
              Level {stats.level}
            </Text>
          </LinearGradient>
        </View>

        {/* Level Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="trophy" size={18} color={colors.navyPrimary} />
              <Text style={styles.cardTitle}>Level {stats.level}</Text>
            </View>
            <Text style={styles.cardRight}>{xpToNext} XP to next level</Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${Math.max(levelProgress * 100, 2)}%` }]}
            />
          </View>
          <View style={styles.levelFooter}>
            <Text style={styles.levelFooterText}>Level {stats.level}</Text>
            <Text style={styles.levelFooterText}>Level {stats.level + 1}</Text>
          </View>
        </View>

        {/* Accuracy & Questions */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxBorder]}>
            <View style={styles.statBoxIcon}>
              <Ionicons name="checkmark-circle" size={24} color={colors.navyPrimary} />
            </View>
            <Text style={styles.statBoxValue}>{accuracy}%</Text>
            <Text style={styles.statBoxLabel}>Accuracy</Text>
            <Text style={styles.statBoxSub}>
              {stats.total_correct}/{stats.total_questions} correct
            </Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statBoxIcon}>
              <Ionicons name="help-circle" size={24} color={colors.yellow} />
            </View>
            <Text style={styles.statBoxValue}>{stats.total_questions}</Text>
            <Text style={styles.statBoxLabel}>Questions</Text>
            <Text style={styles.statBoxSub}>Total attempted</Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="calendar" size={18} color={colors.navyPrimary} />
              <Text style={styles.cardTitle}>This Week</Text>
            </View>
            <Text style={styles.cardRight}>{totalWeeklyXp} XP · {activeDays} days</Text>
          </View>
          <BarChart data={weeklyData} />
        </View>

        {/* Domain Performance */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="bar-chart" size={18} color={colors.navyPrimary} />
            <Text style={styles.cardTitle}>Domain Performance</Text>
          </View>
          {domainStats.map((domain, index) => {
            const pct =
              domain.total_questions > 0
                ? Math.round((domain.total_correct / domain.total_questions) * 100)
                : 0;
            const barColor =
              pct >= 80 ? colors.success : pct >= 60 ? colors.medium : colors.error;
            return (
              <View key={index} style={styles.domainRow}>
                <View style={styles.domainInfo}>
                  <Text style={styles.domainName} numberOfLines={1}>
                    {domain.domain}
                  </Text>
                  <Text style={styles.domainSub}>
                    {domain.total_correct}/{domain.total_questions} correct
                  </Text>
                </View>
                <View style={styles.domainBarContainer}>
                  <View style={styles.domainBarBg}>
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
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="medal" size={18} color={colors.navyPrimary} />
            <Text style={styles.cardTitle}>Personal Records</Text>
          </View>
          <View style={styles.recordsGrid}>
            <View style={styles.recordItem}>
              <Text style={styles.recordEmoji}>🔥</Text>
              <Text style={styles.recordValue}>{stats.best_streak || stats.streak}</Text>
              <Text style={styles.recordLabel}>Best Streak</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={styles.recordEmoji}>📚</Text>
              <Text style={styles.recordValue}>{stats.total_questions}</Text>
              <Text style={styles.recordLabel}>Questions Done</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={styles.recordEmoji}>🎯</Text>
              <Text style={styles.recordValue}>{accuracy}%</Text>
              <Text style={styles.recordLabel}>Accuracy</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={styles.recordEmoji}>⚡</Text>
              <Text style={styles.recordValue}>{stats.xp}</Text>
              <Text style={styles.recordLabel}>Total XP</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerBar: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  screenTitle: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
    color: colors.textDark,
  },
  screenSub: { fontSize: fonts.sm, color: colors.textMuted, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: spacing.md },

  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCardLeft: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.navyDark,
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
    shadowColor: colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryEmoji: { fontSize: 32, marginBottom: 4 },
  summaryValue: { fontSize: fonts['3xl'], fontWeight: '900', color: colors.yellow },
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
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
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
    color: colors.textDark,
  },
  cardRight: { fontSize: fonts.xs, color: colors.navyPrimary, fontWeight: '600' },

  progressBg: {
    height: 12,
    backgroundColor: colors.navyXLight,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.navyPrimary,
    borderRadius: radius.full,
  },
  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  levelFooterText: { fontSize: fonts.xs, color: colors.textMuted, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statBoxBorder: {},
  statBoxIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.navyXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statBoxValue: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
    color: colors.textDark,
  },
  statBoxLabel: {
    fontSize: fonts.sm,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  statBoxSub: { fontSize: fonts.xs, color: colors.textLight, marginTop: 2 },

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
    color: colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  domainSub: { fontSize: fonts.xs, color: colors.textMuted },
  domainBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  domainBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.navyXLight,
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
    backgroundColor: colors.navyXLight,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.navyBorder,
  },
  recordEmoji: { fontSize: 28, marginBottom: 6 },
  recordValue: {
    fontSize: fonts.xl,
    fontWeight: '800',
    color: colors.navyPrimary,
  },
  recordLabel: {
    fontSize: fonts.xs,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});
