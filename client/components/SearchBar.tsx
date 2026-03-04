import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "@/components/primitives";
import { TextInput } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, onClose, autoFocus = true }: SearchBarProps) {
  const { theme, isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  return (
    <View style={styles.outerContainer} className="searchbar-enter">
      <View style={[styles.container, {
        backgroundColor: isDark ? "rgba(45,45,48,0.98)" : "rgba(255,255,255,0.98)",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
      }]}>
        <View style={styles.inputRow}>
          <Feather name="search" size={18} color={theme.textSecondary} style={{ marginRight: Spacing.sm }} />
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder="Поиск по названию, спикеру, месту"
            style={[styles.input, { color: theme.text }]}
            autoCapitalize="none"
            autoCorrect={false}
            testID="search-input"
          />
          {value.length > 0 ? (
            <Pressable onPress={() => { onChangeText(""); inputRef.current?.focus(); }} style={styles.clearButton} className="interactive-press">
              <View style={[styles.clearIcon, { backgroundColor: theme.textMuted }]}>
                <Feather name="x" size={12} color={theme.backgroundRoot} />
              </View>
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={onClose} style={styles.cancelButton} className="interactive-press">
          <Text style={[styles.cancelText, { color: theme.link }]}>Отмена</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  container: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: "hidden", flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.md },
  inputRow: { flex: 1, flexDirection: "row", alignItems: "center" },
  input: { flex: 1, fontSize: 16, paddingVertical: Spacing.sm, background: "none", border: "none", outline: "none", fontFamily: "inherit" } as any,
  clearButton: { padding: Spacing.xs },
  clearIcon: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cancelButton: { paddingVertical: Spacing.sm, paddingLeft: Spacing.sm },
  cancelText: { fontSize: 16, fontWeight: "500" },
});
