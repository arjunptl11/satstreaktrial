import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../../utils/theme';

export default function ChoiceButton({
  label,       // 'A' | 'B' | 'C' | 'D'
  text,        // choice text
  state,       // 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled'
  onPress,
  disabled = false,
}) {
  const getContainerStyle = () => {
    switch (state) {
      case 'selected':
        return styles.containerSelected;
      case 'correct':
        return styles.containerCorrect;
      case 'incorrect':
        return styles.containerIncorrect;
      default:
        return styles.containerDefault;
    }
  };

  const getLabelStyle = () => {
    switch (state) {
      case 'selected':
        return styles.labelSelected;
      case 'correct':
        return styles.labelCorrect;
      case 'incorrect':
        return styles.labelIncorrect;
      default:
        return styles.labelDefault;
    }
  };

  const getTextStyle = () => {
    switch (state) {
      case 'selected':
        return styles.textSelected;
      case 'correct':
        return styles.textCorrect;
      case 'incorrect':
        return styles.textIncorrect;
      default:
        return styles.textDefault;
    }
  };

  const getLabelTextStyle = () => {
    switch (state) {
      case 'selected':
      case 'correct':
      case 'incorrect':
        return styles.labelTextLight;
      default:
        return styles.labelTextDark;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || state === 'correct' || state === 'incorrect'}
      activeOpacity={0.75}
      style={[styles.container, getContainerStyle()]}
    >
      <View style={[styles.label, getLabelStyle()]}>
        <Text style={[styles.labelTextBase, getLabelTextStyle()]}>{label}</Text>
      </View>
      <Text style={[styles.textBase, getTextStyle()]} numberOfLines={4}>
        {text}
      </Text>
      {state === 'correct' && (
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      )}
      {state === 'incorrect' && (
        <Ionicons name="close-circle" size={20} color={colors.error} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 2,
    gap: 12,
    marginBottom: 10,
  },
  containerDefault: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  containerSelected: {
    backgroundColor: colors.navyXLight,
    borderColor: colors.navyPrimary,
  },
  containerCorrect: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  containerIncorrect: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  label: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  labelDefault: { backgroundColor: colors.offWhite },
  labelSelected: { backgroundColor: colors.navyPrimary },
  labelCorrect: { backgroundColor: colors.success },
  labelIncorrect: { backgroundColor: colors.error },
  labelTextBase: { fontSize: fonts.sm, fontWeight: '800' },
  labelTextLight: { color: colors.white },
  labelTextDark: { color: colors.textMid },
  textBase: { flex: 1, fontSize: fonts.base, lineHeight: 22 },
  textDefault: { color: colors.textDark },
  textSelected: { color: colors.navyPrimary, fontWeight: '600' },
  textCorrect: { color: '#065F46', fontWeight: '600' },
  textIncorrect: { color: '#991B1B', fontWeight: '600' },
});
