import React from "react";
import { View } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";

interface ThemedViewProps {
  style?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export function ThemedView({ style, children, ...rest }: ThemedViewProps) {
  const { theme } = useTheme();
  return (
    <View style={[{ backgroundColor: theme.backgroundRoot }, style]} {...rest}>
      {children}
    </View>
  );
}
