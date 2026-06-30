/**
 * app/(mla)/profile.tsx
 * MLA Panel — Profile Tab
 */

import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { COLORS } from "@/constants/colors";

export default function MlaProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  async function handleLogout() {
    await signOut();
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <MaterialIcons name="account-balance" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>{user?.fullName ?? "MLA"}</Text>
        <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress ?? ""}</Text>
        <View style={styles.roleBadge}>
          <MaterialIcons name="verified" size={16} color={COLORS.primary} />
          <Text style={styles.roleBadgeText}>MLA Panel</Text>
        </View>
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Logout">
        <MaterialIcons name="logout" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface, padding: 20, gap: 16 },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  userName: { fontSize: 20, fontWeight: "700", color: COLORS.onSurface },
  userEmail: { fontSize: 13, color: COLORS.onSurfaceVariant },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e8f5e9",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  roleBadgeText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: { fontSize: 15, fontWeight: "600", color: COLORS.error },
});
