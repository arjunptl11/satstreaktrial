import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { lightColors, fonts, spacing, radius } from '../utils/theme';

const colors = lightColors;

export default function LoginScreen({ navigation }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, enterDemoMode } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email.trim(), password, displayName.trim())
      : await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } else if (isSignUp) {
      navigation.navigate('Onboarding');
    }
  };

  return (
    <LinearGradient
      colors={['#0d0070', '#1a00be', '#3d22e8']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>
                SATstreak
              </Text>
              <Text style={styles.byLine}>
                by{' '}
                <Text style={styles.arjunBold}>Arjun</Text>
                <Text style={styles.tutorsText}>Tutors</Text>
              </Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isSignUp
                  ? 'Start your SAT prep journey today'
                  : 'Continue building your streak'}
              </Text>

              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Display Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={colors.textLight}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Min 6 characters"
                    placeholderTextColor={colors.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#3d22e8', '#1a00be']}
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.yellow} />
                  ) : (
                    <Text style={styles.submitText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.toggleBtn}
                hitSlop={{ top: 8, bottom: 8 }}
              >
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.toggleLink}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo mode */}
            <TouchableOpacity onPress={enterDemoMode} style={styles.demoBtn} hitSlop={{ top: 12, bottom: 12 }}>
              <Text style={styles.demoText}>Try Demo Mode →</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              No account needed for demo mode
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: spacing.md,
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoText: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.yellow,
    letterSpacing: -0.5,
  },
  byLine: {
    fontSize: fonts.base,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  arjunBold: {
    fontWeight: '800',
    color: colors.yellow,
  },
  tutorsText: {
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTitle: {
    fontSize: fonts['2xl'],
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: fonts.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  inputGroup: { marginBottom: spacing.md },
  label: {
    fontSize: fonts.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fonts.base,
    color: colors.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fonts.base,
    color: colors.text,
  },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  eyeText: {
    fontSize: fonts.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  submitBtn: {
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: {
    color: colors.yellow,
    fontSize: fonts.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  toggleBtn: { marginTop: spacing.md, alignItems: 'center' },
  toggleText: { color: colors.textMuted, fontSize: fonts.sm },
  toggleLink: { color: colors.brand, fontWeight: '700' },
  demoBtn: { alignItems: 'center', marginTop: 24 },
  demoText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fonts.base,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.45)',
    fontSize: fonts.xs,
    marginTop: 8,
  },
});
