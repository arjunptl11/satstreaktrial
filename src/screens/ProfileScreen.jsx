import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, spacing, radius } from '../utils/theme';
import { ACHIEVEMENTS } from '../utils/constants';

const GOAL_MIN = 20;
const GOAL_MAX = 300;
const GOAL_STEP = 20;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { stats, unlockedAchievements } = useUserStats();
  const { colors, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(50);

  const displayName =
    user?.display_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Demo User';
  const email = user?.email || 'demo@satstreak.app';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const accuracy =
    stats.total_questions > 0
      ? Math.round((stats.total_correct / stats.total_questions) * 100)
      : 0;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const goalLabel =
    selectedGoal <= 40 ? 'Casual' :
    selectedGoal <= 80 ? 'Regular' :
    selectedGoal <= 140 ? 'Focused' :
    selectedGoal <= 220 ? 'Intensive' : 'Elite';

  const questionsPerDay = Math.round(selectedGoal / 10);
  const goalFraction = (selectedGoal - GOAL_MIN) / (GOAL_MAX - GOAL_MIN);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.headerBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User avatar + info */}
        <LinearGradient
          colors={[colors.brand, colors.primary]}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.avatar, { backgroundColor: colors.yellow }]}>
            <Text style={[styles.avatarText, { color: colors.brand }]}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: colors.yellow }]}>{stats.streak}</Text>
              <Text style={styles.profileStatLabel}>Streak</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: colors.yellow }]}>{stats.xp}</Text>
              <Text style={styles.profileStatLabel}>Total XP</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: colors.yellow }]}>{accuracy}%</Text>
              <Text style={styles.profileStatLabel}>Accuracy</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Daily Goal */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="trophy-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Goal</Text>
          </View>

          <View style={styles.goalDisplay}>
            <Text style={[styles.goalBigValue, { color: colors.primary }]}>{selectedGoal}</Text>
            <View>
              <Text style={[styles.goalXpLabel, { color: colors.textMuted }]}>XP / day</Text>
              <Text style={[styles.goalLevelLabel, { color: colors.primary }]}>{goalLabel} · ~{questionsPerDay} questions</Text>
            </View>
          </View>

          <View style={styles.sliderRow}>
            <TouchableOpacity
              onPress={() => setSelectedGoal(g => Math.max(GOAL_MIN, g - GOAL_STEP))}
              style={[styles.sliderBtn, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.sliderBtnText, { color: colors.primary }]}>−</Text>
            </TouchableOpacity>

            <View style={[styles.sliderTrack, { backgroundColor: colors.primaryXLight }]}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${Math.max(goalFraction * 100, 4)}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>

            <TouchableOpacity
              onPress={() => setSelectedGoal(g => Math.min(GOAL_MAX, g + GOAL_STEP))}
              style={[styles.sliderBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.sliderBtnText, { color: '#ffffff' }]}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sliderEndLabels}>
            <Text style={[styles.sliderEndText, { color: colors.textLight }]}>{GOAL_MIN} XP</Text>
            <Text style={[styles.sliderEndText, { color: colors.textLight }]}>{GOAL_MAX} XP</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Notifications */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: 14, marginBottom: 14 }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: colors.primaryXLight }]}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Reminders</Text>
                <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                  Get reminded to practice daily
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notificationsEnabled ? colors.yellow : colors.white}
              ios_backgroundColor={colors.border}
            />
          </View>

          {/* Dark Mode */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: colors.accentXLight }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                  {isDark ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={isDark ? colors.yellow : colors.white}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="medal" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Achievements</Text>
            <View style={[styles.achievementCountBadge, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
              <Text style={[styles.achievementCountText, { color: colors.primary }]}>
                {unlockedAchievements.length}/{ACHIEVEMENTS.length}
              </Text>
            </View>
          </View>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map(achievement => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementItem,
                    isUnlocked
                      ? { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }
                      : { backgroundColor: colors.cardAlt, borderColor: colors.border, opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.achievementEmoji}>
                    {isUnlocked ? achievement.emoji : '🔒'}
                  </Text>
                  <Text
                    style={[
                      styles.achievementName,
                      { color: isUnlocked ? colors.primaryText : colors.textMuted },
                    ]}
                    numberOfLines={2}
                  >
                    {achievement.name}
                  </Text>
                  <Text
                    style={[styles.achievementReq, { color: colors.textMuted }]}
                    numberOfLines={2}
                  >
                    {achievement.requirement}
                  </Text>
                  {isUnlocked && achievement.xp > 0 && (
                    <Text style={[styles.achievementXp, { color: colors.primary }]}>+{achievement.xp} XP</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* App info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>About</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Version</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
          </View>
          <Text style={[styles.arjunLine, { color: colors.textMuted }]}>An ArjunTutors product.</Text>
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={handleSignOut} activeOpacity={0.8}>
          <View style={[styles.signOutBtn, { backgroundColor: colors.card, borderColor: colors.errorLight }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
  scroll: { flex: 1 },
  content: { padding: spacing.md },

  profileCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
  },
  displayName: {
    fontSize: fonts.xl,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: fonts.sm,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileStatValue: {
    fontSize: fonts.xl,
    fontWeight: '800',
  },
  profileStatLabel: {
    fontSize: fonts.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: { fontSize: fonts.lg, fontWeight: '700', flex: 1 },
  cardSub: { fontSize: fonts.sm, marginBottom: 14, marginTop: -8 },

  goalDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  goalBigValue: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
  },
  goalXpLabel: { fontSize: fonts.sm, fontWeight: '600' },
  goalLevelLabel: { fontSize: fonts.xs, fontWeight: '700', marginTop: 2 },

  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  sliderBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  sliderBtnText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  sliderTrack: {
    flex: 1,
    height: 10,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  sliderEndLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderEndText: { fontSize: fonts.xs },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: { fontSize: fonts.base, fontWeight: '600' },
  settingSub: { fontSize: fonts.xs, marginTop: 2 },

  achievementCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  achievementCountText: {
    fontSize: fonts.xs,
    fontWeight: '700',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementItem: {
    width: '47%',
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  achievementEmoji: { fontSize: 28, marginBottom: 6 },
  achievementName: {
    fontSize: fonts.sm,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementReq: {
    fontSize: fonts.xs,
    textAlign: 'center',
    lineHeight: 14,
  },
  achievementXp: {
    fontSize: fonts.xs,
    fontWeight: '700',
    marginTop: 4,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: fonts.sm },
  infoValue: { fontSize: fonts.sm, fontWeight: '600' },
  arjunLine: {
    fontSize: fonts.sm,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },

  signOutBtn: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  signOutText: {
    fontSize: fonts.base,
    fontWeight: '700',
  },
});
