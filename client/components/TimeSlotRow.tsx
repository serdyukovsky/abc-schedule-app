import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { EventCard } from "@/components/EventCard";
import { SwipeableEventCard } from "@/components/SwipeableEventCard";
import { Event } from "@/data/mockEvents";

interface TimeSlotRowProps {
  time: string;
  endTime?: string;
  events: Event[];
  onEventPress: (event: Event) => void;
  onTogglePlanned: (eventId: string) => void;
  onToggleSaved: (eventId: string) => void;
  hasConflict: (event: Event) => Event | null;
  showSwipeActions?: boolean;
}

export function TimeSlotRow({
  time,
  endTime,
  events,
  onEventPress,
  onTogglePlanned,
  onToggleSaved,
  hasConflict,
  showSwipeActions = true,
}: TimeSlotRowProps) {
  const { theme } = useTheme();

  const now = new Date();

  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>
          {time}
        </ThemedText>
        {endTime ? (
          <ThemedText style={[styles.endTimeText, { color: theme.textMuted }]}>
            {endTime}
          </ThemedText>
        ) : null}
      </View>

      <View style={[styles.divider, { backgroundColor: theme.separator }]} />

      <View style={styles.eventsColumn}>
        {events.map((event, index) => {
          const isPast = event.endTime < now;
          const isCurrent = event.startTime <= now && event.endTime > now;
          const conflict = hasConflict(event);

          if (showSwipeActions) {
            return (
              <SwipeableEventCard
                key={event.id}
                event={event}
                onPress={() => onEventPress(event)}
                onTogglePlanned={() => onTogglePlanned(event.id)}
                onToggleSaved={() => onToggleSaved(event.id)}
                isPast={isPast}
                isCurrent={isCurrent}
                hasConflict={!!conflict}
              />
            );
          }

          return (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => onEventPress(event)}
              isPast={isPast}
              isCurrent={isCurrent}
              hasConflict={!!conflict}
              compact
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  timeColumn: {
    width: 56,
    alignItems: "flex-end",
    paddingRight: Spacing.md,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  endTimeText: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    marginRight: Spacing.md,
  },
  eventsColumn: {
    flex: 1,
  },
});
