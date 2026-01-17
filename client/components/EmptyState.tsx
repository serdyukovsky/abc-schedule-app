import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface EmptyStateProps {
  title: string;
  message: string;
  showImage?: boolean;
}

export function EmptyState({ title, message, showImage = true }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {showImage ? (
        <Image
          source={require("../../assets/images/empty-schedule.png")}
          style={styles.image}
          resizeMode="contain"
        />
      ) : null}
      <ThemedText style={[styles.title, { color: theme.text }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing["4xl"],
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
