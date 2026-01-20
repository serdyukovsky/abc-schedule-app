import React from "react";
import { View, StyleSheet, Pressable, Platform, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
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
  onSearchPress: () => void;
  isSearchActive?: boolean;
}

export function DateSelector({ 
  dates, 
  selectedDate, 
  onSelect, 
  onSearchPress,
  isSearchActive = false,
}: DateSelectorProps) {
  const { theme, isDark } = useTheme();

  const handleSelect = (date: Date) => {
    Haptics.selectionAsync();
    onSelect(date);
  };

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSearchPress();
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "");
  };

  const dateContent = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.datesScrollContent}
    >
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
              {formatMonth(dateOption.date)}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const searchContent = (
    <Pressable
      onPress={handleSearchPress}
      style={[
        styles.searchButton,
        isSearchActive && {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.18)"
            : "rgba(255, 255, 255, 0.85)",
        },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID="search-button"
    >
      <Feather
        name="search"
        size={20}
        color={
          isSearchActive
            ? theme.link
            : isDark
            ? "rgba(255, 255, 255, 0.7)"
            : "rgba(0, 0, 0, 0.7)"
        }
      />
    </Pressable>
  );

  if (Platform.OS === "ios") {
    return (
      <View style={styles.outerContainer}>
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.groupContainer,
            styles.datesGroup,
            {
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.08)",
            },
          ]}
        >
          <View style={styles.datesInner}>{dateContent}</View>
        </BlurView>
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.groupContainer,
            styles.searchGroup,
            {
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.08)",
            },
          ]}
        >
          <View style={styles.searchInner}>{searchContent}</View>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.groupContainer,
          styles.androidContainer,
          styles.datesGroup,
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
        <View style={styles.datesInner}>{dateContent}</View>
      </View>
      <View
        style={[
          styles.groupContainer,
          styles.androidContainer,
          styles.searchGroup,
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
        <View style={styles.searchInner}>{searchContent}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    alignSelf: "center",
    gap: Spacing.sm,
  },
  groupContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    minHeight: 56,
  },
  androidContainer: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  datesGroup: {
  },
  searchGroup: {
    width: 56,
  },
  datesInner: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    flex: 1,
    justifyContent: "center",
  },
  searchInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    flex: 1,
  },
  datesScrollContent: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  dateButton: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 14,
    minWidth: 48,
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
    textTransform: "lowercase",
  },
  searchButton: {
    padding: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
});
