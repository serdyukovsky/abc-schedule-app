import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Event } from "@/lib/pb-types";

interface ConflictModalProps {
  visible: boolean;
  newEvent: Event | null;
  conflictingEvent: Event | null;
  onReplace: () => void;
  onKeepBoth: () => void;
  onCancel: () => void;
}

export function ConflictModal({ visible, newEvent, conflictingEvent, onReplace, onKeepBoth, onCancel }: ConflictModalProps) {
  const { theme } = useTheme();
  if (!newEvent || !conflictingEvent) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.conflict}15` }]}>
              <Feather name="alert-circle" size={24} color={theme.conflict} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Конфликт времени</Text>
          </View>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            Пересекается с «{conflictingEvent.title}».
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={onReplace} style={[styles.button, { backgroundColor: theme.link }]}>
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Заменить</Text>
            </Pressable>
            <Pressable onPress={onKeepBoth} style={[styles.button, styles.secondaryButton, { borderColor: theme.separator }]}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Оставить оба</Text>
            </Pressable>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Отмена</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  container: { width: "100%", maxWidth: 320, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  header: { alignItems: "center", marginBottom: Spacing.lg },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  title: { fontSize: 18, fontWeight: "600" },
  message: { fontSize: 15, lineHeight: 22, textAlign: "center", marginBottom: Spacing.xl },
  actions: { gap: Spacing.sm },
  button: { height: 48, borderRadius: BorderRadius.full, alignItems: "center", justifyContent: "center" },
  secondaryButton: { backgroundColor: "transparent", borderWidth: 1 },
  buttonText: { fontSize: 16, fontWeight: "600" },
  cancelButton: { height: 44, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 15 },
});
