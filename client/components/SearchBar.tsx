import React, { useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onClose,
  autoFocus = true,
}: SearchBarProps) {
  const { theme, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText("");
    inputRef.current?.focus();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const content = (
    <View style={styles.innerContainer}>
      <View style={styles.inputRow}>
        <Feather
          name="search"
          size={18}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder="Поиск по названию, спикеру, месту"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          testID="search-input"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.clearIcon, { backgroundColor: theme.textMuted }]}>
              <Feather name="x" size={12} color={theme.backgroundRoot} />
            </View>
          </Pressable>
        ) : null}
      </View>

      <Pressable onPress={handleClose} style={styles.cancelButton}>
        <ThemedText style={[styles.cancelText, { color: theme.link }]}>
          Отмена
        </ThemedText>
      </Pressable>
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
          {
            backgroundColor: isDark
              ? "rgba(45, 45, 48, 0.98)"
              : "rgba(255, 255, 255, 0.98)",
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  clearIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
