import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, SectionList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";
import { Spacing } from "@/constants/theme";
import { EventCard } from "@/components/EventCard";
import { FilterChips } from "@/components/FilterChips";
import { DateSelector } from "@/components/DateSelector";
import { TimeLabel } from "@/components/TimeLabel";
import { NowIndicator } from "@/components/NowIndicator";
import { EmptyState } from "@/components/EmptyState";
import { Event, eventDays, tracks } from "@/data/mockEvents";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { events, togglePlanned, toggleSaved, hasConflict } = useEvents();

  const [selectedDate, setSelectedDate] = useState(eventDays[0].date);
  const [selectedTrack, setSelectedTrack] = useState("All");

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

  const sections = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {};
    
    filteredEvents.forEach((event) => {
      const timeKey = formatTime(event.startTime);
      if (!grouped[timeKey]) {
        grouped[timeKey] = [];
      }
      grouped[timeKey].push(event);
    });

    return Object.keys(grouped)
      .sort()
      .map((time) => ({
        title: time,
        data: grouped[time],
      }));
  }, [filteredEvents]);

  const handleEventPress = useCallback((event: Event) => {
    navigation.navigate("EventDetails", { eventId: event.id });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Event }) => {
    const now = new Date();
    const isPast = item.endTime < now;
    const isCurrent = item.startTime <= now && item.endTime > now;
    const conflict = hasConflict(item);

    return (
      <EventCard
        event={item}
        onPress={() => handleEventPress(item)}
        onTogglePlanned={() => togglePlanned(item.id)}
        onToggleSaved={() => toggleSaved(item.id)}
        isPast={isPast}
        isCurrent={isCurrent}
        conflictWith={conflict}
      />
    );
  }, [handleEventPress, togglePlanned, toggleSaved, hasConflict]);

  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => {
    return <TimeLabel time={section.title} />;
  }, []);

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

      {showNowIndicator ? <NowIndicator /> : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 80,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListEmptyComponent={
          <EmptyState
            title="No Events"
            message={`No events scheduled for this day${selectedTrack !== "All" ? ` in ${selectedTrack}` : ""}.`}
          />
        }
      />

      <View style={{ paddingBottom: tabBarHeight }}>
        <DateSelector
          dates={eventDays}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
