import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { ThemedText } from "@/components/ThemedText";
import { SpeakerRow } from "@/components/SpeakerRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Event } from "@/data/mockEvents";

interface SwipeableEventCardProps {
  event: Event;
  onPress: () => void;
  onTogglePlanned: () => void;
  isPast?: boolean;
  isCurrent?: boolean;
  hasConflict?: boolean;
}

const SWIPE_THRESHOLD = 60;

export function SwipeableEventCard({
  event,
  onPress,
  onTogglePlanned,
  isPast = false,
  isCurrent = false,
  hasConflict = false,
}: SwipeableEventCardProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddToSchedule = () => {
    triggerHaptic();
    onTogglePlanned();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.max(-80, Math.min(80, e.translationX));
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        runOnJS(handleAddToSchedule)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 20 ? Math.min(1, (translateX.value - 20) / 40) : 0,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? Math.min(1, (-translateX.value - 20) / 40) : 0,
  }));

  const isInactive = hasConflict && !event.isPlanned;
  const titleColor = isInactive ? theme.textSecondary : theme.text;
  const cardOpacity = isPast ? 0.5 : isInactive ? 0.85 : 1;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.leftAction, { backgroundColor: theme.link }, leftActionStyle]}>
        <Feather name={event.isPlanned ? "x" : "plus"} size={20} color={theme.buttonText} />
        <ThemedText style={[styles.actionText, { color: theme.buttonText }]}>
          {event.isPlanned ? "Убрать" : "Добавить"}
        </ThemedText>
      </Animated.View>

      <Animated.View style={[styles.rightAction, { backgroundColor: theme.link }, rightActionStyle]}>
        <Feather name={event.isPlanned ? "x" : "plus"} size={20} color={theme.buttonText} />
        <ThemedText style={[styles.actionText, { color: theme.buttonText }]}>
          {event.isPlanned ? "Убрать" : "Добавить"}
        </ThemedText>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: isCurrent ? theme.currentHighlight : theme.backgroundDefault,
              opacity: cardOpacity,
              borderLeftColor: isCurrent ? theme.link : "transparent",
            },
            cardAnimatedStyle,
          ]}
        >
          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={[styles.trackBadge, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={[styles.trackText, { color: theme.textSecondary }]}>
                  {event.track}
                </ThemedText>
              </View>
            </View>

            <Pressable onPress={onPress} testID={`event-title-${event.id}`}>
              <ThemedText style={[styles.title, { color: titleColor }]} numberOfLines={2}>
                {event.title}
              </ThemedText>
            </Pressable>

            {event.speakerName ? (
              <View style={styles.speakerContainer}>
                <SpeakerRow name={event.speakerName} size={22} />
              </View>
            ) : null}

            <Pressable
              onPress={handleAddToSchedule}
              style={styles.addButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`add-button-${event.id}`}
            >
              <Feather
                name={event.isPlanned ? "check-circle" : "plus-circle"}
                size={24}
                color={event.isPlanned ? theme.link : theme.textMuted}
              />
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm,
    position: "relative",
  },
  leftAction: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: Spacing.sm,
    width: 80,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  rightAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: Spacing.sm,
    width: 80,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  actionText: {
    fontSize: 10,
    fontWeight: "600",
  },
  container: {
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    overflow: "hidden",
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
    minHeight: 80,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  trackBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  trackText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    paddingRight: 48,
  },
  speakerContainer: {
    marginTop: Spacing.sm,
    paddingRight: 48,
  },
  addButton: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.md,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
