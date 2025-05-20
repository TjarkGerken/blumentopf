import { Text, ScrollView } from "react-native";
import { View } from "react-native";

export default function Tab() {
  return (
    <ScrollView>
      <View className="flex-1 bg-red-100 items-center justify-center">
        <Text>Tab [Settings]</Text>
        <Text>Tab [Settings]</Text>
        <Text>Tab [Settings]</Text>
        <Text>Tab [Settings]</Text>
        <Text>Tab [Settings]</Text>
        <Text>Tab [Settings]</Text>
        <Text>Tab [Settings]</Text>
      </View>
    </ScrollView>
  );
}
