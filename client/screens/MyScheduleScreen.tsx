import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";
import { Spacing } from "@/constants/theme";
import { TimeSlotRow } from "@/components/TimeSlotRow";
import { NowIndicator } from "@/components/NowIndicator";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { Event } from "@/data/mockEvents";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DaySection {
  date: Date;
  dateLabel: string;
  slots: TimeSlot[];
}

interface TimeSlot {
  time: string;
  endTime?: string;
  events: Event[];
}

export default function MyScheduleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { getPlannedEvents, togglePlanned, toggleSaved, hasConflict } = useEvents();

  const plannedEvents = getPlannedEvents();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const daySections = useMemo(() => {
    const byDay: { [key: string]: Event[] } = {};
    
    plannedEvents.forEach((event) => {
      const dayKey = getDateKey(event.startTime);
      if (!byDay[dayKey]) {
        byDay[dayKey] = [];
      }
      byDay[dayKey].push(event);
    });

    const sections: DaySection[] = [];

    Object.keys(byDay)
      .sort()
      .forEach((dayKey) => {
        const dayEvents = byDay[dayKey];
        const grouped: { [key: string]: Event[] } = {};

        dayEvents.forEach((event) => {
          const timeKey = formatTime(event.startTime);
          if (!grouped[timeKey]) {
            grouped[timeKey] = [];
          }
          grouped[timeKey].push(event);
        });

        const slots: TimeSlot[] = Object.keys(grouped)
          .sort()
          .map((time) => {
            const slotEvents = grouped[time];
            const latestEndTime = slotEvents.reduce((latest, event) => {
              return event.endTime > latest ? event.endTime : latest;
            }, slotEvents[0].endTime);
            
            return {
              time,
              endTime: formatTime(latestEndTime),
              events: slotEvents,
            };
          });

        sections.push({
          date: dayEvents[0].startTime,
          dateLabel: formatDate(dayEvents[0].startTime),
          slots,
        });
      });

    return sections;
  }, [plannedEvents]);

  const handleEventPress = useCallback((event: Event) => {
    navigation.navigate("EventDetails", { eventId: event.id });
  }, [navigation]);

  const hasEventsToday = plannedEvents.some((event) => {
    const today = new Date();
    return (
      event.startTime.getFullYear() === today.getFullYear() &&
      event.startTime.getMonth() === today.getMonth() &&
      event.startTime.getDate() === today.getDate()
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {hasEventsToday ? <NowIndicator /> : null}

        {daySections.length > 0 ? (
          daySections.map((section, sectionIndex) => (
            <View key={section.dateLabel}>
              <View style={[styles.dateHeader, { borderBottomColor: theme.separator }]}>
                <ThemedText style={[styles.dateLabel, { color: theme.text }]}>
                  {section.dateLabel}
                </ThemedText>
              </View>

              {section.slots.map((slot, slotIndex) => (
                <View key={slot.time}>
                  {slotIndex > 0 ? (
                    <View style={[styles.slotDivider, { backgroundColor: theme.separator }]} />
                  ) : null}
                  <TimeSlotRow
                    time={slot.time}
                    endTime={slot.endTime}
                    events={slot.events}
                    onEventPress={handleEventPress}
                    onTogglePlanned={togglePlanned}
                    onToggleSaved={toggleSaved}
                    hasConflict={hasConflict}
                    showSwipeActions={false}
                  />
                </View>
              ))}

              {sectionIndex < daySections.length - 1 ? (
                <View style={[styles.sectionDivider, { backgroundColor: theme.separator }]} />
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState
            title="No Events Planned"
            message="Swipe right on events in the Schedule tab to add them here."
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  dateHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  slotDivider: {
    height: 1,
    marginLeft: 72 + Spacing.lg,
    marginRight: Spacing.lg,
  },
  sectionDivider: {
    height: 8,
    marginVertical: Spacing.md,
  },
});
