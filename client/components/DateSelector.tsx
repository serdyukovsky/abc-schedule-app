import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface DateOption { date: Date; label: string; shortLabel: string }
interface DateSelectorProps {
  dates: DateOption[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onSearchPress: () => void;
  isSearchActive?: boolean;
}

const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const formatMonth = (d: Date) => d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "");

export function DateSelector({ dates, selectedDate, onSelect, onSearchPress, isSearchActive = false }: DateSelectorProps) {
  const { theme, isDark } = useTheme();

  const bgContainer = isDark ? "rgba(45,45,48,0.92)" : "rgba(245,245,245,0.92)";
  const borderContainer = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.datesContainer, { backgroundColor: bgContainer, borderColor: borderContainer }]}>
        <View style={styles.datesRow}>
          {dates.map((opt, i) => {
            const isSelected = isSameDay(opt.date, selectedDate);
            return (
              <Pressable
                key={i}
                onPress={() => onSelect(opt.date)}
                style={[styles.dateButton, isSelected && { backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)" }]}
                testID={`date-selector-${i}`}
              >
                <Text style={[styles.dayNumber, { color: isSelected ? theme.text : isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }]}>
                  {opt.date.getDate()}
                </Text>
                <Text style={[styles.dayLabel, { color: isSelected ? theme.textSecondary : isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }]}>
                  {formatMonth(opt.date)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={onSearchPress}
        style={[styles.searchContainer, { backgroundColor: bgContainer, borderColor: borderContainer }, isSearchActive && { backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)" }]}
        testID="search-button"
      >
        <Feather name="search" size={20} color={isSearchActive ? theme.link : isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, flexDirection: "row", alignItems: "stretch", justifyContent: "center", gap: Spacing.sm },
  datesContainer: { flex: 1, borderRadius: 20, borderWidth: 1, overflow: "hidden", minHeight: 56, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" },
  searchContainer: { width: 56, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", minHeight: 56, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" },
  datesRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", flex: 1 },
  dateButton: { alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 16 },
  dayNumber: { fontSize: 18, fontWeight: "600", lineHeight: 22 },
  dayLabel: { fontSize: 11, fontWeight: "500", marginTop: 2, textTransform: "lowercase" },
});
