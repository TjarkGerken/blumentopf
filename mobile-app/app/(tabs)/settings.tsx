// app/(tabs)/settings.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "~/initSupabase";
import { router } from "expo-router";

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
      </View>
      <Button
        // status="danger"
        title="Login"
        onPress={() => router.push(`/auth/login`)}
      />
      <Button
        // status="danger"
        title="Logout"
        onPress={async () => {
          const { error } = await supabase.auth.signOut();
          if (!error) {
            alert("Signed out!");
          }
          if (error) {
            alert(error.message);
          }
        }}
        // The React Native Button does not support a style prop directly.
        // If you want to add margin, wrap the Button in a View with the desired style.
      />
    </ScrollView>
  );
}
