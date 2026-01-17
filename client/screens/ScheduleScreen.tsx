import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";
import { Spacing } from "@/constants/theme";
import { FilterChips } from "@/components/FilterChips";
import { DateSelector } from "@/components/DateSelector";
import { TimeSlotRow } from "@/components/TimeSlotRow";
import { NowIndicator } from "@/components/NowIndicator";
import { EmptyState } from "@/components/EmptyState";
import { ConflictModal } from "@/components/ConflictModal";
import { Event, eventDays, tracks } from "@/data/mockEvents";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TimeSlot {
  time: string;
  endTime?: string;
  events: Event[];
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { events, togglePlanned, toggleSaved, hasConflict, getPlannedEvents } = useEvents();

  const [selectedDate, setSelectedDate] = useState(eventDays[0].date);
  const [selectedTrack, setSelectedTrack] = useState("All");
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);
  const [conflictingEvent, setConflictingEvent] = useState<Event | null>(null);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesDate = isSameDay(event.startTime, selectedDate);
      const matchesTrack = selectedTrack === "All" || event.track === selectedTrack;
      return matchesDate && matchesTrack;
    });
  }, [events, selectedDate, selectedTrack]);

  const timeSlots = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {};
    
    filteredEvents.forEach((event) => {
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

    return slots;
  }, [filteredEvents]);

  const handleEventPress = useCallback((event: Event) => {
    navigation.navigate("EventDetails", { eventId: event.id });
  }, [navigation]);

  const handleTogglePlanned = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (!event.isPlanned) {
      const conflict = hasConflict(event);
      if (conflict) {
        setPendingEvent(event);
        setConflictingEvent(conflict);
        setConflictModalVisible(true);
        return;
      }
    }

    togglePlanned(eventId);
  }, [events, hasConflict, togglePlanned]);

  const handleReplace = () => {
    if (pendingEvent && conflictingEvent) {
      togglePlanned(conflictingEvent.id);
      togglePlanned(pendingEvent.id);
    }
    setConflictModalVisible(false);
    setPendingEvent(null);
    setConflictingEvent(null);
  };

  const handleKeepBoth = () => {
    if (pendingEvent) {
      togglePlanned(pendingEvent.id);
    }
    setConflictModalVisible(false);
    setPendingEvent(null);
    setConflictingEvent(null);
  };

  const handleCancelConflict = () => {
    setConflictModalVisible(false);
    setPendingEvent(null);
    setConflictingEvent(null);
  };

  const showNowIndicator = isToday(selectedDate);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={{ paddingTop: headerHeight }}>
        <FilterChips
          options={tracks}
          selected={selectedTrack}
          onSelect={setSelectedTrack}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 80,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {showNowIndicator ? <NowIndicator /> : null}

        {timeSlots.length > 0 ? (
          timeSlots.map((slot, index) => (
            <View key={slot.time}>
              {index > 0 ? (
                <View style={[styles.slotDivider, { backgroundColor: theme.separator }]} />
              ) : null}
              <TimeSlotRow
                time={slot.time}
                endTime={slot.endTime}
                events={slot.events}
                onEventPress={handleEventPress}
                onTogglePlanned={handleTogglePlanned}
                onToggleSaved={toggleSaved}
                hasConflict={hasConflict}
              />
            </View>
          ))
        ) : (
          <EmptyState
            title="No Events"
            message={`No events scheduled for this day${selectedTrack !== "All" ? ` in ${selectedTrack}` : ""}.`}
          />
        )}
      </ScrollView>

      <View style={{ paddingBottom: tabBarHeight }}>
        <DateSelector
          dates={eventDays}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </View>

      <ConflictModal
        visible={conflictModalVisible}
        newEvent={pendingEvent}
        conflictingEvent={conflictingEvent}
        onReplace={handleReplace}
        onKeepBoth={handleKeepBoth}
        onCancel={handleCancelConflict}
      />
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
  slotDivider: {
    height: 1,
    marginLeft: 72 + Spacing.lg,
    marginRight: Spacing.lg,
  },
});
