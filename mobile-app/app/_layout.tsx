// app/_layout.tsx
import "expo-dev-client";
import React, { useEffect, useState } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { PlantProvider } from "../src/context/PlantProvider";
import { supabase } from "~/initSupabase";
import { User } from "@supabase/supabase-js";
import { View, ActivityIndicator, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import "./../global.css";

// Loading screen component
function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#14532d" />
      <Text className="mt-4 text-gray-600">Loading...</Text>
    </View>
  );
}

export default function RootLayout() {
  // 1. All hooks should be at the top level, not inside conditionals
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. URL handling hook
  useEffect(() => {
    // Set up URL handler
    const handleDeepLink = (event: { url: string }) => {
      console.log("Received deep link:", event.url);

      // Get the path from the URL
      const { path, queryParams } = Linking.parse(event.url);

      if (path === "reset-password" && queryParams) {
        // Navigate to the reset password screen with any relevant query params
        router.push({
          pathname: "/auth/reset-password",
          params: queryParams,
        });
      }
    };

    // Add the event listener for deep links when the app is already open
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle the case where the app was opened via a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Clean up
    return () => {
      subscription.remove();
    };
  }, [router]); // Add router as a dependency

  // 3. Auth effect
  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Supabase auth event: ${event}`);
        setUser(session?.user || null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 4. Navigation effect - note that all hooks are defined before any conditionals
  useEffect(() => {
    if (loading) return;

    // Auth protection logic
    const isInAuthGroup = segments[0] === "auth";

    if (!user && !isInAuthGroup) {
      // User is not signed in and not on an auth page
      router.replace("/auth/login");
    } else if (user && isInAuthGroup) {
      // User is signed in but still on an auth page
      router.replace("/(tabs)");
    }
  }, [user, segments, loading, router]); // Add router as a dependency

  // 5. Conditional rendering - only AFTER all hooks are defined
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <PlantProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="plant/[id]"
            options={{
              headerShown: true,
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
              headerShown: true,
              title: "Device Settings",
              headerStyle: {
                backgroundColor: "#14532d",
              },
              headerTintColor: "#fff",
            }}
          />
        </Stack>
      </PlantProvider>
    </SafeAreaProvider>
  );
}
