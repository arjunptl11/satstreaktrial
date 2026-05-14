import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '../utils/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🏆',
    title: 'Build Your Streak',
    subtitle: 'Practice daily to keep your streak alive and earn bonus XP. Consistency is the key to SAT success.',
    bg: [colors.primaryDark, colors.primary],
    accent: colors.yellow,
  },
  {
    id: '2',
    emoji: '🎯',
    title: 'Track Progress',
    subtitle: 'See your accuracy improve across all SAT domains over time. Know your strengths and target your weaknesses.',
    bg: [colors.primary, colors.brandMid],
    accent: colors.yellowLight,
  },
  {
    id: '3',
    emoji: '⚡',
    title: 'Earn XP & Level Up',
    subtitle: 'Gain experience points for every question and unlock achievements. Make SAT prep feel like a game.',
    bg: [colors.brandMid, '#5B3FFF'],
    accent: colors.yellow,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (nextIndex) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      animateTransition(currentIndex + 1);
    } else {
      navigation.replace('MainTabs');
    }
  };

  const skip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <LinearGradient colors={SLIDES[currentIndex].bg} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Animated.View style={[styles.slide, { width, opacity: fadeAnim }]}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.title, { color: item.accent }]}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </Animated.View>
          )}
        />

        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => animateTransition(i)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
            <View style={[styles.nextBtn, { backgroundColor: SLIDES[currentIndex].accent }]}>
              <Text style={styles.nextText}>
                {currentIndex === SLIDES.length - 1 ? 'Get Started 🚀' : 'Next →'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Step indicator */}
        <Text style={styles.stepIndicator}>
          {currentIndex + 1} of {SLIDES.length}
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: fonts['3xl'],
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fonts.lg,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: colors.yellow,
    width: 26,
    borderRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 4 },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fonts.base,
    fontWeight: '600',
  },
  nextBtn: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextText: {
    color: colors.primaryDark,
    fontSize: fonts.base,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  stepIndicator: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: fonts.xs,
    paddingBottom: 20,
  },
});
