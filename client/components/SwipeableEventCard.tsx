import React from "react";
import { EventCard } from "@/components/EventCard";
import { Event } from "@/lib/pb-types";

interface SwipeableEventCardProps {
  event: Event;
  onPress: () => void;
  onTogglePlanned: () => void;
  isPast?: boolean;
  isCurrent?: boolean;
  hasConflict?: boolean;
}

// On web there's no swipe gesture; EventCard with its button is sufficient
export function SwipeableEventCard(props: SwipeableEventCardProps) {
  return <EventCard {...props} showActions={true} />;
}
