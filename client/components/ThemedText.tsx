import React from "react";
import { Text } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";

interface ThemedTextProps {
  style?: any;
  children?: React.ReactNode;
  numberOfLines?: number;
  [key: string]: any;
}

export function ThemedText({ style, children, ...rest }: ThemedTextProps) {
  const { theme } = useTheme();
  return (
    <Text style={[{ color: theme.text }, style]} {...rest}>
      {children}
    </Text>
  );
}
