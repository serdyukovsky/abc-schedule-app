import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, useSafeAreaInsets } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";
import { useTelegram } from "@/hooks/useTelegram";
import { Spacing } from "@/constants/theme";
import { FilterChips } from "@/components/FilterChips";
import { DateSelector } from "@/components/DateSelector";
import { SearchBar } from "@/components/SearchBar";
import { TimeSlotRow } from "@/components/TimeSlotRow";
import { EmptyState } from "@/components/EmptyState";
import { ConflictModal } from "@/components/ConflictModal";
import { AppHeader } from "@/components/AppHeader";
import { AppMenu } from "@/components/AppMenu";
import { EventDetailsSheet } from "@/components/EventDetailsSheet";
import { Event } from "@/lib/pb-types";

interface TimeSlot { time: string; endTime?: string; events: Event[]; start: Date; end: Date }
interface DaySection { date: Date; dateLabel: string; slots: TimeSlot[] }

const formatTime = (date: Date) => date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
const formatDate = (date: Date) => date.toLocaleDateString("ru-RU", { weekday: "long", month: "short", day: "numeric" });
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const getDateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function MainScheduleScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { hapticImpact } = useTelegram();
  const { events, tracks: trackRecords, togglePlanned, hasConflict, getPlannedEvents, eventDays } = useEvents();

  const trackNames = useMemo(() => ["Все", ...trackRecords.map((t) => t.name)], [trackRecords]);

  const [selectedSegment, setSelectedSegment] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Auto-select first date when eventDays load
  const currentDate = selectedDate ?? eventDays[0]?.date ?? new Date();
  const [selectedTrack, setSelectedTrack] = useState("Все");
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);
  const [conflictingEvent, setConflictingEvent] = useState<Event | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const isScheduleView = selectedSegment === 0;
  const plannedEvents = getPlannedEvents();
  const activeEvent = useMemo(
    () => (activeEventId ? events.find((event) => event.id === activeEventId) ?? null : null),
    [activeEventId, events]
  );
  const activeEventConflict = useMemo(
    () => (activeEvent ? hasConflict(activeEvent) : null),
    [activeEvent, hasConflict]
  );

  const matchesSearch = (event: Event, q: string) => {
    if (!q.trim()) return true;
    const lq = q.toLowerCase().trim();
    return event.title.toLowerCase().includes(lq) || event.speakerName.toLowerCase().includes(lq) ||
      event.location.toLowerCase().includes(lq) || event.track.toLowerCase().includes(lq);
  };

  const filteredEvents = useMemo(() => events.filter((e) =>
    isSameDay(e.startTime, currentDate) &&
    (selectedTrack === "Все" || e.track === selectedTrack) &&
    matchesSearch(e, searchQuery)
  ), [events, currentDate, selectedTrack, searchQuery]);

  const buildSlots = (evts: Event[]): TimeSlot[] => {
    const grouped: Record<string, Event[]> = {};
    evts.forEach((e) => { const k = formatTime(e.startTime); if (!grouped[k]) grouped[k] = []; grouped[k].push(e); });
    return Object.keys(grouped).sort().map((time) => {
      const slotEvts = grouped[time];
      const earliest = slotEvts.reduce((l, e) => e.startTime < l ? e.startTime : l, slotEvts[0].startTime);
      const latest = slotEvts.reduce((l, e) => e.endTime > l ? e.endTime : l, slotEvts[0].endTime);
      return { time, endTime: formatTime(latest), events: slotEvts, start: earliest, end: latest };
    });
  };

  const scheduleTimeSlots = useMemo(() => buildSlots(filteredEvents), [filteredEvents]);


  const myScheduleSections = useMemo((): DaySection[] => {
    const byDay: Record<string, Event[]> = {};
    plannedEvents.forEach((e) => { const k = getDateKey(e.startTime); if (!byDay[k]) byDay[k] = []; byDay[k].push(e); });
    return Object.keys(byDay).sort().map((k) => {
      const dayEvts = byDay[k];
      return { date: dayEvts[0].startTime, dateLabel: formatDate(dayEvts[0].startTime), slots: buildSlots(dayEvts) };
    });
  }, [plannedEvents]);

  const handleEventPress = useCallback((event: Event) => {
    hapticImpact("medium");
    setActiveEventId(event.id);
  }, []);

  const handleCloseEventSheet = useCallback(() => {
    setActiveEventId(null);
  }, []);

  const handleTogglePlanned = useCallback((eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    if (!event.isPlanned) {
      const conflict = hasConflict(event);
      if (conflict) { setPendingEvent(event); setConflictingEvent(conflict); setConflictModalVisible(true); return; }
    }
    togglePlanned(eventId);
  }, [events, hasConflict, togglePlanned]);


  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <AppHeader selectedSegment={selectedSegment} onSelectSegment={setSelectedSegment} topInset={insets.top} />

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingTop: 52 + insets.top, paddingBottom: 90 + insets.bottom }} showsVerticalScrollIndicator={false}>
        {isScheduleView ? (
          <>
            <FilterChips options={trackNames} selected={selectedTrack} onSelect={setSelectedTrack} />
            <View style={styles.scheduleSlotsContainer}>
              <View pointerEvents="none" style={[styles.timelineRail, { backgroundColor: theme.separator }]} />
              {scheduleTimeSlots.length > 0 ? scheduleTimeSlots.map((slot, i) => (
                <View key={slot.time}>
                  {i > 0 ? <View style={[styles.slotDivider, { backgroundColor: theme.separator }]} /> : null}
                  <TimeSlotRow
                    time={slot.time}
                    endTime={slot.endTime}
                    events={slot.events}
                    onEventPress={handleEventPress}
                    onTogglePlanned={handleTogglePlanned}
                    hasConflict={hasConflict}
                  />
                </View>
              )) : (
                <EmptyState title={searchQuery ? "Ничего не найдено" : "Нет событий"} message={searchQuery ? `По запросу «${searchQuery}» ничего не найдено.` : `Нет событий на этот день${selectedTrack !== "Все" ? ` в категории ${selectedTrack}` : ""}.`} />
              )}
            </View>
          </>
        ) : (
          <>
            {myScheduleSections.length > 0 ? myScheduleSections.map((section, si) => (
              <View key={section.dateLabel}>
                <View style={[styles.dateHeader, { borderBottomColor: theme.separator }]}>
                  <Text style={[styles.dateLabel, { color: theme.text }]}>{section.dateLabel}</Text>
                </View>
                {section.slots.map((slot, slotI) => (
                  <View key={slot.time}>
                    {slotI > 0 ? <View style={[styles.slotDivider, { backgroundColor: theme.separator }]} /> : null}
                    <TimeSlotRow time={slot.time} endTime={slot.endTime} events={slot.events} onEventPress={handleEventPress} onTogglePlanned={handleTogglePlanned} hasConflict={hasConflict} showSwipeActions={false} />
                  </View>
                ))}
                {si < myScheduleSections.length - 1 ? <View style={[styles.sectionDivider, { backgroundColor: theme.separator }]} /> : null}
              </View>
            )) : (
              <EmptyState title="Нет запланированных событий" message="Нажмите + на карточке события, чтобы добавить его сюда." />
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomSelector, { paddingBottom: Spacing.sm + insets.bottom }]}>
        {isSearching ? (
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} onClose={() => { setIsSearching(false); setSearchQuery(""); }} />
        ) : (
          <DateSelector
            dates={eventDays}
            selectedDate={currentDate}
            onSelect={(d) => { setSelectedDate(d); if (!isScheduleView) setSelectedSegment(0); }}
            onSearchPress={() => { if (!isScheduleView) setSelectedSegment(0); setIsSearching(true); }}
            isSearchActive={isSearching}
            onMenuPress={() => setMenuVisible(true)}
          />
        )}
      </View>

      <EventDetailsSheet
        visible={Boolean(activeEvent)}
        event={activeEvent}
        conflictingEvent={activeEventConflict}
        onClose={handleCloseEventSheet}
        onTogglePlanned={handleTogglePlanned}
      />

      <AppMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <ConflictModal
        visible={conflictModalVisible}
        newEvent={pendingEvent}
        conflictingEvent={conflictingEvent}
        onReplace={() => { if (pendingEvent && conflictingEvent) { togglePlanned(conflictingEvent.id); togglePlanned(pendingEvent.id); } setConflictModalVisible(false); setPendingEvent(null); setConflictingEvent(null); }}
        onKeepBoth={() => { if (pendingEvent) togglePlanned(pendingEvent.id); setConflictModalVisible(false); setPendingEvent(null); setConflictingEvent(null); }}
        onCancel={() => { setConflictModalVisible(false); setPendingEvent(null); setConflictingEvent(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  scrollView: { flex: 1 },
  scheduleSlotsContainer: { position: "relative" },
  timelineRail: { position: "absolute", left: Spacing.lg + 56, top: 0, bottom: 0, width: 1 },
  slotDivider: { height: 1, marginLeft: 72 + Spacing.lg, marginRight: Spacing.lg },
  dateHeader: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  dateLabel: { fontSize: 16, fontWeight: "600" },
  sectionDivider: { height: 8, marginVertical: Spacing.md },
  bottomSelector: { position: "absolute", left: 0, right: 0, bottom: 0, paddingBottom: Spacing.sm, zIndex: 10 },
});
