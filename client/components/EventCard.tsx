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
  onTogglePlanned: () => void;
  onToggleSaved: () => void;
  isPast?: boolean;
  isCurrent?: boolean;
  conflictWith?: Event | null;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EventCard({
  event,
  onPress,
  onTogglePlanned,
  onToggleSaved,
  isPast = false,
  isCurrent = false,
  conflictWith,
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
    onTogglePlanned();
  };

  const handleToggleSaved = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleSaved();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const timeRange = `${formatTime(event.startTime)}–${formatTime(event.endTime)}`;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: isCurrent ? theme.currentHighlight : "transparent",
          opacity: isPast ? 0.5 : 1,
          borderBottomColor: theme.separator,
        },
        animatedStyle,
      ]}
      testID={`event-card-${event.id}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.trackBadge, { backgroundColor: theme.trackBadge }]}>
            <ThemedText style={[styles.trackText, { color: theme.textSecondary }]}>
              {event.track}
            </ThemedText>
          </View>
          <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>
            {timeRange}
          </ThemedText>
        </View>

        <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {event.title}
        </ThemedText>

        {event.speakerName ? (
          <ThemedText style={[styles.speaker, { color: theme.textSecondary }]}>
            {event.speakerName}
          </ThemedText>
        ) : null}

        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={theme.textSecondary} />
          <ThemedText style={[styles.location, { color: theme.textSecondary }]}>
            {event.location}
          </ThemedText>
        </View>

        {conflictWith ? (
          <View style={styles.conflictRow}>
            <Feather name="alert-circle" size={12} color={theme.conflict} />
            <ThemedText style={[styles.conflictText, { color: theme.conflict }]}>
              Conflicts with another session
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={handleTogglePlanned}
            style={[
              styles.primaryButton,
              {
                backgroundColor: event.isPlanned ? theme.backgroundSecondary : theme.link,
              },
            ]}
            testID={`toggle-planned-${event.id}`}
          >
            <Feather
              name={event.isPlanned ? "check" : "plus"}
              size={14}
              color={event.isPlanned ? theme.text : "#FFFFFF"}
            />
            <ThemedText
              style={[
                styles.buttonText,
                { color: event.isPlanned ? theme.text : "#FFFFFF" },
              ]}
            >
              {event.isPlanned ? "Added" : "Add"}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleToggleSaved}
            style={styles.iconButton}
            testID={`toggle-saved-${event.id}`}
          >
            <Feather
              name={event.isSaved ? "star" : "star"}
              size={20}
              color={event.isSaved ? "#FFB800" : theme.textSecondary}
              style={{ opacity: event.isSaved ? 1 : 0.6 }}
            />
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  content: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  trackBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  trackText: {
    fontSize: 11,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  },
  speaker: {
    fontSize: 15,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  location: {
    fontSize: 13,
  },
  conflictRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  conflictText: {
    fontSize: 13,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  iconButton: {
    padding: Spacing.sm,
  },
});
