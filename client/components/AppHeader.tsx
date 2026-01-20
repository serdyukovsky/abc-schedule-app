import React from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing } from "@/constants/theme";

interface AppHeaderProps {
  onProfilePress?: () => void;
}

export function AppHeader({ onProfilePress }: AppHeaderProps) {
  const { theme } = useTheme();
  const { getFullName } = useAuth();

  const fullName = getFullName();

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.logo, { color: theme.text }]}>ABC</ThemedText>
      <Pressable
        onPress={onProfilePress}
        style={styles.nameContainer}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ThemedText
          style={[styles.name, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {fullName}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: Spacing.md,
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
  },
  nameContainer: {
    maxWidth: 150,
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
  },
});
