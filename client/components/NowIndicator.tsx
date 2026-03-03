import React from "react";
import { View, Text, StyleSheet } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface NowIndicatorProps {
  now?: Date;
  compact?: boolean;
}

export function NowIndicator({ now = new Date(), compact = false }: NowIndicatorProps) {
  const { theme } = useTheme();
  const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={[styles.dot, { backgroundColor: theme.nowIndicator }]} />
      <View style={[styles.line, { backgroundColor: theme.nowIndicator }]} />
      <Text style={[styles.time, { color: theme.nowIndicator }]}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: 4 },
  compactContainer: { paddingVertical: 0 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  line: { flex: 1, height: 1, marginHorizontal: Spacing.sm },
  time: { fontSize: 12, fontWeight: "600" },
});
