import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type EventDetailsRouteProp = RouteProp<RootStackParamList, "EventDetails">;

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation();
  const { events, togglePlanned, toggleSaved, hasConflict } = useEvents();

  const { eventId } = route.params;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Event not found</ThemedText>
      </View>
    );
  }

  const conflict = hasConflict(event);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getDuration = () => {
    const diff = event.endTime.getTime() - event.startTime.getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const handleTogglePlanned = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    togglePlanned(event.id);
  };

  const handleToggleSaved = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSaved(event.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.trackBadge, { backgroundColor: theme.trackBadge }]}>
          <ThemedText style={[styles.trackText, { color: theme.textSecondary }]}>
            {event.track}
          </ThemedText>
        </View>

        <ThemedText style={[styles.title, { color: theme.text }]}>
          {event.title}
        </ThemedText>

        {event.subtitle ? (
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {event.subtitle}
          </ThemedText>
        ) : null}

        {event.speakerName ? (
          <View style={styles.speakerSection}>
            <View style={[styles.speakerAvatar, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="user" size={24} color={theme.textSecondary} />
            </View>
            <View style={styles.speakerInfo}>
              <ThemedText style={[styles.speakerName, { color: theme.text }]}>
                {event.speakerName}
              </ThemedText>
              {event.speakerRole ? (
                <ThemedText style={[styles.speakerRole, { color: theme.textSecondary }]}>
                  {event.speakerRole}
                </ThemedText>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={[styles.infoSection, { borderColor: theme.separator }]}>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.infoText, { color: theme.text }]}>
              {formatDate(event.startTime)}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather name="clock" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.infoText, { color: theme.text }]}>
              {formatTime(event.startTime)} – {formatTime(event.endTime)} ({getDuration()})
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.infoText, { color: theme.text }]}>
              {event.location}
            </ThemedText>
          </View>
        </View>

        {conflict ? (
          <View style={[styles.conflictBanner, { backgroundColor: `${theme.conflict}15` }]}>
            <Feather name="alert-circle" size={16} color={theme.conflict} />
            <ThemedText style={[styles.conflictText, { color: theme.conflict }]}>
              Conflicts with "{conflict.title}"
            </ThemedText>
          </View>
        ) : null}

        {event.description ? (
          <View style={styles.descriptionSection}>
            <ThemedText style={[styles.description, { color: theme.text }]}>
              {event.description}
            </ThemedText>
          </View>
        ) : null}

        {event.topics.length > 0 ? (
          <View style={styles.topicsSection}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              What you will get
            </ThemedText>
            {event.topics.map((topic, index) => (
              <View key={index} style={styles.topicRow}>
                <View style={[styles.bullet, { backgroundColor: theme.link }]} />
                <ThemedText style={[styles.topicText, { color: theme.text }]}>
                  {topic}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.md,
            borderTopColor: theme.separator,
          },
        ]}
      >
        <Pressable
          onPress={handleTogglePlanned}
          style={[
            styles.primaryButton,
            {
              backgroundColor: event.isPlanned ? theme.backgroundSecondary : theme.link,
            },
          ]}
          testID="toggle-planned-button"
        >
          <Feather
            name={event.isPlanned ? "check" : "plus"}
            size={18}
            color={event.isPlanned ? theme.text : "#FFFFFF"}
          />
          <ThemedText
            style={[
              styles.buttonText,
              { color: event.isPlanned ? theme.text : "#FFFFFF" },
            ]}
          >
            {event.isPlanned ? "Added to My Schedule" : "Add to My Schedule"}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  trackBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.md,
  },
  trackText: {
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 34,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  speakerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  speakerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  speakerInfo: {
    marginLeft: Spacing.md,
  },
  speakerName: {
    fontSize: 17,
    fontWeight: "600",
  },
  speakerRole: {
    fontSize: 15,
    marginTop: 2,
  },
  infoSection: {
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  infoText: {
    fontSize: 15,
  },
  conflictBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.lg,
  },
  conflictText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  descriptionSection: {
    marginTop: Spacing.xl,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  topicsSection: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: Spacing.md,
  },
  topicText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.full,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
