import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScheduleScreen from "@/screens/MainScheduleScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  EventDetails: { eventId: string };
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
          headerTitle: () => <HeaderTitle title="ABC" />,
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          presentation: "modal",
          headerTitle: "Детали события",
          headerTransparent: false,
        }}
      />
    </Stack.Navigator>
  );
}
