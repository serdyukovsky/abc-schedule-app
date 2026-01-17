import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Event } from "@/data/mockEvents";

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onTogglePlanned?: () => void;
  isPast?: boolean;
  isCurrent?: boolean;
  hasConflict?: boolean;
  showActions?: boolean;
}

export function EventCard({
  event,
  onPress,
  onTogglePlanned,
  isPast = false,
  isCurrent = false,
  hasConflict = false,
  showActions = true,
}: EventCardProps) {
  const { theme } = useTheme();

  const handleTogglePlanned = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTogglePlanned?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCurrent ? theme.currentHighlight : theme.backgroundDefault,
          opacity: isPast ? 0.5 : 1,
          borderLeftColor: isCurrent ? theme.link : "transparent",
        },
      ]}
      testID={`event-card-${event.id}`}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.trackBadge, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={[styles.trackText, { color: theme.textSecondary }]}>
              {event.track}
            </ThemedText>
          </View>
          {hasConflict ? (
            <View style={[styles.conflictBadge, { backgroundColor: `${theme.conflict}20` }]}>
              <ThemedText style={[styles.conflictText, { color: theme.conflict }]}>
                Конфликт
              </ThemedText>
            </View>
          ) : null}
        </View>

        <Pressable onPress={onPress} testID={`event-title-${event.id}`}>
          <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {event.title}
          </ThemedText>
        </Pressable>

        {event.speakerName ? (
          <ThemedText style={[styles.speaker, { color: theme.textSecondary }]} numberOfLines={1}>
            {event.speakerName}
          </ThemedText>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={11} color={theme.textSecondary} />
            <ThemedText style={[styles.location, { color: theme.textSecondary }]} numberOfLines={1}>
              {event.location}
            </ThemedText>
          </View>
        </View>

        {showActions ? (
          <Pressable
            onPress={handleTogglePlanned}
            style={styles.addButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID={`add-button-${event.id}`}
          >
            <Feather
              name={event.isPlanned ? "check-circle" : "plus-circle"}
              size={24}
              color={event.isPlanned ? theme.link : theme.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    minHeight: 100,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  trackBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  trackText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  conflictBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  conflictText: {
    fontSize: 10,
    fontWeight: "600",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    paddingRight: 48,
  },
  speaker: {
    fontSize: 13,
    marginTop: Spacing.xs,
    paddingRight: 48,
  },
  footer: {
    marginTop: Spacing.sm,
    paddingRight: 48,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  location: {
    fontSize: 12,
  },
  addButton: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
