import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, SectionList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";
import { Spacing } from "@/constants/theme";
import { EventCard } from "@/components/EventCard";
import { TimeLabel } from "@/components/TimeLabel";
import { NowIndicator } from "@/components/NowIndicator";
import { EmptyState } from "@/components/EmptyState";
import { Event } from "@/data/mockEvents";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const sections = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {};
    
    plannedEvents.forEach((event) => {
      const dateKey = formatDate(event.startTime);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return Object.keys(grouped).map((date) => ({
      title: date,
      data: grouped[date],
    }));
  }, [plannedEvents]);

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
      {hasEventsToday ? (
        <View style={{ paddingTop: headerHeight }}>
          <NowIndicator />
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={{
          paddingTop: hasEventsToday ? 0 : headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListEmptyComponent={
          <EmptyState
            title="No Events Planned"
            message="Browse the schedule and add sessions you want to attend."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
