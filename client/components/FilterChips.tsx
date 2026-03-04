import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  const { theme } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            className={`filter-chip interactive-press${isSelected ? " filter-chip--active" : ""}`}
            style={[styles.chip, { backgroundColor: isSelected ? theme.link : theme.backgroundSecondary }]}
          >
            <Text style={[styles.chipText, { color: isSelected ? theme.buttonText : theme.textSecondary }]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm, flexDirection: "row" },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  chipText: { fontSize: 13, fontWeight: "500" },
});
