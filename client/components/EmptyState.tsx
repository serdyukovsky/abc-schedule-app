import React from "react";
import { View, Text, StyleSheet } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface EmptyStateProps { title: string; message: string }

export function EmptyState({ title, message }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing["3xl"] },
  title: { fontSize: 17, fontWeight: "600", textAlign: "center", marginBottom: Spacing.sm },
  message: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});
