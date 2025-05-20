// app/auth/register/index.tsx
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

export default function RegisterScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  async function handleRegister() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else if (data?.user) {
        if (data.user.identities?.length === 0) {
          Alert.alert("Error", "This email is already registered");
        } else {
          Alert.alert(
            "Registration Successful",
            "Please check your email for verification instructions.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/auth/login"),
              },
            ],
          );
        }
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
          {/* Header */}
          <View className="mt-12 mb-8 items-center">
            <View className="w-20 h-20 bg-green-700 rounded-full items-center justify-center mb-4">
              <Ionicons name="leaf" size={40} color="#fff" />
            </View>
            <Text className="text-3xl font-bold text-gray-800">
              Create Account
            </Text>
            <Text className="text-gray-500 mt-2">Sign up to get started</Text>
          </View>

          {/* Form */}
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

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <View className="flex-row bg-gray-100 rounded-lg px-4 py-3 items-center">
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#6b7280"
                />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">
                Confirm Password
              </Text>
              <View className="flex-row bg-gray-100 rounded-lg px-4 py-3 items-center">
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#6b7280"
                />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
              </View>
            </View>

            <TouchableOpacity
              className={`bg-green-700 py-4 rounded-lg items-center mt-4 ${loading ? "opacity-70" : ""}`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text className="text-green-700 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
