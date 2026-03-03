import React from "react";
import { View, Text, Pressable, StyleSheet } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { useTelegram } from "@/hooks/useTelegram";
import { Spacing } from "@/constants/theme";
import { LogoABC } from "@/components/LogoABC";

const TABS = ["Расписание", "Моё"];

interface AppHeaderProps {
  selectedSegment: number;
  onSelectSegment: (index: number) => void;
  topInset?: number;
}

export function AppHeader({ selectedSegment, onSelectSegment, topInset = 0 }: AppHeaderProps) {
  const { theme, isDark } = useTheme();
  const { hapticImpact } = useTelegram();

  return (
    <View style={[styles.container, { paddingTop: 14 + topInset }]}>
      <LogoABC height={24} color={theme.text} />
      <View style={[styles.tabs, { backgroundColor: isDark ? "rgba(120,120,128,0.24)" : "rgba(118,118,128,0.12)" }]}>
        {TABS.map((tab, i) => {
          const isActive = i === selectedSegment;
          return (
            <Pressable
              key={tab}
              onPress={() => { hapticImpact("light"); onSelectSegment(i); }}
              style={[styles.tab, isActive && [styles.activeTab, { backgroundColor: isDark ? "rgba(99,99,102,0.9)" : "#FFFFFF" }]]}
            >
              <Text style={[styles.tabText, { color: isActive ? theme.text : theme.textSecondary, fontWeight: isActive ? "600" : "400" }]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingBottom: 10, position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  tabs: { borderRadius: 18, padding: 3, flexDirection: "row", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" },
  tab: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 15 },
  activeTab: { boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  tabText: { fontSize: 13 },
});
