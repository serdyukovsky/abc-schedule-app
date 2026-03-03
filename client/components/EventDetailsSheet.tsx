import React from "react";
import DOMPurify from "dompurify";
import { View, Text, Pressable, ScrollView, Modal, StyleSheet, useSafeAreaInsets } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Event } from "@/lib/pb-types";

interface EventDetailsSheetProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onTogglePlanned: (eventId: string) => void;
}

const formatTime = (date: Date) => date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
const formatDate = (date: Date) => date.toLocaleDateString("ru-RU", { weekday: "long", month: "long", day: "numeric" });

export function EventDetailsSheet({
  visible,
  event,
  onClose,
  onTogglePlanned,
}: EventDetailsSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible || !event) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "flex-end",
          animation: "fadeInUp 0.18s ease both",
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: "100%",
            maxHeight: `calc(100% - ${Math.max(24, insets.top - 10)}px)`,
            background: theme.backgroundRoot,
            borderTopLeftRadius: BorderRadius.lg,
            borderTopRightRadius: BorderRadius.lg,
            borderTop: `1px solid ${theme.separator}`,
            boxShadow: "0 -16px 40px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            animation: "slideInFromBottom 0.34s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.separator }]} />

          <View style={[styles.header, { borderBottomColor: theme.separator }]}>
            <View style={[styles.trackBadge, { backgroundColor: theme.trackBadge }]}>
              <Text style={[styles.trackText, { color: theme.textSecondary }]}>{event.track}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>

            {event.subtitle ? (
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{event.subtitle}</Text>
            ) : null}

            <View style={styles.metaList}>
              <View style={styles.metaRow}>
                <Feather name="clock" size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.text }]}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Feather name="calendar" size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.text }]}>{formatDate(event.startTime)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Feather name="map-pin" size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.text }]}>{event.location}</Text>
              </View>
            </View>

            {event.speakerName ? (
              <View style={styles.speakerRow}>
                {event.speakerPhoto ? (
                  <img
                    src={event.speakerPhoto}
                    alt={event.speakerName}
                    style={{ width: 44, height: 44, borderRadius: 22, objectFit: "cover" }}
                  />
                ) : (
                  <View style={[styles.speakerAvatar, { backgroundColor: theme.backgroundSecondary }]}>
                    <Feather name="user" size={18} color={theme.textSecondary} />
                  </View>
                )}
                <View style={styles.speakerTextWrap}>
                  <Text style={[styles.speakerName, { color: theme.text }]}>{event.speakerName}</Text>
                  {event.speakerRole ? (
                    <Text style={[styles.speakerRole, { color: theme.textSecondary }]}>{event.speakerRole}</Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {event.description ? (
              <div
                className="event-description"
                style={{ color: theme.text, fontSize: 15, lineHeight: "22px" }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
              />
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.separator }]}>
            <Pressable
              onPress={() => onTogglePlanned(event.id)}
              style={[styles.primaryButton, { backgroundColor: event.isPlanned ? theme.backgroundSecondary : theme.link }]}
            >
              <Feather name={event.isPlanned ? "check" : "plus"} size={18} color={event.isPlanned ? theme.text : theme.buttonText} />
              <Text style={[styles.primaryButtonText, { color: event.isPlanned ? theme.text : theme.buttonText }]}>
                {event.isPlanned ? "Добавлено" : "Добавить в моё расписание"}
              </Text>
            </Pressable>
          </View>
        </div>
      </div>
    </Modal>
  );
}

const styles = StyleSheet.create({
  handle: { width: 44, height: 5, borderRadius: BorderRadius.full, alignSelf: "center", marginTop: Spacing.sm, marginBottom: Spacing.sm },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  trackBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: BorderRadius.xs },
  trackText: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  closeButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "600" },
  subtitle: { fontSize: 16, lineHeight: 22, marginTop: Spacing.sm },
  metaList: { marginTop: Spacing.lg, gap: Spacing.sm },
  metaRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  metaText: { fontSize: 15 },
  speakerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.lg },
  speakerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  speakerTextWrap: { flex: 1 },
  speakerName: { fontSize: 16, fontWeight: "600" },
  speakerRole: { fontSize: 14, marginTop: 2 },
  primaryButton: {
    height: 50,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.sm,
  },
  primaryButtonText: { fontSize: 16, fontWeight: "600" },
  footer: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});
