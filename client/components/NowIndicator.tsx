import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export function NowIndicator() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: theme.nowIndicator }]} />
      <View style={[styles.line, { backgroundColor: theme.nowIndicator }]} />
      <ThemedText style={[styles.label, { color: theme.nowIndicator }]}>
        NOW
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    flex: 1,
    height: 1,
    marginHorizontal: Spacing.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
