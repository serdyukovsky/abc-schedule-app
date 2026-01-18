import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";
import { Spacing } from "@/constants/theme";
import { SegmentedControl } from "@/components/SegmentedControl";
import { FilterChips } from "@/components/FilterChips";
import { DateSelector } from "@/components/DateSelector";
import { SearchBar } from "@/components/SearchBar";
import { TimeSlotRow } from "@/components/TimeSlotRow";
import { NowIndicator } from "@/components/NowIndicator";
import { EmptyState } from "@/components/EmptyState";
import { ConflictModal } from "@/components/ConflictModal";
import { ThemedText } from "@/components/ThemedText";
import { Event, eventDays, tracks } from "@/data/mockEvents";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TimeSlot {
  time: string;
  endTime?: string;
  events: Event[];
}

interface DaySection {
  date: Date;
  dateLabel: string;
  slots: TimeSlot[];
}

const SEGMENTS = ["Расписание", "Моё расписание"];

export default function MainScheduleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { events, togglePlanned, hasConflict, getPlannedEvents } = useEvents();

  const [selectedSegment, setSelectedSegment] = useState(0);
  const [selectedDate, setSelectedDate] = useState(eventDays[0].date);
  const [selectedTrack, setSelectedTrack] = useState("All");
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);
  const [conflictingEvent, setConflictingEvent] = useState<Event | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isScheduleView = selectedSegment === 0;
  const plannedEvents = getPlannedEvents();

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const matchesSearch = (event: Event, query: string): boolean => {
    if (!query.trim()) return true;
    const lowerQuery = query.toLowerCase().trim();
    return (
      event.title.toLowerCase().includes(lowerQuery) ||
      event.speakerName.toLowerCase().includes(lowerQuery) ||
      event.location.toLowerCase().includes(lowerQuery) ||
      event.track.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesDate = isSameDay(event.startTime, selectedDate);
      const matchesTrack = selectedTrack === "All" || event.track === selectedTrack;
      const matchesSearchQuery = matchesSearch(event, searchQuery);
      return matchesDate && matchesTrack && matchesSearchQuery;
    });
  }, [events, selectedDate, selectedTrack, searchQuery]);

  const scheduleTimeSlots = useMemo(() => {
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

  const myScheduleSections = useMemo(() => {
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
    Keyboard.dismiss();
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

  const handleSearchPress = () => {
    setIsSearching(true);
  };

  const handleSearchClose = () => {
    setIsSearching(false);
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const showNowIndicator = isScheduleView && isToday(selectedDate);

  const hasEventsToday = plannedEvents.some((event) => {
    const today = new Date();
    return isSameDay(event.startTime, today);
  });

  const renderScheduleContent = () => (
    <>
      <FilterChips
        options={tracks}
        selected={selectedTrack}
        onSelect={setSelectedTrack}
      />

      {showNowIndicator ? <NowIndicator /> : null}

      {scheduleTimeSlots.length > 0 ? (
        scheduleTimeSlots.map((slot, index) => (
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
              hasConflict={hasConflict}
            />
          </View>
        ))
      ) : (
        <EmptyState
          title={searchQuery ? "Ничего не найдено" : "Нет событий"}
          message={
            searchQuery
              ? `По запросу «${searchQuery}» ничего не найдено.`
              : `Нет событий на этот день${selectedTrack !== "All" ? ` в категории ${selectedTrack}` : ""}.`
          }
        />
      )}
    </>
  );

  const renderMyScheduleContent = () => (
    <>
      {!isScheduleView && hasEventsToday ? <NowIndicator /> : null}

      {myScheduleSections.length > 0 ? (
        myScheduleSections.map((section, sectionIndex) => (
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
                  onTogglePlanned={handleTogglePlanned}
                  hasConflict={hasConflict}
                  showSwipeActions={false}
                />
              </View>
            ))}

            {sectionIndex < myScheduleSections.length - 1 ? (
              <View style={[styles.sectionDivider, { backgroundColor: theme.separator }]} />
            ) : null}
          </View>
        ))
      ) : (
        <EmptyState
          title="Нет запланированных событий"
          message="Нажмите + на карточке события, чтобы добавить его сюда."
        />
      )}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={{ paddingTop: headerHeight }}>
        <SegmentedControl
          segments={SEGMENTS}
          selectedIndex={selectedSegment}
          onSelect={setSelectedSegment}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isScheduleView ? renderScheduleContent() : renderMyScheduleContent()}
      </ScrollView>

      {isScheduleView ? (
        <View style={[styles.bottomSelector, { bottom: insets.bottom + Spacing.sm }]}>
          {isSearching ? (
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClose={handleSearchClose}
            />
          ) : (
            <DateSelector
              dates={eventDays}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              onSearchPress={handleSearchPress}
              isSearchActive={isSearching}
            />
          )}
        </View>
      ) : null}

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
  dateHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionDivider: {
    height: 8,
    marginVertical: Spacing.md,
  },
  bottomSelector: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
