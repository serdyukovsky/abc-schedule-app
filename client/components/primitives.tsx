import React, { CSSProperties, ReactNode, forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── Style merging ────────────────────────────────────────────────────────────

type RNStyleProp = Record<string, any> | null | undefined | false | RNStyleProp[];

function convertRNStyle(style: Record<string, any>): CSSProperties {
  const {
    paddingHorizontal,
    paddingVertical,
    marginHorizontal,
    marginVertical,
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation,
    ...rest
  } = style;

  const converted: CSSProperties = { ...(rest as CSSProperties) };

  // React Native lineHeight is in pixels; CSS lineHeight without a unit is a multiplier.
  // React intentionally does NOT add 'px' to lineHeight, so we must do it manually.
  if (typeof rest.lineHeight === "number") {
    converted.lineHeight = `${rest.lineHeight}px`;
  }

  // Shorthands apply only when the specific property is not explicitly set (RN priority: specific > shorthand)
  if (paddingHorizontal !== undefined) {
    if (rest.paddingLeft == null) converted.paddingLeft = paddingHorizontal;
    if (rest.paddingRight == null) converted.paddingRight = paddingHorizontal;
  }
  if (paddingVertical !== undefined) {
    if (rest.paddingTop == null) converted.paddingTop = paddingVertical;
    if (rest.paddingBottom == null) converted.paddingBottom = paddingVertical;
  }
  if (marginHorizontal !== undefined) {
    if (rest.marginLeft == null) converted.marginLeft = marginHorizontal;
    if (rest.marginRight == null) converted.marginRight = marginHorizontal;
  }
  if (marginVertical !== undefined) {
    if (rest.marginTop == null) converted.marginTop = marginVertical;
    if (rest.marginBottom == null) converted.marginBottom = marginVertical;
  }
  if (shadowColor && shadowOpacity !== undefined) {
    const ox = shadowOffset?.width ?? 0;
    const oy = shadowOffset?.height ?? 1;
    const blur = shadowRadius ?? 2;
    const r = parseInt(shadowColor.slice(1, 3) || "0", 16);
    const g = parseInt(shadowColor.slice(3, 5) || "0", 16);
    const b = parseInt(shadowColor.slice(5, 7) || "0", 16);
    converted.boxShadow = `${ox}px ${oy}px ${blur}px rgba(${r},${g},${b},${shadowOpacity})`;
  }

  // CSS requires borderStyle for borders to show (RN defaults to 'solid').
  // Only apply per-side to avoid black borders on sides without explicit width.
  if (!rest.borderStyle) {
    if (rest.borderWidth != null) {
      converted.borderStyle = "solid";
    } else {
      if (rest.borderTopWidth != null) (converted as any).borderTopStyle = "solid";
      if (rest.borderBottomWidth != null) (converted as any).borderBottomStyle = "solid";
      if (rest.borderLeftWidth != null) (converted as any).borderLeftStyle = "solid";
      if (rest.borderRightWidth != null) (converted as any).borderRightStyle = "solid";
    }
  }

  return converted;
}

export function mergeStyles(...styles: RNStyleProp[]): CSSProperties {
  const flat = styles.flat(Infinity as any).filter(Boolean) as Record<string, any>[];
  if (flat.length === 0) return {};
  if (flat.length === 1) return convertRNStyle(flat[0]);
  return Object.assign({}, ...flat.map(convertRNStyle));
}

// StyleSheet shim — just returns the styles as-is
export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
};

// Platform shim
export const Platform = {
  OS: "web" as const,
  select: function<T>(obj: { web?: T; ios?: T; android?: T; default?: T }): T {
    return (obj.web ?? obj.default) as T;
  },
};

// Keyboard shim
export const Keyboard = {
  dismiss: () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  },
  addListener: (_event: string, _handler: (...args: any[]) => void) => ({
    remove: () => {},
  }),
};

// Alert shim — inline errors are preferred, but this is a fallback
export const Alert = {
  alert: (title: string, message?: string, _buttons?: any[]) => {
    console.warn(`[Alert] ${title}: ${message ?? ""}`);
  },
};

// Linking shim
export const Linking = {
  openURL: (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    return Promise.resolve();
  },
};

// ─── View ─────────────────────────────────────────────────────────────────────

interface ViewProps {
  style?: RNStyleProp;
  children?: ReactNode;
  testID?: string;
  [key: string]: any;
}

export const View = forwardRef<HTMLDivElement, ViewProps>(
  ({ style, children, testID, ...rest }, ref) => {
    const { onClick, onPress, hitSlop, accessibilityRole, accessibilityLabel, ...divProps } = rest;
    return (
      <div
        ref={ref}
        data-testid={testID}
        style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", ...mergeStyles(style) }}
        {...divProps}
      >
        {children}
      </div>
    );
  }
);
View.displayName = "View";

// ─── SafeAreaView ─────────────────────────────────────────────────────────────

export const SafeAreaView = View;

// ─── Text ─────────────────────────────────────────────────────────────────────

interface TextProps {
  style?: RNStyleProp;
  children?: ReactNode;
  numberOfLines?: number;
  ellipsizeMode?: string;
  testID?: string;
  [key: string]: any;
}

export const Text = forwardRef<HTMLDivElement, TextProps>(
  ({ style, children, numberOfLines, testID, ellipsizeMode: _e, ...rest }, ref) => {
    const clampStyle: CSSProperties =
      numberOfLines === 1
        ? { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }
        : numberOfLines && numberOfLines > 1
        ? {
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: numberOfLines,
            WebkitBoxOrient: "vertical" as any,
          }
        : {};

    const { onClick, onPress, hitSlop, accessibilityRole, accessibilityLabel, ...divProps } = rest;
    return (
      <div
        ref={ref}
        data-testid={testID}
        style={{ boxSizing: "border-box", ...mergeStyles(style), ...clampStyle }}
        {...divProps}
      >
        {children}
      </div>
    );
  }
);
Text.displayName = "Text";

// ─── Pressable ────────────────────────────────────────────────────────────────

interface PressableProps {
  style?: RNStyleProp | ((state: { pressed: boolean }) => RNStyleProp);
  children?: ReactNode | ((state: { pressed: boolean }) => ReactNode);
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  hitSlop?: any;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  [key: string]: any;
}

const BUTTON_RESET: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "inherit",
  color: "inherit",
  textAlign: "left",
  WebkitAppearance: "none" as any,
  appearance: "none" as any,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

export function Pressable({
  style,
  children,
  onPress,
  disabled,
  testID,
  hitSlop: _h,
  accessibilityRole: _ar,
  accessibilityLabel,
  ...rest
}: PressableProps) {
  const resolvedStyle = typeof style === "function" ? style({ pressed: false }) : style;
  return (
    <button
      data-testid={testID}
      aria-label={accessibilityLabel}
      disabled={disabled}
      onClick={onPress}
      style={{ ...BUTTON_RESET, ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}), ...mergeStyles(resolvedStyle) }}
      {...rest}
    >
      {typeof children === "function" ? children({ pressed: false }) : children}
    </button>
  );
}

// ─── ScrollView ───────────────────────────────────────────────────────────────

interface ScrollViewProps {
  style?: RNStyleProp;
  contentContainerStyle?: RNStyleProp;
  children?: ReactNode;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: string;
  scrollIndicatorInsets?: any;
  testID?: string;
  [key: string]: any;
}

export const ScrollView = forwardRef<HTMLDivElement, ScrollViewProps>(
  (
    {
      style,
      contentContainerStyle,
      children,
      horizontal,
      showsVerticalScrollIndicator: _sv,
      showsHorizontalScrollIndicator: _sh,
      keyboardShouldPersistTaps: _kp,
      scrollIndicatorInsets: _si,
      testID,
      ...rest
    },
    ref
  ) => {
    const outerStyle: CSSProperties = horizontal
      ? { overflowX: "auto", overflowY: "hidden", display: "flex", flexDirection: "row" }
      : { overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", flex: 1 };

    const innerStyle: CSSProperties = horizontal
      ? { display: "flex", flexDirection: "row", flexShrink: 0 }
      : { display: "flex", flexDirection: "column", flexShrink: 0 };

    return (
      <div
        ref={ref}
        data-testid={testID}
        style={{ boxSizing: "border-box", ...outerStyle, ...mergeStyles(style) }}
        {...rest}
      >
        <div style={{ boxSizing: "border-box", ...innerStyle, ...mergeStyles(contentContainerStyle) }}>
          {children}
        </div>
      </div>
    );
  }
);
ScrollView.displayName = "ScrollView";

// ─── TextInput ────────────────────────────────────────────────────────────────

interface TextInputProps {
  style?: RNStyleProp;
  value?: string;
  onChangeText?: (text: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  keyboardType?: string;
  autoCapitalize?: string;
  autoCorrect?: boolean;
  textContentType?: string;
  returnKeyType?: string;
  editable?: boolean;
  autoFocus?: boolean;
  testID?: string;
  [key: string]: any;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      style,
      value,
      onChangeText,
      onChange,
      placeholder,
      placeholderTextColor: _ptc,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      textContentType,
      returnKeyType: _rk,
      editable = true,
      autoFocus,
      testID,
      ...rest
    },
    ref
  ) => {
    const inputType =
      secureTextEntry
        ? "password"
        : keyboardType === "email-address"
        ? "email"
        : keyboardType === "phone-pad"
        ? "tel"
        : keyboardType === "numeric"
        ? "number"
        : "text";

    const autoCompleteMap: Record<string, string> = {
      emailAddress: "email",
      password: "current-password",
      telephoneNumber: "tel",
      username: "username",
    };

    return (
      <input
        ref={ref}
        type={inputType}
        value={value}
        placeholder={placeholder}
        disabled={!editable}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect === false ? "off" : undefined}
        autoComplete={textContentType ? autoCompleteMap[textContentType] ?? "off" : undefined}
        data-testid={testID}
        onChange={(e) => {
          onChangeText?.(e.target.value);
          onChange?.(e);
        }}
        style={{
          boxSizing: "border-box",
          fontFamily: "inherit",
          outline: "none",
          ...mergeStyles(style),
        }}
        {...rest}
      />
    );
  }
);
TextInput.displayName = "TextInput";

// ─── KeyboardAvoidingView ─────────────────────────────────────────────────────

export function KeyboardAvoidingView({ style, children, behavior: _b, ...rest }: ViewProps & { behavior?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", ...mergeStyles(style) }} {...rest}>
      {children}
    </div>
  );
}

// ─── ActivityIndicator ────────────────────────────────────────────────────────

interface ActivityIndicatorProps {
  size?: "small" | "large" | number;
  color?: string;
  style?: RNStyleProp;
}

export function ActivityIndicator({ size = "small", color = "#d20729", style }: ActivityIndicatorProps) {
  const px = size === "large" ? 36 : size === "small" ? 20 : size;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", ...mergeStyles(style) }}>
      <div
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          border: `3px solid ${color}33`,
          borderTopColor: color,
          animation: "spin 0.7s linear infinite",
        }}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  visible: boolean;
  transparent?: boolean;
  animationType?: string;
  onRequestClose?: () => void;
  children?: ReactNode;
}

export function Modal({ visible, children, onRequestClose }: ModalProps) {
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, onRequestClose]);

  if (!visible) return null;

  // Portal into .phone-shell so the overlay is scoped to the app area, not the full viewport
  const container = document.querySelector(".phone-shell") ?? document.body;

  return createPortal(
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>,
    container
  );
}

// ─── useSafeAreaInsets shim ───────────────────────────────────────────────────

export function useSafeAreaInsets() {
  const read = () => {
    if (typeof window === "undefined") return { top: 0, bottom: 0, left: 0, right: 0 };

    const rootStyle = window.getComputedStyle(document.documentElement);
    const cssInset = (name: string) => {
      const raw = rootStyle.getPropertyValue(name).trim();
      const parsed = Number.parseFloat(raw);
      return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    };

    const cssTop = cssInset("--safe-area-top");
    const cssRight = cssInset("--safe-area-right");
    const cssBottom = cssInset("--safe-area-bottom");
    const cssLeft = cssInset("--safe-area-left");

    const webApp: any = (window as any).Telegram?.WebApp;
    const contentSafe = webApp?.contentSafeAreaInset || {};
    const safe = webApp?.safeAreaInset || {};

    const toNum = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    };

    const tgTop = toNum(contentSafe.top ?? safe.top);
    const tgRight = toNum(contentSafe.right ?? safe.right);
    const tgBottom = toNum(contentSafe.bottom ?? safe.bottom);
    const tgLeft = toNum(contentSafe.left ?? safe.left);
    const isTelegramWebApp = Boolean(webApp);

    // Telegram in-app webview may report too small/zero insets on some clients.
    // Keep conservative minimums to avoid overlaps with native chrome.
    const minTgTop = isTelegramWebApp ? 86 : 0;
    const minTgBottom = isTelegramWebApp ? 34 : 0;

    return {
      top: Math.max(cssTop, tgTop, minTgTop),
      right: Math.max(cssRight, tgRight),
      bottom: Math.max(cssBottom, tgBottom, minTgBottom),
      left: Math.max(cssLeft, tgLeft),
    };
  };

  const [insets, setInsets] = useState(read);

  useEffect(() => {
    const updateInsets = () => setInsets(read());
    updateInsets();

    window.addEventListener("resize", updateInsets);
    window.addEventListener("orientationchange", updateInsets);

    const webApp: any = (window as any).Telegram?.WebApp;
    if (webApp?.onEvent) {
      webApp.onEvent("viewportChanged", updateInsets);
      webApp.onEvent("safeAreaChanged", updateInsets);
      webApp.onEvent("contentSafeAreaChanged", updateInsets);
    }

    return () => {
      window.removeEventListener("resize", updateInsets);
      window.removeEventListener("orientationchange", updateInsets);

      if (webApp?.offEvent) {
        webApp.offEvent("viewportChanged", updateInsets);
        webApp.offEvent("safeAreaChanged", updateInsets);
        webApp.offEvent("contentSafeAreaChanged", updateInsets);
      }
    };
  }, []);

  return insets;
}
