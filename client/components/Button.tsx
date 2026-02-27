import React from "react";
import { View, Text, Pressable, StyleSheet } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export function Button({ title, onPress, variant = "primary", disabled }: ButtonProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, variant === "primary" ? { backgroundColor: theme.link } : { backgroundColor: theme.backgroundSecondary, borderWidth: 1, borderColor: theme.separator }]}
    >
      <Text style={[styles.text, { color: variant === "primary" ? theme.buttonText : theme.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: Spacing.buttonHeight, borderRadius: BorderRadius.full, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl },
  text: { fontSize: 16, fontWeight: "600" },
});
