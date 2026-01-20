import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScheduleScreen from "@/screens/MainScheduleScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { AppHeader } from "@/components/AppHeader";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  EventDetails: { eventId: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainScheduleScreen}
        options={{
          headerTitle: () => <AppHeader />,
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
