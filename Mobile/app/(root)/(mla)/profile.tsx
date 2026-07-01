/**
 * app/(mla)/profile.tsx
 * MLA Panel — Profile Tab
 */

import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";
import { changeLanguage, SUPPORTED_LANGUAGES } from "@/lib/i18n";

const LANG_LABELS: Record<string, string> = { en: "English", as: "অসমীয়া" };

export default function MlaProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [changingLang, setChangingLang] = useState(false);

  function handleLogout() {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("profile.logout"), style: "destructive", onPress: confirmLogout },
    ]);
  }

  async function confirmLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch {
      setLoggingOut(false);
      Alert.alert(t("common.error"), t("profile.logoutError"));
    }
  }

  async function handleLangChange(lang: string) {
    if (lang === i18n.language || changingLang) return;
    setChangingLang(true);
    await changeLanguage(lang as any);
    setChangingLang(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("profile.title")}</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <MaterialIcons name="account-balance" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>{user?.fullName ?? "MLA"}</Text>
        <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress ?? ""}</Text>
        <View style={styles.roleBadge}>
          <MaterialIcons name="verified" size={16} color={COLORS.primary} />
          <Text style={styles.roleBadgeText}>{t("mla.profile.role")}</Text>
        </View>
      </View>

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("profile.language")}</Text>
        <View style={styles.langRow}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Pressable
              key={lang}
              style={[styles.langChip, i18n.language === lang && styles.langChipActive]}
              onPress={() => handleLangChange(lang)}
              disabled={changingLang}
            >
              <Text style={[styles.langChipText, i18n.language === lang && styles.langChipTextActive]}>
                {LANG_LABELS[lang]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Logout */}
      <Pressable
        style={[styles.logoutBtn, loggingOut && styles.disabled]}
        onPress={handleLogout}
        disabled={loggingOut}
        accessibilityRole="button"
        accessibilityLabel={t("profile.logout")}
      >
        {loggingOut
          ? <ActivityIndicator size="small" color={COLORS.error} />
          : <MaterialIcons name="logout" size={20} color={COLORS.error} />}
        <Text style={styles.logoutText}>{t("profile.logout")}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface, padding: 20, gap: 16 },
  header: { paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLORS.onSurface },

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

  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: COLORS.onSurfaceVariant },
  langRow: { flexDirection: "row", gap: 10 },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
  },
  langChipActive: { backgroundColor: COLORS.primary },
  langChipText: { fontSize: 13, fontWeight: "600", color: COLORS.onSurfaceVariant },
  langChipTextActive: { color: COLORS.white },

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
  disabled: { opacity: 0.6 },
  logoutText: { fontSize: 15, fontWeight: "600", color: COLORS.error },
});
