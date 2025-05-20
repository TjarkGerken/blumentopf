// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { PlantProvider } from "../src/context/PlantProvider";
import "./../global.css";

export default function Layout() {
  return (
    <PlantProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: "Home",
          }}
        />
        <Stack.Screen
          name="plant/[id]"
          options={{
            title: "Plant Details",
            headerStyle: {
              backgroundColor: "#14532d",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="device/[id]"
          options={{
            title: "Device Settings",
            headerStyle: {
              backgroundColor: "#14532d",
            },
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </PlantProvider>
  );
}
