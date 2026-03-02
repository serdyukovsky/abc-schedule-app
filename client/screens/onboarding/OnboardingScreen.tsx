import React, { useState, useRef, useEffect } from "react";
import { useSafeAreaInsets } from "@/components/primitives";
import { pb } from "@/lib/pb";
import type { SpeakerRecord, TrackRecord } from "@/lib/pb-types";
import { useTelegram } from "@/hooks/useTelegram";
import Slide1Tracks from "./slides/Slide1Tracks";
import Slide2Speakers from "./slides/Slide2Speakers";
import Slide3Reminder from "./slides/Slide3Reminder";

interface Props {
  onDone: () => void;
}

const TOTAL = 3;
const TITLE_ROW_TOP = 62;

export default function OnboardingScreen({ onDone }: Props) {
  const [current, setCurrent] = useState(0);
  const [speakers, setSpeakers] = useState<SpeakerRecord[]>([]);
  const [tracks, setTracks] = useState<TrackRecord[]>([]);
  const insets = useSafeAreaInsets();
  const { hapticSelection } = useTelegram();
  const touchStartX = useRef<number | null>(null);
  const suppressClickUntil = useRef(0);

  useEffect(() => {
    Promise.all([
      pb.collection("speakers").getFullList<SpeakerRecord>(),
      pb.collection("tracks").getFullList<TrackRecord>({ sort: "name" }),
    ]).then(([s, t]) => {
      setSpeakers(s);
      setTracks(t);
    }).catch(() => {});
  }, []);

  const goNext = () => {
    if (current < TOTAL - 1) {
      hapticSelection();
      setCurrent((c) => c + 1);
    } else {
      onDone();
    }
  };

  const goPrev = () => {
    if (current > 0) {
      hapticSelection();
      setCurrent((c) => c - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    suppressClickUntil.current = Date.now() + 500;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 50) {
      suppressClickUntil.current = Date.now() + 700;
      if (delta < 0) goNext();
      else goPrev();
    }
  };

  // Use element-relative x (getBoundingClientRect) so it works
  // regardless of where the phone shell is positioned on screen.
  const handleTap = (e: React.MouseEvent) => {
    if (Date.now() < suppressClickUntil.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    if (x < w / 3) goPrev();
    else goNext();
  };

  const currentSlide =
    current === 0 ? <Slide1Tracks key="s1" tracks={tracks} /> :
    current === 1 ? <Slide2Speakers key="s2" speakers={speakers} /> :
                   <Slide3Reminder key="s3" />;

  return (
    <div
      style={{ position: "absolute", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", userSelect: "none" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
    >
      {currentSlide}

      {/* Progress indicator — centered at top, current segment is wider */}
      <div
        style={{
          position: "absolute",
          top: TITLE_ROW_TOP,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 5,
          alignItems: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? 40 : 14,
              height: 3,
              borderRadius: 2,
              backgroundColor: i <= current ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.25)",
              transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.2s",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Next / Done button — centered, auto width */}
      <div
        style={{
          position: "absolute",
          bottom: 28 + insets.bottom,
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            pointerEvents: "auto",
            height: 52,
            paddingLeft: 52,
            paddingRight: 52,
            borderRadius: 26,
            backgroundColor: "#d20729",
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
            fontFamily: "inherit",
            border: "none",
            cursor: "pointer",
            letterSpacing: 0.2,
          }}
          onClick={(e) => { e.stopPropagation(); goNext(); }}
        >
          {current < TOTAL - 1 ? "Далее →" : "К расписанию"}
        </button>
      </div>
    </div>
  );
}
