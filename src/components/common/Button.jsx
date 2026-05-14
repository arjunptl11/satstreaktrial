import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts, radius } from '../../utils/theme';

export default function Button({
  onPress, title, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = true, style, textStyle,
}) {
  const { colors } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: fonts.sm },
    md: { paddingVertical: 14, paddingHorizontal: 22, fontSize: fonts.base },
    lg: { paddingVertical: 17, paddingHorizontal: 28, fontSize: fonts.lg },
  };
  const sz = sizeStyles[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.85}
        style={[fullWidth && { width: '100%' }, style]}>
        <LinearGradient
          colors={isDisabled ? [colors.border, colors.border] : [colors.brandMid, colors.primary]}
          style={[styles.btn, { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal, shadowColor: colors.primaryDark }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading
            ? <ActivityIndicator color={colors.yellow} size="small" />
            : <Text style={[styles.btnText, { color: colors.yellow, fontSize: sz.fontSize }, textStyle]}>{title}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'accent') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.85}
        style={[fullWidth && { width: '100%' }, style]}>
        <LinearGradient
          colors={isDisabled ? [colors.border, colors.border] : [colors.yellow, colors.yellowDark]}
          style={[styles.btn, { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading
            ? <ActivityIndicator color={colors.primaryDark} size="small" />
            : <Text style={[styles.btnText, { color: colors.primaryDark, fontSize: sz.fontSize }, textStyle]}>{title}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.75}
        style={[
          styles.outlineBtn,
          { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal, borderColor: isDisabled ? colors.border : colors.primary },
          fullWidth && { width: '100%' }, style,
        ]}>
        {loading
          ? <ActivityIndicator color={colors.primary} size="small" />
          : <Text style={[styles.btnText, { color: colors.primary, fontSize: sz.fontSize }, textStyle]}>{title}</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.65}
      style={[{ paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal, alignItems: 'center' }, fullWidth && { width: '100%' }, style]}>
      {loading
        ? <ActivityIndicator color={colors.textMuted} size="small" />
        : <Text style={[styles.btnText, { color: colors.textMuted, fontSize: sz.fontSize }, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: { fontWeight: '700', letterSpacing: 0.2 },
  outlineBtn: {
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
