import React from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate } from "react-router-dom";
import { View, Text, Pressable, ScrollView, StyleSheet, useSafeAreaInsets } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function EventDetailsScreen() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { events, togglePlanned, hasConflict } = useEvents();

  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <Text style={{ color: theme.text, padding: 20 }}>Событие не найдено</Text>
      </View>
    );
  }

  const conflict = hasConflict(event);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("ru-RU", { weekday: "long", month: "long", day: "numeric" });

  const getDuration = () => {
    const mins = Math.round((event.endTime.getTime() - event.startTime.getTime()) / 60000);
    if (mins < 60) return `${mins} мин`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}ч ${m}мин` : `${h}ч`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: theme.backgroundRoot, borderBottomColor: theme.separator, paddingTop: 16 + insets.top }]}>
        <Pressable onPress={() => navigate(-1 as any)} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textSecondary }]} numberOfLines={1}>
          Детали события
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.trackBadge, { backgroundColor: theme.trackBadge }]}>
          <Text style={[styles.trackText, { color: theme.trackBadgeText }]}>{event.track}</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>

        {event.subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{event.subtitle}</Text>
        ) : null}

        {event.speakerName ? (
          <View style={styles.speakerSection}>
            {event.speakerPhoto ? (
              <img
                src={event.speakerPhoto}
                alt={event.speakerName}
                style={{ width: 48, height: 48, borderRadius: 24, objectFit: "cover" }}
              />
            ) : (
              <View style={[styles.speakerAvatar, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="user" size={24} color={theme.textSecondary} />
              </View>
            )}
            <View style={styles.speakerInfo}>
              <Text style={[styles.speakerName, { color: theme.text }]}>{event.speakerName}</Text>
              {event.speakerRole ? (
                <Text style={[styles.speakerRole, { color: theme.textSecondary }]}>{event.speakerRole}</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={[styles.infoSection, { borderColor: theme.separator }]}>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.text }]}>{formatDate(event.startTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="clock" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {formatTime(event.startTime)} – {formatTime(event.endTime)} ({getDuration()})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.text }]}>{event.location}</Text>
          </View>
        </View>

        {conflict ? (
          <View style={[styles.conflictBanner, { backgroundColor: `${theme.conflict}15` }]}>
            <Feather name="alert-circle" size={16} color={theme.conflict} />
            <Text style={[styles.conflictText, { color: theme.conflict }]}>
              Конфликт с «{conflict.title}»
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

      <View style={[styles.bottomBar, { backgroundColor: theme.backgroundRoot, borderTopColor: theme.separator, paddingBottom: Spacing.lg + insets.bottom }]}>
        <Pressable
          onPress={() => togglePlanned(event.id)}
          style={[styles.primaryButton, { backgroundColor: event.isPlanned ? theme.backgroundSecondary : theme.link }]}
          testID="toggle-planned-button"
        >
          <Feather name={event.isPlanned ? "check" : "plus"} size={18} color={event.isPlanned ? theme.text : theme.buttonText} />
          <Text style={[styles.buttonText, { color: event.isPlanned ? theme.text : theme.buttonText }]}>
            {event.isPlanned ? "Добавлено" : "Добавить в моё расписание"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 15, fontWeight: "600" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  trackBadge: { alignSelf: "flex-start", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.xs, marginBottom: Spacing.md },
  trackText: { fontSize: 13, fontWeight: "500" },
  title: { fontSize: 28, fontWeight: "600", lineHeight: 34, marginBottom: Spacing.sm },
  subtitle: { fontSize: 17, lineHeight: 22, marginBottom: Spacing.lg },
  speakerSection: { flexDirection: "row", alignItems: "center", marginTop: Spacing.lg, marginBottom: Spacing.xl },
  speakerAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  speakerInfo: { marginLeft: Spacing.md },
  speakerName: { fontSize: 17, fontWeight: "600" },
  speakerRole: { fontSize: 15, marginTop: 2 },
  infoSection: { paddingVertical: Spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, gap: Spacing.md },
  infoRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  infoText: { fontSize: 15 },
  conflictBanner: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.sm, marginTop: Spacing.lg },
  conflictText: { fontSize: 14, fontWeight: "500", flex: 1 },
  descriptionSection: { marginTop: Spacing.xl },
  description: { fontSize: 15, lineHeight: 22 },
  topicsSection: { marginTop: Spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginBottom: Spacing.md },
  topicRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: Spacing.md },
  topicText: { fontSize: 15, lineHeight: 22, flex: 1 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1 },
  primaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, height: 52, borderRadius: BorderRadius.full },
  buttonText: { fontSize: 17, fontWeight: "600" },
});
