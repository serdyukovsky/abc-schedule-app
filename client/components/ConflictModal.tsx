import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Event } from "@/data/mockEvents";

interface ConflictModalProps {
  visible: boolean;
  newEvent: Event | null;
  conflictingEvent: Event | null;
  onReplace: () => void;
  onKeepBoth: () => void;
  onCancel: () => void;
}

export function ConflictModal({
  visible,
  newEvent,
  conflictingEvent,
  onReplace,
  onKeepBoth,
  onCancel,
}: ConflictModalProps) {
  const { theme } = useTheme();

  if (!newEvent || !conflictingEvent) return null;

  const handleReplace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReplace();
  };

  const handleKeepBoth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onKeepBoth();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.conflict}15` }]}>
              <Feather name="alert-circle" size={24} color={theme.conflict} />
            </View>
            <ThemedText style={[styles.title, { color: theme.text }]}>
              Time Conflict
            </ThemedText>
          </View>

          <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
            "{newEvent.title}" overlaps with "{conflictingEvent.title}".
          </ThemedText>

          <View style={styles.actions}>
            <Pressable
              onPress={handleReplace}
              style={[styles.button, { backgroundColor: theme.link }]}
            >
              <ThemedText style={styles.buttonTextPrimary}>Replace</ThemedText>
            </Pressable>

            <Pressable
              onPress={handleKeepBoth}
              style={[styles.button, styles.secondaryButton, { borderColor: theme.separator }]}
            >
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                Keep Both
              </ThemedText>
            </Pressable>

            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <ThemedText style={[styles.cancelText, { color: theme.textSecondary }]}>
                Cancel
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  container: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  actions: {
    gap: Spacing.sm,
  },
  button: {
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
  },
});
