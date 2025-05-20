// app/auth/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen
        name="login/index"
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen
        name="register/index"
        options={{
          title: "Register",
        }}
      />
      <Stack.Screen
        name="forget-password/index"
        options={{
          title: "Reset Password",
        }}
      />
    </Stack>
  );
}
