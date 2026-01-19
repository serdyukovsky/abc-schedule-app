import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SpeakerRowProps {
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function SpeakerRow({ name, size = 22 }: SpeakerRowProps) {
  const { theme } = useTheme();

  if (!name) return null;

  const initials = getInitials(name);
  const fontSize = size * 0.4;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.backgroundSecondary,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.initials,
            {
              fontSize,
              color: theme.textSecondary,
            },
          ]}
        >
          {initials}
        </ThemedText>
      </View>
      <ThemedText
        style={[styles.name, { color: theme.textSecondary }]}
        numberOfLines={1}
      >
        {name}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "600",
  },
  name: {
    fontSize: 13,
    flex: 1,
  },
});
