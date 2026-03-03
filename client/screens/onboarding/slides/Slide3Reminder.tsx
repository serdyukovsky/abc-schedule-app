import React from "react";

const PREVIEW_REMINDERS = [
  { id: "r1", title: "Стратегии роста бизнеса", speaker: "Алексей Петров", time: "15:00", location: "Зал A" },
  { id: "r2", title: "Лидерство в период изменений", speaker: "Мария Смирнова", time: "16:20", location: "Зал C" },
  { id: "r3", title: "AI в операционной модели компании", speaker: "Дмитрий Козлов", time: "17:10", location: "Зал B" },
] as const;

interface Props {
  topInset: number;
  bottomInset: number;
  isDark: boolean;
}

function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            background: color,
            animation: "tgTypingDot 1.08s ease-in-out infinite",
            animationDelay: `${dot * 120}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function Slide3Reminder({ topInset, bottomInset, isDark }: Props) {
  const topPadding = Math.max(88, topInset + 8);
  const bottomTextPadding = Math.max(160, 126 + bottomInset);
  const palette = isDark
    ? {
        background: "linear-gradient(170deg, #09101d 0%, #0b1020 100%)",
        ambient: "radial-gradient(circle at 16% 22%, rgba(55,129,181,0.18) 0%, transparent 42%), radial-gradient(circle at 86% 80%, rgba(210,7,41,0.12) 0%, transparent 44%)",
        overlay: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.8) 52%, rgba(0,0,0,0.34) 78%, rgba(0,0,0,0) 100%)",
        typingBubbleBg: "rgba(45,61,79,0.92)",
        bubbleBg: "rgba(45,61,79,0.95)",
        bubbleBorder: "rgba(255,255,255,0.12)",
        botName: "#66c3ff",
        dotColor: "rgba(216,228,240,0.82)",
        messageMain: "#eaf3ff",
        messageSub: "rgba(220,235,250,0.68)",
        timestamp: "rgba(220,235,250,0.42)",
        heading: "#fff",
        desc: "rgba(255,255,255,0.55)",
      }
    : {
        background: "linear-gradient(170deg, #f8fbff 0%, #edf3ff 100%)",
        ambient: "radial-gradient(circle at 16% 22%, rgba(55,129,181,0.12) 0%, transparent 44%), radial-gradient(circle at 86% 80%, rgba(210,7,41,0.08) 0%, transparent 46%)",
        overlay: "linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.84) 52%, rgba(255,255,255,0.32) 78%, rgba(255,255,255,0) 100%)",
        typingBubbleBg: "rgba(255,255,255,0.9)",
        bubbleBg: "rgba(255,255,255,0.92)",
        bubbleBorder: "rgba(15,23,42,0.12)",
        botName: "#1677c5",
        dotColor: "rgba(15,23,42,0.58)",
        messageMain: "#101828",
        messageSub: "rgba(15,23,42,0.72)",
        timestamp: "rgba(15,23,42,0.45)",
        heading: "#101828",
        desc: "rgba(15,23,42,0.62)",
      };

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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: palette.ambient,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 400,
          background: palette.overlay,
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Telegram-like incoming messages */}
      <div
        style={{
          flex: 1,
          padding: `${topPadding}px 20px 10px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          animation: "fadeInUp 0.42s ease both",
          animationDelay: "0.08s",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 368,
            margin: "0 auto",
            padding: "0 2px",
          }}
        >
          <div>
            <div
              style={{
                width: "fit-content",
                minWidth: 68,
                padding: "9px 12px",
                borderRadius: "16px 16px 16px 7px",
                background: palette.typingBubbleBg,
                border: `1px solid ${palette.bubbleBorder}`,
                marginBottom: 8,
                opacity: 0,
                animation: "tgTypingIn 220ms ease forwards, tgTypingOut 220ms ease forwards",
                animationDelay: "0.16s, 0.86s",
              }}
            >
              <TypingDots color={palette.dotColor} />
            </div>

            <div
              style={{
                fontSize: 12,
                color: palette.botName,
                fontWeight: 700,
                marginBottom: 4,
                opacity: 0,
                animation: "fadeInUp 300ms ease forwards",
                animationDelay: "1s",
              }}
            >
              ABC Bot
            </div>

            {PREVIEW_REMINDERS.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  width: "100%",
                  maxWidth: 336,
                  padding: "10px 12px 8px",
                  borderRadius: "17px 17px 17px 7px",
                  background: palette.bubbleBg,
                  border: `1px solid ${palette.bubbleBorder}`,
                  marginBottom: idx === PREVIEW_REMINDERS.length - 1 ? 0 : 8,
                  opacity: 0,
                  animation: "tgMessageIn 560ms cubic-bezier(0.22, 1, 0.36, 1) both",
                  animationDelay: `${1120 + idx * 980}ms`,
                }}
              >
                <div style={{ color: palette.messageMain, fontSize: 13, lineHeight: "18px", marginBottom: 6 }}>
                  Через 10 минут начнется выступление «{item.title}».
                </div>
                <div style={{ color: palette.messageSub, fontSize: 12, lineHeight: "16px", marginBottom: 2 }}>
                  Спикер: {item.speaker}
                </div>
                <div style={{ color: palette.messageSub, fontSize: 12, lineHeight: "16px" }}>
                  {item.time} · {item.location}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 10, color: palette.timestamp, marginTop: 7 }}>
                  сейчас
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          padding: `14px 24px ${bottomTextPadding}px`,
          position: "relative",
          zIndex: 4,
          animation: "fadeInUp 0.5s ease both",
          animationDelay: "0.56s",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: palette.heading, lineHeight: "34px", marginBottom: 10 }}>
          Напомним<br />в боте
        </div>
        <div style={{ fontSize: 15, color: palette.desc, lineHeight: "22px" }}>
          Получите сообщение за 10 минут до каждого выбранного выступления
        </div>
      </div>
    </div>
  );
}
