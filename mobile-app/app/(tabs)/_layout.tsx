import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { View, Text, Button } from "react-native";

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
        headerStyle: {
          backgroundColor: "#14532d",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          headerRight: () => <CompHeaderRight />,
          headerLeft: () => <CompHeaderLeft />,
          headerTitle: () => <CompHeaderTitle />, // This hides the title
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
          headerRight: () => <CompHeaderRight />,
          headerLeft: () => <CompHeaderLeft />,
          headerTitle: () => <CompHeaderTitle />,
        }}
      />
    </Tabs>
  );
}
