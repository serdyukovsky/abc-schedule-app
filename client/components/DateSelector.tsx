import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
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
  const { theme, isDark } = useTheme();

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

  const content = (
    <View style={styles.innerContainer}>
      {dates.map((dateOption, index) => {
        const isSelected = isSameDay(dateOption.date, selectedDate);
        return (
          <Pressable
            key={index}
            onPress={() => handleSelect(dateOption.date)}
            style={[
              styles.dateButton,
              isSelected && [
                styles.selectedDateButton,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.18)"
                    : "rgba(255, 255, 255, 0.85)",
                },
              ],
            ]}
            testID={`date-selector-${index}`}
          >
            <ThemedText
              style={[
                styles.dayNumber,
                {
                  color: isSelected
                    ? theme.text
                    : isDark
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.7)",
                },
              ]}
            >
              {dateOption.date.getDate()}
            </ThemedText>
            <ThemedText
              style={[
                styles.dayLabel,
                {
                  color: isSelected
                    ? theme.textSecondary
                    : isDark
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)",
                },
              ]}
            >
              {dateOption.shortLabel}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <View style={styles.outerContainer}>
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.blurContainer,
            {
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.08)",
            },
          ]}
        >
          {content}
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.blurContainer,
          styles.androidContainer,
          {
            backgroundColor: isDark
              ? "rgba(45, 45, 48, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.06)",
          },
        ]}
      >
        {content}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  blurContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  androidContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  dateButton: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 14,
    minWidth: 56,
  },
  selectedDateButton: {
    borderRadius: 14,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
