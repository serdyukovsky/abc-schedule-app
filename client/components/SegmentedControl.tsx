import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onSelect,
}: SegmentedControlProps) {
  const { theme, isDark } = useTheme();

  const handleSelect = (index: number) => {
    if (index !== selectedIndex) {
      Haptics.selectionAsync();
      onSelect(index);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "rgba(120, 120, 128, 0.24)" : "rgba(118, 118, 128, 0.12)",
        },
      ]}
    >
      {segments.map((segment, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={segment}
            onPress={() => handleSelect(index)}
            style={[
              styles.segment,
              isSelected && [
                styles.selectedSegment,
                {
                  backgroundColor: isDark ? "rgba(99, 99, 102, 0.9)" : "#FFFFFF",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                },
              ],
            ]}
            testID={`segment-${index}`}
          >
            <ThemedText
              style={[
                styles.segmentText,
                {
                  color: isSelected ? theme.text : theme.textSecondary,
                  fontWeight: isSelected ? "600" : "500",
                },
              ]}
            >
              {segment}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 9,
    padding: 2,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  selectedSegment: {
    borderRadius: 7,
  },
  segmentText: {
    fontSize: 13,
  },
});
