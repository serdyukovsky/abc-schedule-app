const tintColorLight = "#007AFF";
const tintColorDark = "#0A84FF";

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: "#666666",
    textMuted: "rgba(0, 0, 0, 0.4)",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    link: "#007AFF",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#FAFAFA",
    backgroundSecondary: "#F2F2F2",
    backgroundTertiary: "#E5E5E5",
    separator: "#E5E5E5",
    conflict: "#FF3B30",
    nowIndicator: "#34C759",
    currentHighlight: "rgba(0, 122, 255, 0.1)",
    trackBadge: "#F0F0F0",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#999999",
    textMuted: "rgba(255, 255, 255, 0.4)",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: "#0A84FF",
    backgroundRoot: "#000000",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#38383A",
    separator: "#38383A",
    conflict: "#FF453A",
    nowIndicator: "#30D158",
    currentHighlight: "rgba(10, 132, 255, 0.15)",
    trackBadge: "#2C2C2E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
  cardPadding: 16,
  sectionGap: 24,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 34, lineHeight: 41, fontWeight: "600" as const },
  h2: { fontSize: 28, lineHeight: 34, fontWeight: "600" as const },
  h3: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
  h4: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
  body: { fontSize: 15, lineHeight: 20, fontWeight: "400" as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  timeLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  link: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
};

export const Fonts = {
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
  mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};
