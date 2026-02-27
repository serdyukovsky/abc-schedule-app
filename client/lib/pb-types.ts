import type { RecordModel } from "pocketbase";
import { pb } from "./pb";

export interface SpeakerRecord extends RecordModel {
  name: string;
  photo: string;
  bio: string;
  role: string;
  company: string;
}

export interface TrackRecord extends RecordModel {
  name: string;
  color: string;
}

export interface EventRecord extends RecordModel {
  title: string;
  description: string;
  speaker: string;
  track: string;
  location: string;
  startTime: string;
  endTime: string;
  topics: string[];
  subtitle: string;
  expand?: {
    speaker?: SpeakerRecord;
    track?: TrackRecord;
  };
}

export interface UserScheduleRecord extends RecordModel {
  user: string;
  event: string;
  expand?: {
    event?: EventRecord & {
      expand?: {
        speaker?: SpeakerRecord;
        track?: TrackRecord;
      };
    };
  };
}

// Flat event type used by UI components (same shape as the old mock Event)
export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  speakerName: string;
  speakerRole: string;
  speakerPhoto?: string;
  track: string;
  trackColor?: string;
  location: string;
  startTime: Date;
  endTime: Date;
  description: string;
  topics: string[];
  isPlanned: boolean;
}

// PocketBase stores dates as UTC. We treat them as local conference time —
// strip the Z suffix so JS Date doesn't apply timezone offset.
function parseUTCAsLocal(dateStr: string): Date {
  return new Date(dateStr.replace("Z", "").replace(" ", "T"));
}

function buildPhotoUrl(speaker: SpeakerRecord | undefined): string | undefined {
  if (!speaker?.photo || !speaker.collectionId) return undefined;
  return `${pb.baseURL}/api/files/${speaker.collectionId}/${speaker.id}/${speaker.photo}`;
}

// Convert PocketBase EventRecord (with expanded relations) to flat Event
export function toEvent(
  rec: EventRecord,
  plannedEventIds: Set<string>
): Event {
  const speaker = rec.expand?.speaker;
  const track = rec.expand?.track;
  return {
    id: rec.id,
    title: rec.title,
    subtitle: rec.subtitle || undefined,
    speakerName: speaker?.name ?? "",
    speakerRole: speaker ? [speaker.role, speaker.company].filter(Boolean).join(", ") : "",
    speakerPhoto: buildPhotoUrl(speaker),
    track: track?.name ?? "",
    trackColor: track?.color || undefined,
    location: rec.location,
    startTime: parseUTCAsLocal(rec.startTime),
    endTime: parseUTCAsLocal(rec.endTime),
    description: rec.description || "",
    topics: Array.isArray(rec.topics) ? rec.topics : [],
    isPlanned: plannedEventIds.has(rec.id),
  };
}
