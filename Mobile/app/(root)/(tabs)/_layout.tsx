/**
 * app/(tabs)/_layout.tsx
 * Tab navigator layout for the main app.
 * Tabs: Home, Updates, [Mic FAB -> voice complaint], Complaints, Profile
 */
import { Redirect, Tabs, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-expo";
import { COLORS } from "@/constants/colors";

function MicTabButton() {
  const router = useRouter();
  return (
    <View style={styles.micWrapper} pointerEvents="box-none">
      <Pressable
        style={styles.micButton}
        onPress={() => router.push("/(root)/(tabs)/new-complaint?voice=1")}
      >
        <MaterialIcons name="mic" size={28} color={COLORS.onPrimary} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const role = user?.publicMetadata?.role as "citizen" | "mla" | undefined;
  if (role === "mla") return <Redirect href="/(root)/(mla)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceContainerHigh,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarActiveTintColor: COLORS.primary,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          title: t("tabs.updates"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="campaign" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-complaint"
        options={{
          title: "",
          tabBarButton: () => <MicTabButton />,
        }}
      />
      <Tabs.Screen
        name="complaint/index"
        options={{
          title: t("tabs.complaints"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="complaint/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  micWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  micButton: {
    top: -22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.tertiaryContainer,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
