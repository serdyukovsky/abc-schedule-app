import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { SpeakerRow } from "@/components/SpeakerRow";
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

  const isInactive = hasConflict && !event.isPlanned;
  const titleColor = isInactive ? theme.textSecondary : theme.text;
  const cardOpacity = isPast ? 0.5 : isInactive ? 0.85 : 1;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCurrent ? theme.currentHighlight : theme.backgroundDefault,
          opacity: cardOpacity,
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
        </View>

        <Pressable onPress={onPress} testID={`event-title-${event.id}`}>
          <ThemedText style={[styles.title, { color: titleColor }]} numberOfLines={2}>
            {event.title}
          </ThemedText>
        </Pressable>

        {event.speakerName ? (
          <View style={styles.speakerContainer}>
            <SpeakerRow name={event.speakerName} size={22} />
          </View>
        ) : null}

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
    paddingBottom: Spacing.md,
    minHeight: 80,
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
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    paddingRight: 48,
  },
  speakerContainer: {
    marginTop: Spacing.sm,
    paddingRight: 48,
  },
  addButton: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.md,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
