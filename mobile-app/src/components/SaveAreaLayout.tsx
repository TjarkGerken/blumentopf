// src/components/SafeAreaLayout.tsx
import React, { ReactNode } from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaLayoutProps {
  children: ReactNode;
  backgroundColor?: string;
  withPadding?: boolean;
  statusBarStyle?: "light-content" | "dark-content";
  edge?: "all" | "top" | "bottom" | "none";
}

/**
 * A layout component that respects device safe areas including notches,
 * status bars, and navigation bars.
 */
export const SafeAreaLayout = ({
  children,
  backgroundColor = "#FFFFFF",
  withPadding = false,
  statusBarStyle = "dark-content",
  edge = "all",
}: SafeAreaLayoutProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        edge === "all" || edge === "top"
          ? { paddingTop: insets.top }
          : undefined,
        edge === "all" || edge === "bottom"
          ? { paddingBottom: insets.bottom }
          : undefined,
        withPadding ? styles.withPadding : undefined,
      ]}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor="transparent"
        translucent
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  withPadding: {
    paddingHorizontal: 16,
  },
});
