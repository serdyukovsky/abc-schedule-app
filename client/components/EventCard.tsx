import React from "react";
import { View, Pressable, StyleSheet } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { ThemedText } from "@/components/ThemedText";
import { SpeakerRow } from "@/components/SpeakerRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Event } from "@/lib/pb-types";

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onTogglePlanned?: () => void;
  isPast?: boolean;
  isCurrent?: boolean;
  hasConflict?: boolean;
  showActions?: boolean;
}

export function EventCard({ event, onPress, onTogglePlanned, isPast = false, isCurrent = false, hasConflict = false, showActions = true }: EventCardProps) {
  const { theme } = useTheme();
  const isInactive = hasConflict && !event.isPlanned;
  const cardOpacity = isPast ? 0.5 : isInactive ? 0.85 : 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        borderRadius: BorderRadius.sm,
        borderLeft: `3px solid ${isCurrent ? theme.link : "transparent"}`,
        overflow: "hidden",
        marginBottom: Spacing.sm,
        backgroundColor: theme.backgroundDefault,
        opacity: cardOpacity,
        position: "relative",
      }}
      data-testid={`event-card-${event.id}`}
    >
      {isCurrent ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            backgroundImage: `linear-gradient(100deg, transparent 35%, rgba(210,7,41,0.04) 46%, rgba(210,7,41,0.06) 50%, rgba(210,7,41,0.04) 54%, transparent 65%)`,
            backgroundSize: "200% 100%",
            animation: "currentCardShimmer 5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      ) : null}
      <View style={styles.content}>
        <Pressable onPress={onPress} style={styles.mainTapArea} testID={`event-title-${event.id}`}>
          <View style={styles.topRow}>
            <View style={[styles.trackBadge, { backgroundColor: theme.trackBadge }]}>
              <ThemedText style={[styles.trackText, { color: theme.trackBadgeText }]}>{event.track}</ThemedText>
            </View>
            {isCurrent ? (
              <View style={styles.liveBadge}>
                <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.link, animation: "liveDot 1.5s ease-in-out infinite" }} />
                <ThemedText style={[styles.liveText, { color: theme.link }]}>Сейчас</ThemedText>
              </View>
            ) : null}
          </View>

          <ThemedText style={[styles.title, { color: isInactive ? theme.textSecondary : theme.text }]} numberOfLines={2}>
            {event.title}
          </ThemedText>

          <View style={styles.metaRow}>
            {event.speakerName ? (
              <SpeakerRow name={event.speakerName} photoUrl={event.speakerPhoto} size={22} />
            ) : null}
            {event.location ? (
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={12} color={theme.textMuted} />
                <ThemedText style={[styles.locationText, { color: theme.textMuted }]}>{event.location}</ThemedText>
              </View>
            ) : null}
          </View>
        </Pressable>

        {showActions ? (
          <Pressable onPress={() => onTogglePlanned?.()} style={styles.addButton} testID={`add-button-${event.id}`}>
            <Feather name={event.isPlanned ? "check-circle" : "plus-circle"} size={24} color={event.isPlanned ? theme.link : theme.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </div>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, minHeight: 100, position: "relative" },
  mainTapArea: { paddingRight: 48 },
  topRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.xs },
  trackBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.xs },
  trackText: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { fontSize: 15, fontWeight: "600", lineHeight: 20 },
  metaRow: { marginTop: Spacing.sm, gap: Spacing.xs },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 12 },
  addButton: { position: "absolute", bottom: Spacing.sm, right: Spacing.md, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
});
