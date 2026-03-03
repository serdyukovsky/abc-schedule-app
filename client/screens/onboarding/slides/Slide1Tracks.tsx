import React, { useEffect, useMemo, useState } from "react";
import type { TrackRecord } from "@/lib/pb-types";

interface Props {
  tracks: TrackRecord[];
  topInset: number;
  bottomInset: number;
  isDark: boolean;
}

const TOP_SECTION_PADDING = 62;
const CONTENT_HORIZONTAL_PADDING = 22;

const PLACEHOLDER_TRACKS: TrackRecord[] = [
  { id: "p1", collectionId: "", collectionName: "tracks", created: "", updated: "", name: "Бизнес", color: "#d20729" },
  { id: "p2", collectionId: "", collectionName: "tracks", created: "", updated: "", name: "Маркетинг", color: "#ff6b35" },
  { id: "p3", collectionId: "", collectionName: "tracks", created: "", updated: "", name: "Стратегия", color: "#4ecdc4" },
  { id: "p4", collectionId: "", collectionName: "tracks", created: "", updated: "", name: "Карьера", color: "#45b7d1" },
  { id: "p5", collectionId: "", collectionName: "tracks", created: "", updated: "", name: "Мастер-классы", color: "#a18cd1" },
  { id: "p6", collectionId: "", collectionName: "tracks", created: "", updated: "", name: "Нетворкинг", color: "#96ceb4" },
];

const PREVIEW_TEMPLATES = [
  { title: "Growth-стратегии для B2B-компаний", speaker: "Алексей Петров", location: "Зал A" },
  { title: "Digital-воронка без бюджетных потерь", speaker: "Мария Смирнова", location: "Зал B" },
  { title: "План роста на 12 месяцев", speaker: "Дмитрий Козлов", location: "Зал C" },
  { title: "Личная эффективность руководителя", speaker: "Анна Новикова", location: "Зал D" },
  { title: "Практический воркшоп по продажам", speaker: "Сергей Иванов", location: "Зал E" },
  { title: "Сильные связи для новых проектов", speaker: "Елена Морозова", location: "Зал F" },
];

export default function Slide1Tracks({ tracks, topInset, bottomInset, isDark }: Props) {
  const list = tracks.length > 0 ? tracks : PLACEHOLDER_TRACKS;
  const displayTracks = list.slice(0, 7);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const topPadding = Math.max(TOP_SECTION_PADDING, topInset + 10);
  const bottomTextPadding = Math.max(160, 126 + bottomInset);
  const palette = isDark
    ? {
        background: "#090910",
        ambient: "radial-gradient(ellipse, rgba(210,7,41,0.14) 0%, transparent 68%)",
        overline: "rgba(255,255,255,0.28)",
        chipText: "rgba(255,255,255,0.6)",
        chipBg: "rgba(255,255,255,0.07)",
        chipBorder: "rgba(255,255,255,0.1)",
        selectedBg: "#d20729",
        selectedBorder: "rgba(210,7,41,0.6)",
        previewBg: "rgba(255,255,255,0.05)",
        previewBorder: "rgba(255,255,255,0.08)",
        badgeBg: "rgba(210,7,41,0.18)",
        badgeText: "#ff5570",
        title: "#fff",
        meta: "rgba(255,255,255,0.45)",
        location: "rgba(255,255,255,0.3)",
        avatarBg: "rgba(255,255,255,0.15)",
        avatarText: "rgba(255,255,255,0.5)",
        bottomTitle: "#fff",
        bottomDesc: "rgba(255,255,255,0.55)",
      }
    : {
        background: "linear-gradient(170deg, #f7f9ff 0%, #edf2ff 100%)",
        ambient: "radial-gradient(ellipse, rgba(210,7,41,0.1) 0%, transparent 70%)",
        overline: "rgba(15,23,42,0.5)",
        chipText: "rgba(15,23,42,0.74)",
        chipBg: "rgba(255,255,255,0.74)",
        chipBorder: "rgba(15,23,42,0.12)",
        selectedBg: "#d20729",
        selectedBorder: "rgba(210,7,41,0.56)",
        previewBg: "rgba(255,255,255,0.86)",
        previewBorder: "rgba(15,23,42,0.12)",
        badgeBg: "rgba(210,7,41,0.14)",
        badgeText: "#c30a28",
        title: "#101828",
        meta: "rgba(15,23,42,0.64)",
        location: "rgba(15,23,42,0.54)",
        avatarBg: "rgba(15,23,42,0.12)",
        avatarText: "rgba(15,23,42,0.55)",
        bottomTitle: "#101828",
        bottomDesc: "rgba(15,23,42,0.62)",
      };

  useEffect(() => {
    if (displayTracks.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveTrackIndex((prev) => (prev + 1) % displayTracks.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [displayTracks.length]);

  useEffect(() => {
    if (displayTracks.length === 0) return;
    setActiveTrackIndex((prev) => prev % displayTracks.length);
  }, [displayTracks.length]);

  const activeTrack = displayTracks[activeTrackIndex] ?? displayTracks[0];
  const preview = useMemo(
    () => PREVIEW_TEMPLATES[activeTrackIndex % PREVIEW_TEMPLATES.length],
    [activeTrackIndex]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: palette.background,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow blob */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 340,
          height: 220,
          background: palette.ambient,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingTop: topPadding,
          paddingLeft: CONTENT_HORIZONTAL_PADDING,
          paddingRight: CONTENT_HORIZONTAL_PADDING,
        }}
      >

        {/* Overline */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: palette.overline,
            textTransform: "uppercase",
            marginBottom: 12,
            animation: "fadeInUp 0.4s ease both",
          }}
        >
          Треки форума
        </div>

        {/* Chip cloud */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {displayTracks.map((track, i) => {
            const isSelected = i === activeTrackIndex;
            return (
              <div
                key={track.id}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "#fff" : palette.chipText,
                  backgroundColor: isSelected ? palette.selectedBg : palette.chipBg,
                  border: `1px solid ${isSelected ? palette.selectedBorder : palette.chipBorder}`,
                  transform: isSelected ? "translateY(-1px)" : "translateY(0)",
                  animation: isSelected
                    ? "fadeInUp 0.45s ease both, chipGlow 2.5s ease-in-out infinite"
                    : "fadeInUp 0.45s ease both",
                  animationDelay: `${i * 0.07}s, ${i * 0.07 + 0.6}s`,
                  transition: "background-color 320ms ease, color 320ms ease, border-color 320ms ease, transform 320ms ease",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {track.name}
              </div>
            );
          })}
        </div>

        {/* Mini EventCard preview */}
        <div
          key={`preview-${activeTrack?.id ?? activeTrackIndex}`}
          style={{
            marginTop: 28,
            background: palette.previewBg,
            borderRadius: 12,
            border: `1px solid ${palette.previewBorder}`,
            borderLeft: "3px solid #d20729",
            padding: "13px 14px",
            animation: "slideInFromRight 0.42s ease both",
          }}
        >
          <div style={{ marginBottom: 7 }}>
            <span
              style={{
                background: palette.badgeBg,
                color: palette.badgeText,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase" as const,
                borderRadius: 5,
                padding: "3px 7px",
              }}
            >
              {activeTrack?.name ?? "Трек"}
            </span>
          </div>
          <div style={{ color: palette.title, fontSize: 14, fontWeight: 600, lineHeight: "19px", marginBottom: 8 }}>
            {preview.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: palette.meta,
                fontSize: 12,
              }}
            >
              {/* Speaker placeholder */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: palette.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  fontWeight: 700,
                  color: palette.avatarText,
                }}
              >
                АП
              </div>
              {preview.speaker}
            </div>
            <div style={{ color: palette.location, fontSize: 11, marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {preview.location}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          padding: `24px 24px ${bottomTextPadding}px`,
          animation: "fadeInUp 0.5s ease both",
          animationDelay: "0.6s",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: palette.bottomTitle, lineHeight: "34px", marginBottom: 10 }}>
          Все треки<br />под рукой
        </div>
        <div style={{ fontSize: 15, color: palette.bottomDesc, lineHeight: "22px" }}>
          Выберите интересный трек и стройте программу дня под свои цели
        </div>
      </div>
    </div>
  );
}
