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
  onToggleSaved: () => void;
  isPast?: boolean;
  isCurrent?: boolean;
  hasConflict?: boolean;
}

const SWIPE_THRESHOLD = 60;

export function SwipeableEventCard({
  event,
  onPress,
  onTogglePlanned,
  onToggleSaved,
  isPast = false,
  isCurrent = false,
  hasConflict = false,
}: SwipeableEventCardProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddToSchedule = () => {
    triggerHaptic();
    onTogglePlanned();
  };

  const handleSave = () => {
    triggerHaptic();
    onToggleSaved();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.max(-80, Math.min(80, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(handleAddToSchedule)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(handleSave)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
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
          {event.isPlanned ? "Remove" : "Add"}
        </ThemedText>
      </Animated.View>

      <Animated.View style={[styles.rightAction, { backgroundColor: "#FFB800" }, rightActionStyle]}>
        <Feather name="star" size={20} color="#FFFFFF" />
        <ThemedText style={styles.actionText}>
          {event.isSaved ? "Unsave" : "Save"}
        </ThemedText>
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
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
            <View style={styles.header}>
              <View style={[styles.trackBadge, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={[styles.trackText, { color: theme.textSecondary }]}>
                  {event.track}
                </ThemedText>
              </View>
              <View style={styles.headerRight}>
                {hasConflict ? (
                  <View style={[styles.conflictBadge, { backgroundColor: `${theme.conflict}20` }]}>
                    <ThemedText style={[styles.conflictText, { color: theme.conflict }]}>
                      Conflict
                    </ThemedText>
                  </View>
                ) : null}
                {event.isSaved ? (
                  <Feather name="star" size={14} color="#FFB800" />
                ) : null}
                {event.isPlanned ? (
                  <Feather name="check-circle" size={14} color={theme.link} />
                ) : null}
              </View>
            </View>

            <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={2}>
              {event.title}
            </ThemedText>

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
    gap: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
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
  },
  speaker: {
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  location: {
    fontSize: 12,
    flex: 1,
  },
});
