import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../../utils/theme';

export default function ProgressBar({
  progress = 0,        // 0 to 1
  height = 10,
  fillColor = colors.primary,
  trackColor = colors.primaryLight,
  borderRadius,
  animated = true,
  showPercentage = false,
  label,
  style,
}) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [progress, animated, animatedWidth]);

  const br = borderRadius !== undefined ? borderRadius : radius.full;
  const percentage = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <View style={[style]}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.labelText}>{label}</Text>}
          {showPercentage && <Text style={styles.percentText}>{percentage}%</Text>}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: trackColor,
            borderRadius: br,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: fillColor,
              borderRadius: br,
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden' },
  fill: {},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  percentText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
});
