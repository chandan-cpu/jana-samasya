/**
 * app/(tabs)/profile.tsx
 * Jana Samasya — Profile Tab
 */

import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";
import { useMyComplaints } from "@/hooks/useMyComplaints";
import { changeLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/i18n";

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  as: "অসমীয়া",
};

// ─── Menu Item type ───────────────────────────────────────────────────────────
type MenuItem = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  danger?: boolean;
};

// ─── Profile Screen ───────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { complaints } = useMyComplaints();
  const { t, i18n } = useTranslation();

  const filedCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const pendingCount = filedCount - resolvedCount;

  async function handleLogout() {
    await signOut();
    router.replace("/(auth)/login");
  }

  function handleChangeLanguage() {
    Alert.alert(
      t("profile.language"),
      undefined,
      SUPPORTED_LANGUAGES.map((lang) => ({
        text: LANGUAGE_NAMES[lang],
        onPress: () => changeLanguage(lang),
      }))
    );
  }

  const menuItems: MenuItem[] = [
    {
      id: "1",
      icon: "description",
      label: "My Complaints",
      onPress: () => router.push("/(root)/(tabs)/complaint"),
    },
    { id: "2", icon: "event-note", label: "My Appointments" },
    { id: "3", icon: "article", label: "My Memorandum" },
    { id: "4", icon: "folder-open", label: "My Documents" },
    { id: "5", icon: "notifications-none", label: "Notification Settings" },
    {
      id: "6",
      icon: "language",
      label: t("profile.language"),
      sublabel: LANGUAGE_NAMES[i18n.language as SupportedLanguage] ?? LANGUAGE_NAMES.en,
      onPress: handleChangeLanguage,
    },
    { id: "7", icon: "info-outline", label: "About App" },
    {
      id: "8",
      icon: "logout",
      label: t("profile.logout"),
      danger: true,
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

      {/* ── Header Bar ── */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Pressable hitSlop={8}>
          <MaterialIcons name="edit" size={22} color={COLORS.white} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Info Card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={36} color={COLORS.outline} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.fullName ?? "Citizen"}</Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="call" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.userInfoText}>
                {(user?.unsafeMetadata?.phone as string) ?? user?.primaryEmailAddress?.emailAddress ?? ""}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.userInfoText}>Kaliabor, Nagaon{"\n"}Assam, India</Text>
            </View>
          </View>
        </View>

        {/* ── My Statistics ── */}
        <Text style={styles.sectionTitle}>My Statistics</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { marginRight: 10 }]}>
            <Text style={styles.statValue}>{filedCount}</Text>
            <Text style={styles.statLabel}>Complaints{"\n"}Submitted</Text>
          </View>
          <View style={[styles.statCard, { marginRight: 10 }]}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.tertiary }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* ── Menu Items ── */}
        <View style={styles.menuCard} className="p-3">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={item.onPress ?? (() => {})}
                android_ripple={{ color: COLORS.surfaceContainerHigh }}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                className="py-4"
              >
                <View style={styles.menuRow}>
                  <MaterialIcons
                    name={item.icon}
                    size={22}
                    color={item.danger ? COLORS.error : COLORS.onSurfaceVariant}
                    style={{ width: 22, marginRight: 18, textAlign: "center" }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                      {item.label}
                    </Text>
                    {item.sublabel && (
                      <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                    )}
                  </View>
                  {!item.danger && (
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={COLORS.outlineVariant}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              </Pressable>
              {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },
  profileCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 2 },
  userInfoText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: -4,
  },
  statsRow: {
    flexDirection: "row",
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  menuItemPressed: { backgroundColor: COLORS.surfaceContainerLow, opacity: 0.7 },
  menuLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.onSurface,
  },
  menuLabelDanger: { color: COLORS.error, fontWeight: "600" },
  menuSublabel: {
    fontSize: 13,
    color: COLORS.outline,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginLeft: 60,
  },
});
