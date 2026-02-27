import React from "react";
import { Text } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";

interface TimeLabelProps { style?: any; children: React.ReactNode }

export function TimeLabel({ style, children }: TimeLabelProps) {
  const { theme } = useTheme();
  return (
    <Text style={[{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: theme.textSecondary }, style]}>
      {children}
    </Text>
  );
}
