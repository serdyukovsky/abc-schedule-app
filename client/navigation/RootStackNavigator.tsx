import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { useEvents } from "@/context/EventContext";

export type RootStackParamList = {
  Main: undefined;
  EventDetails: { eventId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function EventDetailsHeaderRight({ eventId }: { eventId: string }) {
  const { theme } = useTheme();
  const { events, toggleSaved } = useEvents();
  const event = events.find((e) => e.id === eventId);

  if (!event) return null;

  return (
    <Pressable onPress={() => toggleSaved(eventId)} style={{ padding: 8 }}>
      <Feather
        name="star"
        size={22}
        color={event.isSaved ? "#FFB800" : theme.textSecondary}
      />
    </Pressable>
  );
}

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={({ route }) => ({
          presentation: "modal",
          headerTitle: "Event Details",
          headerRight: () => (
            <EventDetailsHeaderRight eventId={route.params.eventId} />
          ),
        })}
      />
    </Stack.Navigator>
  );
}
