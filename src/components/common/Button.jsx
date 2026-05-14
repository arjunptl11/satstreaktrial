import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, spacing } from '../../utils/theme';

export default function Button({
  onPress,
  title,
  variant = 'primary', // 'primary' | 'accent' | 'outline' | 'ghost'
  size = 'md',          // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}) {
  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: fonts.sm },
    md: { paddingVertical: 14, paddingHorizontal: 22, fontSize: fonts.base },
    lg: { paddingVertical: 17, paddingHorizontal: 28, fontSize: fonts.lg },
  };

  const sz = sizeStyles[size];

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? [colors.border, colors.border] : [colors.brandMid, colors.primary]}
          style={[styles.btn, { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color={colors.yellow} size="small" />
          ) : (
            <Text style={[styles.primaryText, { fontSize: sz.fontSize }, textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'accent') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? [colors.border, colors.border] : [colors.yellow, colors.yellowDark]}
          style={[styles.btn, { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryDark} size="small" />
          ) : (
            <Text style={[styles.accentText, { fontSize: sz.fontSize }, textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.75}
        style={[
          styles.outlineBtn,
          { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal },
          isDisabled && styles.disabledOutline,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={[styles.outlineText, { fontSize: sz.fontSize }, textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // ghost
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.65}
      style={[
        styles.ghostBtn,
        { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textMuted} size="small" />
      ) : (
        <Text style={[styles.ghostText, { fontSize: sz.fontSize }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  btn: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryText: {
    color: colors.yellow,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  accentText: {
    color: colors.primaryDark,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  outlineBtn: {
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  disabledOutline: { borderColor: colors.border },
  outlineText: {
    color: colors.primary,
    fontWeight: '700',
  },
  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
