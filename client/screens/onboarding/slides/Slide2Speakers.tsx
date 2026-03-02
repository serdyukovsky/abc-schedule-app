import React, { useCallback, useEffect, useRef, useState } from "react";
import { pb } from "@/lib/pb";
import type { SpeakerRecord } from "@/lib/pb-types";

interface Props {
  speakers: SpeakerRecord[];
  topInset: number;
  bottomInset: number;
}

const TOP_SECTION_PADDING = 62;
const CONTENT_HORIZONTAL_PADDING = 22;

const AVATAR_COLORS = ["#d20729", "#2596be", "#ff6b35", "#4ecdc4", "#a18cd1", "#96ceb4", "#f7b731", "#26de81"];

const PLACEHOLDER_SPEAKERS: SpeakerRecord[] = [
  "Алексей Петров", "Мария Смирнова", "Дмитрий Козлов",
  "Анна Новикова", "Сергей Иванов", "Елена Морозова",
  "Павел Соколов", "Наталья Ким",
].map((name, i) => ({
  id: `p${i}`, collectionId: "", collectionName: "speakers",
  created: "", updated: "", name, photo: "", bio: "", role: "Спикер", company: "",
}));

const PREVIEW_CARDS = [
  { id: "c1", track: "Бизнес", title: "Стратегии роста: от стартапа к лидеру", location: "Зал A", time: "15:00", planned: true },
  { id: "c2", track: "Технологии", title: "ИИ в операциях компании", location: "Зал B", time: "14:00", planned: false },
  { id: "c3", track: "Лидерство", title: "Команда в период изменений", location: "Зал C", time: "14:30", planned: false },
  { id: "c4", track: "Маркетинг", title: "Digital-воронка без бюджетных потерь", location: "Зал B", time: "16:00", planned: false },
  { id: "c5", track: "Финансы", title: "Планирование бюджета на рост", location: "Зал D", time: "16:30", planned: false },
];

const STACK_LAYOUTS = [
  { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 5, opacity: 1 },
  { x: 0, y: 22, rotate: 0, scale: 0.976, zIndex: 4, opacity: 1 },
  { x: 0, y: 44, rotate: 0, scale: 0.952, zIndex: 3, opacity: 1 },
  { x: 0, y: 66, rotate: 0, scale: 0.928, zIndex: 2, opacity: 1 },
  { x: 0, y: 88, rotate: 0, scale: 0.904, zIndex: 1, opacity: 1 },
] as const;

const CYCLE_INTERVAL_MS = 2400;
const LEAVE_DURATION_MS = 720;
const INTRO_DROP_DURATION_MS = 620;
const INTRO_STAGGER_MS = 90;
const INTRO_TOTAL_MS = INTRO_DROP_DURATION_MS + INTRO_STAGGER_MS * (STACK_LAYOUTS.length - 1) + 120;

function buildPhotoUrl(s: SpeakerRecord): string | undefined {
  if (!s.photo || !s.collectionId) return undefined;
  return `${pb.baseURL}/api/files/${s.collectionId}/${s.id}/${s.photo}`;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Avatar({ speaker, size, idx }: { speaker: SpeakerRecord; size: number; idx: number }) {
  const url = buildPhotoUrl(speaker);
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  if (url) {
    return (
      <img
        src={url}
        alt={speaker.name}
        style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", border: "2px solid rgba(255,255,255,0.12)", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size / 2, backgroundColor: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px solid rgba(255,255,255,0.12)", flexShrink: 0,
      }}
    >
      <span style={{ color: "#fff", fontSize: Math.round(size * 0.36), fontWeight: 700 }}>{getInitials(speaker.name)}</span>
    </div>
  );
}

function CarouselCard({ speaker, idx }: { speaker: SpeakerRecord; idx: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: 68,
      }}
    >
      <Avatar speaker={speaker} size={66} idx={idx} />
    </div>
  );
}

function MockEventCard({
  track,
  title,
  location,
  time,
  planned,
  isFront,
  isLeaving,
  layout,
  leavingLayout,
  introDone,
  transitionsEnabled,
  introOrder,
  onIntroAnimationEnd,
}: {
  track: string;
  title: string;
  location: string;
  time: string;
  planned?: boolean;
  isFront: boolean;
  isLeaving: boolean;
  layout: (typeof STACK_LAYOUTS)[number];
  leavingLayout: { x: number; y: number; scale: number };
  introDone: boolean;
  transitionsEnabled: boolean;
  introOrder: number;
  onIntroAnimationEnd?: () => void;
}) {
  const targetTransform = isLeaving
    ? `translate(${leavingLayout.x}px, ${leavingLayout.y}px) scale(${leavingLayout.scale})`
    : `translate(${layout.x}px, ${layout.y}px) rotate(${layout.rotate}deg) scale(${layout.scale})`;
  const introAnimationStyle = !introDone
    ? ({
        "--stack-x": `${layout.x}px`,
        "--stack-y": `${layout.y}px`,
        "--stack-scale": String(layout.scale),
        animation: `cardStackDropIn ${INTRO_DROP_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
        animationDelay: `${introOrder * INTRO_STAGGER_MS}ms`,
      } as React.CSSProperties)
    : {};

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        transform: targetTransform,
        transformOrigin: "center top",
        background: "#151a2b",
        borderRadius: 14,
        border: "1px solid #2b324a",
        borderLeft: "3px solid #d20729",
        padding: "12px 14px",
        minHeight: 106,
        overflow: "hidden",
        boxShadow: isFront ? "0 14px 30px rgba(0,0,0,0.34)" : "0 10px 22px rgba(0,0,0,0.28)",
        zIndex: isLeaving ? 7 : layout.zIndex,
        opacity: layout.opacity,
        transition: transitionsEnabled
          ? isLeaving
            ? `transform ${LEAVE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 360ms ease`
            : "transform 480ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease, box-shadow 340ms ease"
          : "none",
        willChange: "transform, opacity",
        ...introAnimationStyle,
      }}
      onAnimationEnd={!introDone ? onIntroAnimationEnd : undefined}
    >
      <div style={{ marginBottom: 7 }}>
        <span
          style={{
            background: planned ? "rgba(210,7,41,0.2)" : "rgba(255,255,255,0.1)",
            color: planned ? "#ff6b83" : "rgba(255,255,255,0.58)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase" as const,
            borderRadius: 5,
            padding: "2px 6px",
          }}
        >
          {track}
        </span>
      </div>

      <div
        style={{
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: "19px",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "rgba(255,255,255,0.42)",
          fontSize: 11,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {location}
        </span>
        <span style={{ opacity: 0.55 }}>•</span>
        <span>{time}</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          {planned ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d20729" strokeWidth="2.2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <span style={{ display: "flex", alignItems: "center", animation: isFront ? "plusButtonPulse 1.8s ease-in-out infinite" : undefined }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export default function Slide2Speakers({ speakers, topInset, bottomInset }: Props) {
  const list = speakers.length >= 3 ? speakers : PLACEHOLDER_SPEAKERS;
  const [activeCard, setActiveCard] = useState(0);
  const [leavingCardId, setLeavingCardId] = useState<string | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  const topPadding = Math.max(TOP_SECTION_PADDING, topInset + 10);
  const bottomTextPadding = Math.max(196, 162 + bottomInset);
  const activeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const introResolvedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);
  const introTimeoutRef = useRef<number | null>(null);
  const settleRafRef = useRef<number | null>(null);

  // Duplicate list for seamless infinite carousel loop
  const row1 = [...list, ...list];
  const row2 = [...list, ...list].reverse();

  useEffect(() => {
    activeRef.current = activeCard;
  }, [activeCard]);

  const finishIntro = useCallback(() => {
    if (introResolvedRef.current) return;
    introResolvedRef.current = true;
    setIntroDone(true);
  }, []);

  useEffect(() => {
    introTimeoutRef.current = window.setTimeout(finishIntro, INTRO_TOTAL_MS + 200);

    return () => {
      if (introTimeoutRef.current !== null) window.clearTimeout(introTimeoutRef.current);
    };
  }, [finishIntro]);

  useEffect(() => {
    if (!introDone) return;
    settleRafRef.current = window.requestAnimationFrame(() => {
      settleRafRef.current = window.requestAnimationFrame(() => {
        setTransitionsEnabled(true);
      });
    });

    return () => {
      if (settleRafRef.current !== null) window.cancelAnimationFrame(settleRafRef.current);
    };
  }, [introDone]);

  useEffect(() => {
    if (!transitionsEnabled) return;
    intervalRef.current = window.setInterval(() => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      const current = activeRef.current;
      setLeavingCardId(PREVIEW_CARDS[current].id);

      leaveTimeoutRef.current = window.setTimeout(() => {
        setActiveCard((prev) => (prev + 1) % PREVIEW_CARDS.length);
        setLeavingCardId(null);
        isAnimatingRef.current = false;
      }, LEAVE_DURATION_MS + 80);
    }, CYCLE_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      if (leaveTimeoutRef.current !== null) window.clearTimeout(leaveTimeoutRef.current);
    };
  }, [transitionsEnabled]);

  return (
    <div
      style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, #0d0d1a 0%, #0f1325 100%)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute", top: "20%", left: "20%",
          width: 300, height: 200,
          background: "radial-gradient(ellipse, rgba(37,150,190,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Speaker carousel */}
      <div style={{ paddingTop: topPadding, position: "relative" }}>
        <div
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            color: "rgba(255,255,255,0.28)", textTransform: "uppercase" as const,
            paddingLeft: CONTENT_HORIZONTAL_PADDING, marginBottom: 12,
            position: "relative",
            zIndex: 20,
            animation: "fadeInUp 0.4s ease both",
          }}
        >
          Спикеры
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Row 1 → moves left */}
          <div style={{ overflow: "hidden", marginBottom: 8 }}>
            <div
              style={{
                display: "flex", gap: 8,
                width: "max-content",
                animation: "carouselLeft 22s linear infinite",
              }}
            >
              {row1.map((s, i) => (
                <CarouselCard key={i} speaker={s} idx={i % list.length} />
              ))}
            </div>
          </div>

          {/* Row 2 → moves right */}
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                display: "flex", gap: 8,
                width: "max-content",
                animation: "carouselRight 22s linear infinite",
              }}
            >
              {row2.map((s, i) => (
                <CarouselCard key={i} speaker={s} idx={(i + 3) % list.length} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event cards stack */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: 34,
          padding: `0 ${CONTENT_HORIZONTAL_PADDING}px`,
        }}
      >
        <div style={{ position: "relative", height: 340 }}>
          {PREVIEW_CARDS.map((card, cardIndex) => {
            const depth = (cardIndex - activeCard + PREVIEW_CARDS.length) % PREVIEW_CARDS.length;
            const layout = STACK_LAYOUTS[depth];
            const isFront = depth === 0;
            const isLeaving = card.id === leavingCardId;
            const tail = STACK_LAYOUTS[STACK_LAYOUTS.length - 1];
            const introOrder = STACK_LAYOUTS.length - 1 - depth;
            const isLastIntroCard = introOrder === STACK_LAYOUTS.length - 1;
            return (
              <MockEventCard
                key={card.id}
                track={card.track}
                title={card.title}
                location={card.location}
                time={card.time}
                planned={card.planned}
                isFront={isFront}
                isLeaving={isLeaving}
                layout={layout}
                leavingLayout={{ x: tail.x, y: tail.y + 74, scale: tail.scale * 0.9 }}
                introDone={introDone}
                transitionsEnabled={transitionsEnabled}
                introOrder={introOrder}
                onIntroAnimationEnd={isLastIntroCard ? finishIntro : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          padding: `2px 24px ${bottomTextPadding}px`,
          position: "relative",
          zIndex: 40,
          animation: "fadeInUp 0.5s ease both",
          animationDelay: "0.5s",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: "34px", marginBottom: 10 }}>
          Ваш личный<br />план
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: "22px" }}>
          Добавляйте интересные доклады одним касанием. Приложение покажет конфликты
        </div>
      </div>
    </div>
  );
}
