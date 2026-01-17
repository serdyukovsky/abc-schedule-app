import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface TimeLabelProps {
  time: string;
}

export function TimeLabel({ time }: TimeLabelProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ThemedText style={[styles.text, { color: theme.textSecondary }]}>
        {time}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
