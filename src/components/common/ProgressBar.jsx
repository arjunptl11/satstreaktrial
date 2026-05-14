import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radius } from '../../utils/theme';

export default function ProgressBar({
  progress = 0,
  height = 10,
  fillColor,
  trackColor,
  borderRadius,
  animated = true,
  showPercentage = false,
  label,
  style,
}) {
  const { colors } = useTheme();
  const resolvedFill = fillColor || colors.primary;
  const resolvedTrack = trackColor || colors.primaryLight;

  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    if (animated) {
      Animated.timing(animatedWidth, { toValue: clamped, duration: 500, useNativeDriver: false }).start();
    } else {
      animatedWidth.setValue(clamped);
    }
  }, [progress, animated, animatedWidth]);

  const br = borderRadius !== undefined ? borderRadius : radius.full;
  const percentage = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <View style={style}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.labelText, { color: colors.textMuted }]}>{label}</Text>}
          {showPercentage && <Text style={[styles.percentText, { color: colors.primary }]}>{percentage}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: resolvedTrack, borderRadius: br }]}>
        <Animated.View
          style={[styles.fill, {
            height,
            backgroundColor: resolvedFill,
            borderRadius: br,
            width: animatedWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden' },
  fill: {},
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  labelText: { fontSize: 13, fontWeight: '600' },
  percentText: { fontSize: 13, fontWeight: '700' },
});
