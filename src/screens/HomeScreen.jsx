import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, spacing, radius } from '../utils/theme';
import { LEVELS, DOMAINS, DIFFICULTIES } from '../utils/constants';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { stats, missedQuestions } = useUserStats(user?.id);
  const { colors } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');

  const difficultyConfig = {
    Easy: { color: colors.easy, bg: colors.easyBg, icon: 'leaf-outline', label: 'Easier questions to build confidence' },
    Medium: { color: colors.accent, bg: colors.accentLight, icon: 'flame-outline', label: 'Balanced challenge for steady growth' },
    Hard: { color: colors.error, bg: colors.errorLight, icon: 'skull-outline', label: 'Tough questions for advanced prep' },
  };

  const displayName =
    user?.display_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'there';
  const firstName = displayName.split(' ')[0];

  const accuracy =
    stats.total_questions > 0
      ? Math.round((stats.total_correct / stats.total_questions) * 100)
      : 0;

  const dailyGoal = 50;
  const dailyXP = (stats.questions_today || 0) * 10;
  const goalProgress = Math.min(dailyXP / dailyGoal, 1);

  const xpToNext = LEVELS.xpForNextLevel(stats.xp);
  const levelProgress = 1 - xpToNext / 100;

  const startPractice = (isDailyDrill = false) => {
    navigation.navigate('Practice', {
      difficulty: isDailyDrill ? null : selectedDifficulty,
      domain:
        isDailyDrill ? null : selectedDomain === 'All Domains' ? null : selectedDomain,
      isDailyDrill,
      count: 10,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {getGreeting()}, {firstName}!
            </Text>
            <Text style={[styles.subGreeting, { color: colors.textMuted }]}>Ready to practice today?</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={[styles.avatarBtn, { backgroundColor: colors.brand }]}
          >
            <Text style={[styles.avatarText, { color: colors.yellow }]}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Streak Card */}
        <LinearGradient
          colors={[colors.streak, colors.accent]}
          style={styles.streakCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.streakLeft}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakCount}>{stats.streak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.streakRight}>
            <View style={styles.xpBadge}>
              <Text style={styles.xpValue}>⚡ {stats.xp} XP</Text>
            </View>
            <Text style={styles.levelText}>Level {stats.level}</Text>
            <Text style={styles.streakMessage}>
              {stats.streak >= 7
                ? 'On fire!'
                : stats.streak > 0
                ? 'Keep it going!'
                : 'Start your streak!'}
            </Text>
          </View>
        </LinearGradient>

        {/* Daily Goal */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="trophy-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Goal</Text>
            </View>
            <Text style={[styles.goalXpText, { color: colors.primary }]}>
              {dailyXP} / {dailyGoal} XP
            </Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.primaryXLight }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(goalProgress * 100, goalProgress > 0 ? 4 : 0)}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          {goalProgress >= 1 ? (
            <Text style={[styles.goalComplete, { color: colors.primary }]}>
              Daily goal complete! Keep going for bonus XP!
            </Text>
          ) : (
            <Text style={[styles.goalRemaining, { color: colors.textMuted }]}>
              {dailyGoal - dailyXP} XP remaining to reach your goal
            </Text>
          )}
        </View>

        {/* Daily Drill */}
        {!stats.dailyDrillDone && (
          <LinearGradient
            colors={[colors.primaryXLight, colors.accentXLight]}
            style={[styles.drillCard, { borderWidth: 1.5, borderColor: colors.primaryLight }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.drillLeft}>
              <View style={[styles.drillIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="flash" size={24} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.drillTitle, { color: colors.text }]}>Daily Drill</Text>
                <Text style={[styles.drillSub, { color: colors.primary }]}>+5 bonus XP · 10 questions</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.drillBtn, { backgroundColor: colors.primary }]}
              onPress={() => startPractice(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.drillBtnText, { color: colors.white }]}>Start</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {stats.dailyDrillDone && (
          <View style={[styles.drillDoneCard, { backgroundColor: colors.successLight, borderColor: colors.primary }]}>
            <View style={styles.drillDoneLeft}>
              <View style={[styles.drillDoneIcon, { backgroundColor: colors.primaryXLight }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.drillDoneTitle, { color: colors.successText }]}>Daily Drill Complete!</Text>
                <Text style={[styles.drillDoneSub, { color: colors.primary }]}>Come back tomorrow for more</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={[styles.statsGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statItem, { borderRightWidth: 1.5, borderRightColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{accuracy}%</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Accuracy</Text>
          </View>
          <View style={[styles.statItem, { borderRightWidth: 1.5, borderRightColor: colors.border }]}>
            <Ionicons name="help-circle" size={22} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total_questions}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Questions</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={22} color={colors.brand} />
            <Text style={[styles.statValue, { color: colors.text }]}>Lv.{stats.level}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Level</Text>
          </View>
        </View>

        {/* Review Mistakes */}
        {missedQuestions.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Review')}
            activeOpacity={0.85}
          >
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.errorLight }]}>
              <View style={styles.reviewLeft}>
                <View style={[styles.reviewIconWrap, { backgroundColor: colors.errorLight }]}>
                  <Ionicons name="refresh-circle" size={28} color={colors.error} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.reviewTitle, { color: colors.text }]}>Review Mistakes</Text>
                  <Text style={[styles.reviewSub, { color: colors.textMuted }]}>
                    {missedQuestions.length} question{missedQuestions.length !== 1 ? 's' : ''} to review
                  </Text>
                </View>
              </View>
              <View style={[styles.reviewBadge, { backgroundColor: colors.error }]}>
                <Text style={[styles.reviewBadgeText, { color: colors.white }]}>{missedQuestions.length}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Practice Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="book-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Start Practice</Text>
          </View>

          {/* Domain Selector */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Subject Domain</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.domainScroll}
            contentContainerStyle={styles.domainContent}
          >
            {DOMAINS.map(domain => (
              <TouchableOpacity
                key={domain}
                onPress={() => setSelectedDomain(domain)}
                style={[
                  styles.domainChip,
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                  selectedDomain === domain && { backgroundColor: colors.primaryXLight, borderColor: colors.primary },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.domainChipText,
                    { color: colors.textMuted },
                    selectedDomain === domain && { color: colors.primary },
                  ]}
                  numberOfLines={1}
                >
                  {domain === 'All Domains' ? '✦ ' + domain : domain}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Difficulty Selector */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Difficulty</Text>
          {DIFFICULTIES.map(diff => {
            const cfg = difficultyConfig[diff];
            const isSelected = selectedDifficulty === diff;
            return (
              <TouchableOpacity
                key={diff}
                onPress={() => setSelectedDifficulty(diff)}
                style={[
                  styles.diffBtn,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  isSelected && {
                    borderColor: cfg.color,
                    backgroundColor: cfg.bg,
                  },
                ]}
                activeOpacity={0.75}
              >
                <View style={styles.diffLeft}>
                  <View style={[styles.diffDot, { backgroundColor: cfg.color }]} />
                  <View>
                    <Text
                      style={[
                        styles.diffText,
                        { color: colors.textSecondary },
                        isSelected && { color: cfg.color, fontWeight: '700' },
                      ]}
                    >
                      {diff}
                    </Text>
                    {isSelected && (
                      <Text style={[styles.diffDesc, { color: cfg.color }]}>
                        {cfg.label}
                      </Text>
                    )}
                  </View>
                </View>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={20} color={cfg.color} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => startPractice(false)}
            activeOpacity={0.85}
            style={{ marginTop: 12 }}
          >
            <LinearGradient
              colors={[colors.primary, colors.accentDark]}
              style={styles.startBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name="flash"
                size={20}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.startBtnText, { color: colors.white }]}>Start Practice</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subGreeting: { fontSize: fonts.sm, marginTop: 2 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: { fontSize: fonts.lg, fontWeight: '800' },

  streakCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center' },
  streakEmoji: { fontSize: 50, marginRight: 14 },
  streakCount: { fontSize: 42, fontWeight: '900', color: '#ffffff', lineHeight: 46 },
  streakLabel: { fontSize: fonts.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  streakRight: { alignItems: 'flex-end' },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpValue: { color: '#ffffff', fontWeight: '700', fontSize: fonts.base },
  levelText: { color: 'rgba(255,255,255,0.7)', fontSize: fonts.xs, fontWeight: '600', marginBottom: 2 },
  streakMessage: { color: 'rgba(255,255,255,0.75)', fontSize: fonts.xs },

  card: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: fonts.lg, fontWeight: '700' },
  goalXpText: { fontSize: fonts.sm, fontWeight: '700' },
  progressBg: {
    height: 10,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  goalComplete: {
    marginTop: 8,
    fontSize: fonts.sm,
    fontWeight: '600',
  },
  goalRemaining: {
    marginTop: 8,
    fontSize: fonts.xs,
  },

  drillCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  drillLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  drillIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drillTitle: { fontSize: fonts.lg, fontWeight: '700' },
  drillSub: { fontSize: fonts.xs, fontWeight: '600', marginTop: 2 },
  drillBtn: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: radius.full,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  drillBtnText: { fontWeight: '800', fontSize: fonts.base },

  drillDoneCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
  },
  drillDoneLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  drillDoneIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drillDoneTitle: { fontSize: fonts.base, fontWeight: '700' },
  drillDoneSub: { fontSize: fonts.xs, marginTop: 2 },

  statsGrid: {
    borderRadius: radius.md,
    flexDirection: 'row',
    borderWidth: 1.5,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, paddingVertical: 18, alignItems: 'center' },
  statValue: {
    fontSize: fonts.xl,
    fontWeight: '800',
    marginTop: 5,
  },
  statLabel: { fontSize: fonts.xs, fontWeight: '600', marginTop: 2 },

  reviewCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  reviewIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewTitle: { fontSize: fonts.base, fontWeight: '700' },
  reviewSub: { fontSize: fonts.xs, marginTop: 2 },
  reviewBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewBadgeText: { fontSize: fonts.sm, fontWeight: '800' },

  sectionLabel: {
    fontSize: fonts.xs,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  domainScroll: { marginHorizontal: -spacing.md },
  domainContent: { paddingHorizontal: spacing.md, paddingBottom: 4, gap: 8 },
  domainChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  domainChipText: { fontSize: fonts.sm, fontWeight: '600' },

  diffBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: 8,
  },
  diffLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  diffDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  diffText: { fontSize: fonts.base, fontWeight: '600' },
  diffDesc: { fontSize: fonts.xs, marginTop: 2, fontWeight: '500' },

  startBtn: {
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  startBtnText: { fontSize: fonts.lg, fontWeight: '800' },
});
