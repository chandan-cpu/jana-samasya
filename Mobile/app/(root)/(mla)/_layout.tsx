/**
 * app/(mla)/_layout.tsx
 * Tab navigator for the MLA panel — Overview, Complaints, Profile
 */
import { Redirect, Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";

export default function MlaTabsLayout() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();

  if (!isLoaded) return null;

  const role = user?.publicMetadata?.role as "citizen" | "mla" | undefined;
  if (role !== "mla") return <Redirect href="/(root)/(tabs)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
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
          title: t("mla.tabs.overview"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          title: t("mla.tabs.complaints"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("mla.tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Keep complaint detail hidden from tab bar */}
      <Tabs.Screen
        name="complaint/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
