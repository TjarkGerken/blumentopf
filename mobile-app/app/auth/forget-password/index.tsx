// app/auth/forget-password/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "~/initSupabase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);

  async function handleResetPassword() {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "myapp://reset-password",
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setResetSent(true);
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerClassName="flex-grow">
        <View className="flex-1 p-6">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-12 mb-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="arrow-back-outline" size={24} color="#14532d" />
              <Text className="text-green-700 font-medium ml-1">Back</Text>
            </View>
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8 items-center">
            <View className="w-20 h-20 bg-green-700 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-open-outline" size={40} color="#fff" />
            </View>
            <Text className="text-3xl font-bold text-gray-800">
              Reset Password
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Enter your email address and we'll send you instructions to reset
              your password
            </Text>
          </View>

          {resetSent ? (
            <View className="items-center p-6 bg-green-50 rounded-lg">
              <Ionicons name="mail-outline" size={48} color="#14532d" />
              <Text className="text-xl font-bold text-gray-800 mt-4">
                Check Your Email
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                We've sent instructions to reset your password to {email}
              </Text>

              <TouchableOpacity
                className="bg-green-700 py-3 px-6 rounded-lg mt-6"
                onPress={() => router.push("/auth/login")}
              >
                <Text className="text-white font-semibold">Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-5">
              <View>
                <Text className="text-gray-700 mb-2 font-medium">Email</Text>
                <View className="flex-row bg-gray-100 rounded-lg px-4 py-3 items-center">
                  <Ionicons name="mail-outline" size={18} color="#6b7280" />
                  <TextInput
                    className="flex-1 ml-2 text-gray-800"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
              </View>

              <TouchableOpacity
                className={`bg-green-700 py-4 rounded-lg items-center mt-4 ${loading ? "opacity-70" : ""}`}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Send Reset Instructions
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          {!resetSent && (
            <View className="mt-8 flex-row justify-center">
              <Text className="text-gray-600">Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text className="text-green-700 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
