import React from "react";
import { Text } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";

interface HeaderTitleProps { title: string }

export function HeaderTitle({ title }: HeaderTitleProps) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 17, fontWeight: "600", color: theme.text }}>{title}</Text>;
}
