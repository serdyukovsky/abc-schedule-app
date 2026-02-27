import React from "react";
import { View, Text, StyleSheet } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { EventCard } from "@/components/EventCard";
import { SwipeableEventCard } from "@/components/SwipeableEventCard";
import { Event } from "@/lib/pb-types";

interface TimeSlotRowProps {
  time: string;
  endTime?: string;
  events: Event[];
  onEventPress: (event: Event) => void;
  onTogglePlanned: (eventId: string) => void;
  hasConflict: (event: Event) => Event | null;
  showSwipeActions?: boolean;
}

export function TimeSlotRow({ time, endTime, events, onEventPress, onTogglePlanned, hasConflict, showSwipeActions = true }: TimeSlotRowProps) {
  const { theme } = useTheme();
  const now = new Date();

  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <Text style={[styles.timeText, { color: theme.textSecondary }]}>{time}</Text>
        {endTime ? <Text style={[styles.endTimeText, { color: theme.textMuted }]}>{endTime}</Text> : null}
      </View>
      <View style={[styles.divider, { backgroundColor: theme.separator }]} />
      <View style={styles.eventsColumn}>
        {events.map((event) => {
          const isPast = event.endTime < now;
          const isCurrent = event.startTime <= now && event.endTime > now;
          const conflict = hasConflict(event);
          if (showSwipeActions) {
            return <SwipeableEventCard key={event.id} event={event} onPress={() => onEventPress(event)} onTogglePlanned={() => onTogglePlanned(event.id)} isPast={isPast} isCurrent={isCurrent} hasConflict={!!conflict} />;
          }
          return <EventCard key={event.id} event={event} onPress={() => onEventPress(event)} onTogglePlanned={() => onTogglePlanned(event.id)} isPast={isPast} isCurrent={isCurrent} hasConflict={!!conflict} showActions={true} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  timeColumn: { width: 56, alignItems: "flex-end", paddingRight: Spacing.md },
  timeText: { fontSize: 14, fontWeight: "600", letterSpacing: 0.3 },
  endTimeText: { fontSize: 11, marginTop: 2 },
  divider: { width: 1, marginRight: Spacing.md },
  eventsColumn: { flex: 1 },
});
