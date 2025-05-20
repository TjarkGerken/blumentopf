import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// import { BlurView } from "expo-blur";
import { Platform, View, Text } from "react-native";

function CompHeaderRight() {
  return (
    <View>
      <Text style={{ color: "#fff", marginRight: 16 }}>Rechtes Hi!</Text>
    </View>
  );
}

function CompHeaderLeft() {
  return (
    <View>
      <Text style={{ color: "#fff", marginRight: 16 }}>Stabiles Hi!</Text>
    </View>
  );
}

function CompHeaderTitle() {
  return (
    <View>
      <Text style={{ color: "#fff", marginRight: 16 }}>Mitte Hi!</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#14532d",
        tabBarInactiveTintColor: "#6b7280",
        headerStyle: {
          backgroundColor: "#14532d",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Plants",
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginTop: -5 }}>Plants</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="leaf" size={24} color={color} />
          ),
          headerTitle: "My Plants",
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistics",
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginTop: -5 }}>Stats</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={24} color={color} />
          ),
          headerTitle: "Plant Statistics",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginTop: -5 }}>Settings</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
          headerTitle: "App Settings",
        }}
      />
    </Tabs>
  );
}
