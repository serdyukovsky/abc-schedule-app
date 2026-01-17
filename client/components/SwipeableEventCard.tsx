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

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.leftAction, { backgroundColor: theme.link }, leftActionStyle]}>
        <Feather name={event.isPlanned ? "x" : "plus"} size={20} color="#FFFFFF" />
        <ThemedText style={styles.actionText}>
          {event.isPlanned ? "Убрать" : "Добавить"}
        </ThemedText>
      </Animated.View>

      <Animated.View style={[styles.rightAction, { backgroundColor: theme.link }, rightActionStyle]}>
        <Feather name={event.isPlanned ? "x" : "plus"} size={20} color="#FFFFFF" />
        <ThemedText style={styles.actionText}>
          {event.isPlanned ? "Убрать" : "Добавить"}
        </ThemedText>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: isCurrent ? theme.currentHighlight : theme.backgroundDefault,
              opacity: isPast ? 0.5 : 1,
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
              {hasConflict ? (
                <View style={[styles.conflictBadge, { backgroundColor: `${theme.conflict}20` }]}>
                  <ThemedText style={[styles.conflictText, { color: theme.conflict }]}>
                    Конфликт
                  </ThemedText>
                </View>
              ) : null}
            </View>

            <Pressable onPress={onPress} testID={`event-title-${event.id}`}>
              <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {event.title}
              </ThemedText>
            </Pressable>

            {event.speakerName ? (
              <ThemedText style={[styles.speaker, { color: theme.textSecondary }]} numberOfLines={1}>
                {event.speakerName}
              </ThemedText>
            ) : null}

            <View style={styles.footer}>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={11} color={theme.textSecondary} />
                <ThemedText style={[styles.location, { color: theme.textSecondary }]} numberOfLines={1}>
                  {event.location}
                </ThemedText>
              </View>
            </View>

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
    color: "#FFFFFF",
  },
  container: {
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    overflow: "hidden",
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    minHeight: 100,
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
  conflictBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  conflictText: {
    fontSize: 10,
    fontWeight: "600",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    paddingRight: 48,
  },
  speaker: {
    fontSize: 13,
    marginTop: Spacing.xs,
    paddingRight: 48,
  },
  footer: {
    marginTop: Spacing.sm,
    paddingRight: 48,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  location: {
    fontSize: 12,
  },
  addButton: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
