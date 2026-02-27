import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { pb } from "@/lib/pb";
import { Event, EventRecord, TrackRecord, UserScheduleRecord, toEvent } from "@/lib/pb-types";

interface EventContextType {
  events: Event[];
  tracks: TrackRecord[];
  togglePlanned: (eventId: string) => void;
  getPlannedEvents: () => Event[];
  hasConflict: (event: Event) => Event | null;
  isLoading: boolean;
  eventDays: { date: Date; label: string; shortLabel: string }[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [rawEvents, setRawEvents] = useState<EventRecord[]>([]);
  const [tracks, setTracks] = useState<TrackRecord[]>([]);
  const [plannedIds, setPlannedIds] = useState<Set<string>>(new Set());
  const [scheduleRecords, setScheduleRecords] = useState<Map<string, string>>(new Map()); // eventId → scheduleRecordId
  const [isLoading, setIsLoading] = useState(true);

  // Load events and tracks (public, no auth needed)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsResult, tracksResult] = await Promise.all([
          pb.collection("events").getFullList<EventRecord>({
            expand: "speaker,track",
            sort: "startTime",
          }),
          pb.collection("tracks").getFullList<TrackRecord>({ sort: "name" }),
        ]);
        setRawEvents(eventsResult);
        setTracks(tracksResult);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Load user's planned events when auth changes
  useEffect(() => {
    const loadPlanned = async () => {
      if (!pb.authStore.isValid || !pb.authStore.record) {
        setPlannedIds(new Set());
        setScheduleRecords(new Map());
        return;
      }
      try {
        const userId = pb.authStore.record.id;
        const result = await pb.collection("user_schedules").getFullList<UserScheduleRecord>({
          filter: `user="${userId}"`,
        });
        const ids = new Set(result.map((r) => r.event));
        const records = new Map(result.map((r) => [r.event, r.id]));
        setPlannedIds(ids);
        setScheduleRecords(records);
      } catch (error) {
        console.error("Error loading planned events:", error);
      }
    };
    loadPlanned();

    const unsub = pb.authStore.onChange(() => {
      loadPlanned();
    });
    return () => unsub();
  }, []);

  // Convert raw events to flat Event type
  const events: Event[] = rawEvents.map((rec) => toEvent(rec, plannedIds));

  const togglePlanned = useCallback(
    async (eventId: string) => {
      if (!pb.authStore.isValid || !pb.authStore.record) return;
      const userId = pb.authStore.record.id;
      const isCurrentlyPlanned = plannedIds.has(eventId);

      // Optimistic update
      setPlannedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyPlanned) next.delete(eventId);
        else next.add(eventId);
        return next;
      });

      try {
        if (isCurrentlyPlanned) {
          const scheduleId = scheduleRecords.get(eventId);
          if (scheduleId) {
            await pb.collection("user_schedules").delete(scheduleId);
            setScheduleRecords((prev) => {
              const next = new Map(prev);
              next.delete(eventId);
              return next;
            });
          }
        } else {
          const record = await pb.collection("user_schedules").create({
            user: userId,
            event: eventId,
          });
          setScheduleRecords((prev) => new Map(prev).set(eventId, record.id));
        }
      } catch (error) {
        console.error("Error toggling planned:", error);
        // Revert optimistic update
        setPlannedIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlyPlanned) next.add(eventId);
          else next.delete(eventId);
          return next;
        });
      }
    },
    [plannedIds, scheduleRecords]
  );

  const getPlannedEvents = useCallback(
    () => events.filter((e) => e.isPlanned).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    [events]
  );

  const hasConflict = useCallback(
    (event: Event): Event | null => {
      for (const planned of events.filter((e) => e.isPlanned && e.id !== event.id)) {
        if (
          event.startTime.getTime() < planned.endTime.getTime() &&
          event.endTime.getTime() > planned.startTime.getTime()
        ) {
          return planned;
        }
      }
      return null;
    },
    [events]
  );

  // Compute unique event days from actual data
  const eventDays = React.useMemo(() => {
    const dayMap = new Map<string, Date>();
    for (const ev of rawEvents) {
      const d = new Date(ev.startTime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!dayMap.has(key)) dayMap.set(key, d);
    }
    return Array.from(dayMap.values())
      .sort((a, b) => a.getTime() - b.getTime())
      .map((date) => ({
        date,
        label: `${date.getDate()} ${date.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "")}`,
        shortLabel: String(date.getDate()),
      }));
  }, [rawEvents]);

  return (
    <EventContext.Provider value={{ events, tracks, togglePlanned, getPlannedEvents, hasConflict, isLoading, eventDays }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvents must be used within an EventProvider");
  return context;
}
