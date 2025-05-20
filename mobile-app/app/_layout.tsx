// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { PlantProvider } from "../src/context/PlantProvider";
import { supabase } from "~/initSupabase";
import { User } from "@supabase/supabase-js";
import { View, ActivityIndicator, Text } from "react-native";
import "./../global.css";

import * as Linking from "expo-linking";
import { router } from "expo-router";

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
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Inside your component
  useEffect(() => {
    // Handle deep links when the app is already open
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle deep links that opened the app
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    // Example: "blumentopf://reset-password?token=xyz"
    const { hostname, path, queryParams } = Linking.parse(url);

    if (hostname === "reset-password") {
      // Navigate to password reset screen with token
      router.push({
        pathname: "/auth/reset-password",
        params: { token: queryParams?.token },
      });
    }
  };

  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // console.log(`Supabase auth event: ${event}`);
        setUser(session?.user || null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Use the segments to determine if the user is in an auth screen
  const isInAuthGroup = segments[0] === "auth";

  useEffect(() => {
    if (loading) return;

    // Auth protection logic
    if (!user && !isInAuthGroup) {
      // User is not signed in and not on an auth page
      router.replace("/auth/login");
    } else if (user && isInAuthGroup) {
      // User is signed in but still on an auth page
      router.replace("/(tabs)");
    }
  }, [user, segments, loading]);

  // Show a loading indicator while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  return (
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
  );
}
