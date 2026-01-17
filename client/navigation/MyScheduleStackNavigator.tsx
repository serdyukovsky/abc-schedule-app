import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyScheduleScreen from "@/screens/MyScheduleScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type MyScheduleStackParamList = {
  MySchedule: undefined;
};

const Stack = createNativeStackNavigator<MyScheduleStackParamList>();

export default function MyScheduleStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MySchedule"
        component={MyScheduleScreen}
        options={{
          title: "My Schedule",
        }}
      />
    </Stack.Navigator>
  );
}
