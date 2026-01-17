import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
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
  isPast?: boolean;
  isCurrent?: boolean;
  hasConflict?: boolean;
  compact?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EventCard({
  event,
  onPress,
  isPast = false,
  isCurrent = false,
  hasConflict = false,
  compact = false,
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
        compact && styles.compactContainer,
        animatedStyle,
      ]}
      testID={`event-card-${event.id}`}
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
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    overflow: "hidden",
  },
  compactContainer: {
    marginBottom: Spacing.sm,
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
