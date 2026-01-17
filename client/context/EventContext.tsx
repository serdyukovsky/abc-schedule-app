import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event, mockEvents } from "@/data/mockEvents";

interface EventContextType {
  events: Event[];
  togglePlanned: (eventId: string) => void;
  getPlannedEvents: () => Event[];
  hasConflict: (event: Event) => Event | null;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_KEY = "abc_events_state";

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventsState();
  }, []);

  const loadEventsState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedState: { [id: string]: { isPlanned: boolean } } = JSON.parse(stored);
        setEvents(prevEvents =>
          prevEvents.map(event => ({
            ...event,
            isPlanned: savedState[event.id]?.isPlanned ?? event.isPlanned,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading events state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEventsState = async (updatedEvents: Event[]) => {
    try {
      const stateToSave: { [id: string]: { isPlanned: boolean } } = {};
      updatedEvents.forEach(event => {
        stateToSave[event.id] = { isPlanned: event.isPlanned };
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving events state:", error);
    }
  };

  const togglePlanned = (eventId: string) => {
    setEvents(prevEvents => {
      const updated = prevEvents.map(event =>
        event.id === eventId ? { ...event, isPlanned: !event.isPlanned } : event
      );
      saveEventsState(updated);
      return updated;
    });
  };

  const getPlannedEvents = () => {
    return events
      .filter(event => event.isPlanned)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const hasConflict = (event: Event): Event | null => {
    const plannedEvents = events.filter(e => e.isPlanned && e.id !== event.id);
    for (const planned of plannedEvents) {
      const eventStart = event.startTime.getTime();
      const eventEnd = event.endTime.getTime();
      const plannedStart = planned.startTime.getTime();
      const plannedEnd = planned.endTime.getTime();

      if (eventStart < plannedEnd && eventEnd > plannedStart) {
        return planned;
      }
    }
    return null;
  };

  return (
    <EventContext.Provider
      value={{
        events,
        togglePlanned,
        getPlannedEvents,
        hasConflict,
        isLoading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}
