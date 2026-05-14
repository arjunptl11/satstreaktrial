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
import { colors, fonts, spacing, radius } from '../utils/theme';
import { ACHIEVEMENTS, DAILY_GOALS } from '../utils/constants';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { stats, unlockedAchievements } = useUserStats(user?.id);
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

  const goalLabels = { 20: 'Casual', 50: 'Regular', 100: 'Intensive' };
  const goalDescriptions = {
    20: '~2 questions/day',
    50: '~5 questions/day',
    100: '~10 questions/day',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User avatar + info */}
        <LinearGradient
          colors={[colors.navyDark, colors.navyPrimary]}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{stats.streak}</Text>
              <Text style={styles.profileStatLabel}>Streak</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{stats.xp}</Text>
              <Text style={styles.profileStatLabel}>Total XP</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{accuracy}%</Text>
              <Text style={styles.profileStatLabel}>Accuracy</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Daily Goal */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="trophy-outline" size={18} color={colors.navyPrimary} />
            <Text style={styles.cardTitle}>Daily Goal</Text>
          </View>
          <Text style={styles.cardSub}>Choose your daily XP target</Text>
          <View style={styles.goalOptions}>
            {DAILY_GOALS.map(goal => (
              <TouchableOpacity
                key={goal}
                onPress={() => setSelectedGoal(goal)}
                style={[styles.goalOption, selectedGoal === goal && styles.goalOptionActive]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.goalValue,
                    selectedGoal === goal && styles.goalValueActive,
                  ]}
                >
                  {goal}
                </Text>
                <Text
                  style={[
                    styles.goalUnit,
                    selectedGoal === goal && styles.goalUnitActive,
                  ]}
                >
                  XP
                </Text>
                <Text
                  style={[
                    styles.goalLabel,
                    selectedGoal === goal && styles.goalLabelActive,
                  ]}
                >
                  {goalLabels[goal]}
                </Text>
                <Text
                  style={[
                    styles.goalDesc,
                    selectedGoal === goal && styles.goalDescActive,
                  ]}
                >
                  {goalDescriptions[goal]}
                </Text>
                {selectedGoal === goal && (
                  <View style={styles.goalCheck}>
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="notifications" size={20} color={colors.navyPrimary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Daily Reminders</Text>
                <Text style={styles.settingSub}>
                  Get reminded to practice daily
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.navyPrimary }}
              thumbColor={notificationsEnabled ? colors.yellow : colors.white}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="medal" size={18} color={colors.navyPrimary} />
            <Text style={styles.cardTitle}>Achievements</Text>
            <View style={styles.achievementCountBadge}>
              <Text style={styles.achievementCountText}>
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
                    isUnlocked ? styles.achievementUnlocked : styles.achievementLocked,
                  ]}
                >
                  <Text
                    style={[styles.achievementEmoji, !isUnlocked && styles.achievementEmojiLocked]}
                  >
                    {isUnlocked ? achievement.emoji : '🔒'}
                  </Text>
                  <Text
                    style={[
                      styles.achievementName,
                      !isUnlocked && styles.achievementNameLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {isUnlocked ? achievement.name : '???'}
                  </Text>
                  <Text
                    style={[
                      styles.achievementReq,
                      !isUnlocked && styles.achievementReqLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {achievement.requirement}
                  </Text>
                  {isUnlocked && achievement.xp > 0 && (
                    <Text style={styles.achievementXp}>+{achievement.xp} XP</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* App info */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.navyPrimary} />
            <Text style={styles.cardTitle}>About</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Questions Source</Text>
            <Text style={styles.infoValue}>PineSAT API</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={handleSignOut} activeOpacity={0.8}>
          <View style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
  scroll: { flex: 1 },
  content: { padding: spacing.md },

  profileCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.navyDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
    color: colors.navyDark,
  },
  displayName: {
    fontSize: fonts.xl,
    fontWeight: '800',
    color: colors.white,
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
    color: colors.yellow,
  },
  profileStatLabel: {
    fontSize: fonts.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: { fontSize: fonts.lg, fontWeight: '700', color: colors.textDark, flex: 1 },
  cardSub: { fontSize: fonts.sm, color: colors.textMuted, marginBottom: 14, marginTop: -8 },

  goalOptions: { flexDirection: 'row', gap: 10 },
  goalOption: {
    flex: 1,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    position: 'relative',
  },
  goalOptionActive: {
    borderColor: colors.navyPrimary,
    backgroundColor: colors.navyXLight,
  },
  goalValue: {
    fontSize: fonts['2xl'],
    fontWeight: '900',
    color: colors.textDark,
  },
  goalValueActive: { color: colors.navyPrimary },
  goalUnit: {
    fontSize: fonts.xs,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: -2,
  },
  goalUnitActive: { color: colors.navyPrimary },
  goalLabel: {
    fontSize: fonts.sm,
    fontWeight: '700',
    color: colors.textMid,
    marginTop: 4,
  },
  goalLabelActive: { color: colors.navyPrimary },
  goalDesc: { fontSize: fonts.xs, color: colors.textLight, marginTop: 2, textAlign: 'center' },
  goalDescActive: { color: colors.navyLight },
  goalCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.navyPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },

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
    backgroundColor: colors.navyXLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: { fontSize: fonts.base, fontWeight: '600', color: colors.textDark },
  settingSub: { fontSize: fonts.xs, color: colors.textMuted, marginTop: 2 },

  achievementCountBadge: {
    backgroundColor: colors.navyXLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.navyBorder,
  },
  achievementCountText: {
    fontSize: fonts.xs,
    color: colors.navyPrimary,
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
  achievementUnlocked: {
    backgroundColor: colors.navyXLight,
    borderColor: colors.navyBorder,
  },
  achievementLocked: {
    backgroundColor: colors.offWhite,
    borderColor: colors.borderLight,
  },
  achievementEmoji: { fontSize: 28, marginBottom: 6 },
  achievementEmojiLocked: { opacity: 0.4 },
  achievementName: {
    fontSize: fonts.sm,
    fontWeight: '700',
    color: colors.navyPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementNameLocked: { color: colors.textLight },
  achievementReq: {
    fontSize: fonts.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
  achievementReqLocked: { color: colors.borderLight + 'FF' },
  achievementXp: {
    fontSize: fonts.xs,
    color: colors.navyPrimary,
    fontWeight: '700',
    marginTop: 4,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontSize: fonts.sm, color: colors.textMuted },
  infoValue: { fontSize: fonts.sm, color: colors.textDark, fontWeight: '600' },

  signOutBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.errorLight,
    marginBottom: 8,
  },
  signOutText: {
    color: colors.error,
    fontSize: fonts.base,
    fontWeight: '700',
  },
});
