import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts, radius, spacing } from '../../utils/theme';

export default function ChoiceButton({ letter, text, state = 'default', onPress, disabled }) {
  const { colors } = useTheme();

  const getStyles = () => {
    switch (state) {
      case 'selected':
        return {
          border: colors.primary,
          bg: colors.primaryXLight,
          letterBg: colors.primary,
          letterColor: '#ffffff',
          textColor: colors.primaryText,
        };
      case 'correct':
        return {
          border: colors.success,
          bg: colors.successLight,
          letterBg: colors.success,
          letterColor: '#ffffff',
          textColor: colors.successText,
        };
      case 'incorrect':
        return {
          border: colors.error,
          bg: colors.errorLight,
          letterBg: colors.error,
          letterColor: '#ffffff',
          textColor: colors.errorText,
        };
      case 'dimmed':
        return {
          border: colors.border,
          bg: colors.card,
          letterBg: colors.border,
          letterColor: colors.textLight,
          textColor: colors.textLight,
        };
      default:
        return {
          border: colors.border,
          bg: colors.card,
          letterBg: colors.cardAlt,
          letterColor: colors.text,
          textColor: colors.text,
        };
    }
  };

  const s = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, { borderColor: s.border, backgroundColor: s.bg }]}
    >
      <View style={[styles.letter, { backgroundColor: s.letterBg }]}>
        <Text style={[styles.letterText, { color: s.letterColor }]}>{letter}</Text>
      </View>
      <Text style={[styles.text, { color: s.textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    flexShrink: 0,
    marginTop: 1,
  },
  letterText: {
    fontSize: fonts.sm,
    fontWeight: '800',
  },
  text: {
    flex: 1,
    fontSize: fonts.base,
    lineHeight: 24,
  },
});
