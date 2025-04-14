import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const TabIcon = ({ name, color, focused }) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={name}
        size={24}
        color={color}
        style={{ marginBottom: 2 }}
      />
      <Text
        style={[
          styles.iconText,
          focused ? styles.focusedText : styles.unfocusedText,
          { color },
        ]}
      >
        {nameLabelMap[name] || "Tab"}
      </Text>
    </View>
  );
};

// Optional: cleaner tab labels
const nameLabelMap = {
  "home-outline": "Home",
  "chatbox-ellipses-outline": "Chat",
  "calendar-outline": "Calendar",
  "settings-outline": "Settings",
};

const TabLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 84,
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="Chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="chatbox-ellipses-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="Calender"
          options={{
            title: "Calendar",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="calendar-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="Settings"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="settings-outline" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TabLayout;

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: -22,
    minWidth: 80,
  },
  iconText: {
    fontSize: 12,
  },
  focusedText: {
    fontWeight: "600",
  },
  unfocusedText: {
    fontWeight: "400",
  },
});
