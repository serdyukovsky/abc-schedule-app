import React, { useState, useRef, useEffect } from "react";
import { useSafeAreaInsets } from "@/components/primitives";
import { pb } from "@/lib/pb";
import type { SpeakerRecord, TrackRecord } from "@/lib/pb-types";
import { useTelegram } from "@/hooks/useTelegram";
import { useTheme } from "@/hooks/useTheme";
import Slide1Tracks from "./slides/Slide1Tracks";
import Slide2Speakers from "./slides/Slide2Speakers";
import Slide3Reminder from "./slides/Slide3Reminder";

interface Props {
  onDone: () => void;
}

const TOTAL = 3;
const TITLE_ROW_TOP = 62;
const TAP_MOVE_THRESHOLD = 18;
const SWIPE_THRESHOLD = 56;

export default function OnboardingScreen({ onDone }: Props) {
  const [current, setCurrent] = useState(0);
  const [speakers, setSpeakers] = useState<SpeakerRecord[]>([]);
  const [tracks, setTracks] = useState<TrackRecord[]>([]);
  const insets = useSafeAreaInsets();
  const { hapticSelection } = useTelegram();
  const { theme, isDark } = useTheme();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
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

  const navigateByClientX = (clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const x = clientX - rect.left;
    const w = rect.width;
    if (x < w / 3) goPrev();
    else goNext();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStartRef.current.x;
    const deltaY = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Prevent ghost click after touch handling.
    suppressClickUntil.current = Date.now() + 420;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) goNext();
      else goPrev();
      return;
    }

    if (Math.abs(deltaX) <= TAP_MOVE_THRESHOLD && Math.abs(deltaY) <= TAP_MOVE_THRESHOLD) {
      navigateByClientX(t.clientX, e.currentTarget as HTMLElement);
    }
  };

  // Use element-relative x (getBoundingClientRect) so it works
  // regardless of where the phone shell is positioned on screen.
  const handleTap = (e: React.MouseEvent) => {
    if (Date.now() < suppressClickUntil.current) return;
    navigateByClientX(e.clientX, e.currentTarget as HTMLElement);
  };

  const progressTop = Math.max(TITLE_ROW_TOP, insets.top + 10);
  const buttonBottom = 24 + insets.bottom;

  const currentSlide =
    current === 0 ? <Slide1Tracks key="s1" tracks={tracks} topInset={insets.top} bottomInset={insets.bottom} isDark={isDark} /> :
    current === 1 ? <Slide2Speakers key="s2" speakers={speakers} topInset={insets.top} bottomInset={insets.bottom} isDark={isDark} /> :
                   <Slide3Reminder key="s3" topInset={insets.top} bottomInset={insets.bottom} isDark={isDark} />;

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
          top: progressTop,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 5,
          alignItems: "center",
          zIndex: 80,
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
              backgroundColor: i <= current
                ? (isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.72)")
                : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"),
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
          bottom: buttonBottom,
          left: 0,
          right: 0,
          zIndex: 120,
          pointerEvents: "auto",
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
            backgroundColor: theme.link,
            color: theme.buttonText,
            fontSize: 17,
            fontWeight: 600,
            fontFamily: "inherit",
            border: "none",
            cursor: "pointer",
            letterSpacing: 0.2,
            boxShadow: isDark ? "none" : "0 6px 18px rgba(210,7,41,0.28)",
          }}
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          onTouchEnd={(e) => { e.stopPropagation(); }}
        >
          {current < TOTAL - 1 ? "Далее →" : "К расписанию"}
        </button>
      </div>
    </div>
  );
}
