import React from "react";
import { View } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface CardProps { children: React.ReactNode; style?: any }

export function Card({ children, style }: CardProps) {
  const { theme } = useTheme();
  return (
    <View style={[{ backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.lg, padding: Spacing.lg }, style]}>
      {children}
    </View>
  );
}
