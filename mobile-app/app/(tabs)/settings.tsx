// app/(tabs)/settings.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "~/initSupabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  const appVersion = "1.0.0";

  const SettingItem = ({
    icon,
    iconColor,
    title,
    description,
    action,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    title: string;
    description?: string;
    action: React.ReactNode;
  }) => (
    <View className="flex-row items-center py-4 border-b border-gray-100">
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-medium">{title}</Text>
        {description && (
          <Text className="text-gray-500 text-sm">{description}</Text>
        )}
      </View>
      {action}
    </View>
  );

  // Add these hooks inside your SettingsScreen component
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add this useEffect to fetch the current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
    setIsLoading(false);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-2">Notifications</Text>

          <SettingItem
            icon="notifications"
            iconColor="#8b5cf6"
            title="Push Notifications"
            description="Receive alerts about your plants"
            action={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#d1d5db", true: "#14532d" }}
                thumbColor={notifications ? "#fff" : "#fff"}
              />
            }
          />

          <SettingItem
            icon="water"
            iconColor="#0ea5e9"
            title="Watering Reminders"
            description="Get reminders when plants need water"
            action={
              <Switch
                value={waterReminders}
                onValueChange={setWaterReminders}
                trackColor={{ false: "#d1d5db", true: "#14532d" }}
                thumbColor={waterReminders ? "#fff" : "#fff"}
              />
            }
          />
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-2">Device Settings</Text>

          <SettingItem
            icon="wifi"
            iconColor="#f59e0b"
            title="Auto-connect Devices"
            description="Connect to nearby Blumentopf devices"
            action={
              <Switch
                value={autoConnect}
                onValueChange={setAutoConnect}
                trackColor={{ false: "#d1d5db", true: "#14532d" }}
                thumbColor={autoConnect ? "#fff" : "#fff"}
              />
            }
          />

          <SettingItem
            icon="sync"
            iconColor="#10b981"
            title="Background Data Sync"
            description="Keep plant data updated when app is closed"
            action={
              <Switch
                value={dataSync}
                onValueChange={setDataSync}
                trackColor={{ false: "#d1d5db", true: "#14532d" }}
                thumbColor={dataSync ? "#fff" : "#fff"}
              />
            }
          />

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() =>
              Alert.alert(
                "Scan for Devices",
                "Scanning for nearby Blumentopf devices...",
              )
            }
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="search" size={20} color="#6366f1" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">
                Scan for New Devices
              </Text>
              <Text className="text-gray-500 text-sm">
                Find Blumentopf devices in range
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() =>
              Alert.alert(
                "Manage Devices",
                "This would open the device management screen",
              )
            }
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="hardware-chip" size={20} color="#14532d" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">
                Manage Paired Devices
              </Text>
              <Text className="text-gray-500 text-sm">
                View and edit connected devices
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-2">App Settings</Text>

          <SettingItem
            icon="moon"
            iconColor="#6b7280"
            title="Dark Mode"
            description="Use dark theme throughout the app"
            action={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#d1d5db", true: "#14532d" }}
                thumbColor={darkMode ? "#fff" : "#fff"}
              />
            }
          />

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() =>
              Alert.alert("Units", "Change measurement units", [
                { text: "Metric", onPress: () => {} },
                { text: "Imperial", onPress: () => {} },
                { text: "Cancel", style: "cancel" },
              ])
            }
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="options" size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Units</Text>
              <Text className="text-gray-500 text-sm">Metric (°C, ml)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() =>
              Alert.alert("Language", "Change app language", [
                { text: "English", onPress: () => {} },
                { text: "German", onPress: () => {} },
                { text: "Cancel", style: "cancel" },
              ])
            }
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="language" size={20} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Language</Text>
              <Text className="text-gray-500 text-sm">English</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-2">Support</Text>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() =>
              Alert.alert("Help Center", "This would open the help section")
            }
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="help-circle" size={20} color="#14532d" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Help Center</Text>
              <Text className="text-gray-500 text-sm">FAQs and guides</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() =>
              Alert.alert(
                "Contact Support",
                "This would open the support contact form",
              )
            }
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="mail" size={20} color="#0ea5e9" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Contact Support</Text>
              <Text className="text-gray-500 text-sm">
                Get help with your device
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() =>
              Alert.alert("About", `Blumentopf App\nVersion: ${appVersion}`)
            }
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="information-circle" size={20} color="#6b7280" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">About</Text>
              <Text className="text-gray-500 text-sm">
                App version {appVersion}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-2">Account</Text>

          {user ? (
            <>
              <View className="flex-row items-center py-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                  <Ionicons name="person" size={20} color="#14532d" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    {user.email}
                  </Text>
                  <Text className="text-gray-500 text-sm">Signed in</Text>
                </View>
              </View>

              <TouchableOpacity
                className="flex-row items-center py-4 border-b border-gray-100"
                onPress={() =>
                  Alert.alert(
                    "Account Settings",
                    "This would open account settings",
                  )
                }
              >
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                  <Ionicons name="settings-outline" size={20} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    Account Settings
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Manage your account details
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-4"
                onPress={() => {
                  Alert.alert(
                    "Sign Out",
                    "Are you sure you want to sign out?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Sign Out",
                        onPress: handleLogout,
                        style: "destructive",
                      },
                    ],
                  );
                }}
              >
                <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                  <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">Sign Out</Text>
                  <Text className="text-gray-500 text-sm">
                    Log out of your account
                  </Text>
                </View>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#14532d" />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={() => router.push("/auth/login")}
            >
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                <Ionicons name="log-in-outline" size={20} color="#14532d" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">Sign In</Text>
                <Text className="text-gray-500 text-sm">
                  Log in to your account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
