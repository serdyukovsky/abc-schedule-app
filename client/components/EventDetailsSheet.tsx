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
  conflictingEvent?: Event | null;
  onClose: () => void;
  onTogglePlanned: (eventId: string) => void;
}

const formatTime = (date: Date) => date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
const formatDate = (date: Date) => date.toLocaleDateString("ru-RU", { weekday: "long", month: "long", day: "numeric" });
const getDuration = (event: Event) => {
  const mins = Math.round((event.endTime.getTime() - event.startTime.getTime()) / 60000);
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}ч ${m}мин` : `${h}ч`;
};

export function EventDetailsSheet({
  visible,
  event,
  conflictingEvent,
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
          animation: "fadeInUp 0.18s ease both",
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: `calc(100% - ${insets.top + 14}px)`,
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

          <View style={styles.header}>
            <View style={[styles.trackBadge, { backgroundColor: theme.trackBadge }]}>
              <Text style={[styles.trackText, { color: theme.trackBadgeText }]}>{event.track}</Text>
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

            <View style={styles.infoSection}>
              <View style={styles.metaRow}>
                <Feather name="calendar" size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.text }]}>{formatDate(event.startTime)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Feather name="clock" size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.text }]}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)} ({getDuration(event)})
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Feather name="map-pin" size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.text }]}>{event.location}</Text>
              </View>
            </View>

            {conflictingEvent ? (
              <View style={[styles.conflictBanner, { backgroundColor: `${theme.conflict}15` }]}>
                <Feather name="alert-circle" size={16} color={theme.conflict} />
                <Text style={[styles.conflictText, { color: theme.conflict }]}>
                  Конфликт с «{conflictingEvent.title}»
                </Text>
              </View>
            ) : null}

            {event.description ? (
              <View style={styles.descriptionSection}>
                <div
                  className="event-description"
                  style={{ color: theme.text, fontSize: 15, lineHeight: "22px" }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
                />
              </View>
            ) : null}

            {event.topics.length > 0 ? (
              <View style={styles.topicsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Что вы получите</Text>
                {event.topics.map((topic, i) => (
                  <View key={i} style={styles.topicRow}>
                    <View style={[styles.bullet, { backgroundColor: theme.link }]} />
                    <Text style={[styles.topicText, { color: theme.text }]}>{topic}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Spacing.sm },
            ]}
          >
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
  },
  trackBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: BorderRadius.xs },
  trackText: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  closeButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "600" },
  subtitle: { fontSize: 16, lineHeight: 22, marginTop: Spacing.sm },
  speakerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  speakerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  speakerTextWrap: { flex: 1 },
  speakerName: { fontSize: 16, fontWeight: "600" },
  speakerRole: { fontSize: 14, marginTop: 2 },
  infoSection: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  metaText: { fontSize: 15 },
  conflictBanner: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.sm, marginTop: Spacing.lg },
  conflictText: { fontSize: 14, fontWeight: "500", flex: 1 },
  descriptionSection: { marginTop: Spacing.xl },
  topicsSection: { marginTop: Spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginBottom: Spacing.md },
  topicRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: Spacing.md },
  topicText: { fontSize: 15, lineHeight: 22, flex: 1 },
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
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});
