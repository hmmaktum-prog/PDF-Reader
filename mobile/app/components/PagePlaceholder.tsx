import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface PagePlaceholderProps {
  pageNumber: number;
  selected?: boolean;
  onPress?: () => void;
  selectable?: boolean;
}

export default function PagePlaceholder({
  pageNumber,
  selected = false,
  onPress,
  selectable = false,
}: PagePlaceholderProps) {
  const { isDark } = useAppTheme();

  const bg = selected
    ? '#007AFF22'
    : isDark ? '#2a2a2a' : '#e8e8e8';
  const borderColor = selected ? '#007AFF' : isDark ? '#444' : '#cccccc';
  const textColor = selected ? '#007AFF' : isDark ? '#ffffff' : '#333333';
  const iconColor = isDark ? '#666' : '#bbb';

  const inner = (
    <View style={[styles.container, { backgroundColor: bg, borderColor }]}>
      {selected && <Text style={styles.checkmark}>✓</Text>}
      <Text style={styles.icon}>📄</Text>
      <Text style={[styles.text, { color: textColor }]}>P{pageNumber}</Text>
      {selectable && !selected && (
        <View style={[styles.selectCircle, { borderColor: iconColor }]} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} testID={`page-thumb-${pageNumber}`}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 110,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { fontSize: 26, marginBottom: 4 },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  selectCircle: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
});
