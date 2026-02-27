import React from "react";
import { View, Text, Pressable, StyleSheet } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onSelect }: SegmentedControlProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "rgba(120,120,128,0.24)" : "rgba(118,118,128,0.12)" }]}>
      {segments.map((segment, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={segment}
            onPress={() => { if (index !== selectedIndex) onSelect(index); }}
            style={[styles.segment, isSelected && [styles.selectedSegment, { backgroundColor: isDark ? "rgba(99,99,102,0.9)" : "#FFFFFF", boxShadow: `0 1px 2px rgba(0,0,0,${isDark ? 0.3 : 0.1})` }]]}
            testID={`segment-${index}`}
          >
            <Text style={[styles.segmentText, { color: isSelected ? theme.text : theme.textSecondary, fontWeight: isSelected ? "600" : "500" }]}>
              {segment}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", borderRadius: 8, padding: 2 },
  segment: { flex: 1, paddingVertical: 5, alignItems: "center", justifyContent: "center", borderRadius: 6 },
  selectedSegment: { borderRadius: 6 },
  segmentText: { fontSize: 12 },
});
