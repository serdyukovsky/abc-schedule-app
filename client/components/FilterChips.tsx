import React from "react";
import { ScrollView, StyleSheet, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  const { theme } = useTheme();

  const handleSelect = (option: string) => {
    Haptics.selectionAsync();
    onSelect(option);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => handleSelect(option)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? theme.text : theme.backgroundSecondary,
              },
            ]}
            testID={`filter-chip-${option}`}
          >
            <ThemedText
              style={[
                styles.chipText,
                {
                  color: isSelected ? theme.backgroundRoot : theme.text,
                },
              ]}
            >
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
