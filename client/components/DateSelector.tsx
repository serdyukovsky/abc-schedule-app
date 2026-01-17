import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface DateOption {
  date: Date;
  label: string;
  shortLabel: string;
}

interface DateSelectorProps {
  dates: DateOption[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function DateSelector({ dates, selectedDate, onSelect }: DateSelectorProps) {
  const { theme } = useTheme();

  const handleSelect = (date: Date) => {
    Haptics.selectionAsync();
    onSelect(date);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, borderTopColor: theme.separator }]}>
      <View style={styles.innerContainer}>
        {dates.map((dateOption, index) => {
          const isSelected = isSameDay(dateOption.date, selectedDate);
          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(dateOption.date)}
              style={[
                styles.dateButton,
                {
                  backgroundColor: isSelected ? theme.text : "transparent",
                },
              ]}
              testID={`date-selector-${index}`}
            >
              <ThemedText
                style={[
                  styles.dayNumber,
                  {
                    color: isSelected ? theme.backgroundRoot : theme.text,
                  },
                ]}
              >
                {dateOption.date.getDate()}
              </ThemedText>
              <ThemedText
                style={[
                  styles.dayLabel,
                  {
                    color: isSelected ? theme.backgroundRoot : theme.textSecondary,
                  },
                ]}
              >
                {dateOption.shortLabel}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  dateButton: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    minWidth: 60,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
});
