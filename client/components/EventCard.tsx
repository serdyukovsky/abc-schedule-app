import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Event } from "@/data/mockEvents";

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onTogglePlanned?: () => void;
  onToggleSaved?: () => void;
  isPast?: boolean;
  isCurrent?: boolean;
  hasConflict?: boolean;
  showActions?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EventCard({
  event,
  onPress,
  onTogglePlanned,
  onToggleSaved,
  isPast = false,
  isCurrent = false,
  hasConflict = false,
  showActions = true,
}: EventCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleTogglePlanned = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTogglePlanned?.();
  };

  const handleToggleSaved = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleSaved?.();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: isCurrent ? theme.currentHighlight : theme.backgroundDefault,
          opacity: isPast ? 0.5 : 1,
          borderLeftColor: isCurrent ? theme.link : "transparent",
        },
        animatedStyle,
      ]}
      testID={`event-card-${event.id}`}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.leftContent}>
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

          {showActions ? (
            <View style={styles.iconButtons}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleToggleSaved();
                }}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID={`star-button-${event.id}`}
              >
                <Feather
                  name="star"
                  size={20}
                  color={event.isSaved ? "#FFB800" : theme.textMuted}
                />
              </Pressable>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleTogglePlanned();
                }}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID={`add-button-${event.id}`}
              >
                <Feather
                  name={event.isPlanned ? "check-circle" : "plus-circle"}
                  size={20}
                  color={event.isPlanned ? theme.link : theme.textMuted}
                />
              </Pressable>
            </View>
          ) : null}
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
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
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
  iconButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
