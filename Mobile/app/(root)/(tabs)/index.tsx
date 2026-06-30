/**
 * app/(tabs)/index.tsx
 * Jana Samasya — Home / Dashboard Tab
 */

import React, { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { COLORS } from "@/constants/colors";
import { useMyComplaints } from "@/hooks/useMyComplaints";

type LocationState =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "error" }
  | { status: "ready"; label: string };

// ─── Quick Action Item type ───────────────────────────────────────────────────
type QuickAction = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  labelKey: string;
  color: string;
  bg: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { id: "1", icon: "add-circle-outline", labelKey: "home.quickActionNewComplaint", color: COLORS.primary, bg: "#e8f5e9" },
  { id: "2", icon: "track-changes", labelKey: "home.quickActionTrackStatus", color: COLORS.secondary, bg: "#e3f2fd" },
  { id: "3", icon: "history", labelKey: "home.quickActionHistory", color: COLORS.tertiary, bg: "#fff3e0" },
  { id: "4", icon: "help-outline", labelKey: "home.quickActionHelp", color: COLORS.outline, bg: COLORS.surfaceContainerHigh },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#e3f2fd", text: COLORS.secondary },
  "Resolved": { bg: "#e8f5e9", text: COLORS.primary },
  "Pending": { bg: "#fff3e0", text: COLORS.tertiary },
};

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { complaints } = useMyComplaints();
  const recent = complaints.slice(0, 5);
  const [location, setLocation] = useState<LocationState>({ status: "loading" });

  async function fetchLocation() {
    setLocation({ status: "loading" });
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocation({ status: "denied" });
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const label = [place?.district ?? place?.city ?? place?.subregion, place?.region]
        .filter(Boolean)
        .join(", ");
      setLocation({ status: "ready", label: label || t("home.locationUnavailable") });
    } catch {
      setLocation({ status: "error" });
    }
  }

  useEffect(() => {
    fetchLocation();
  }, []);

  function handleQuickAction(id: string) {
    if (id === "1") router.push("/(root)/(tabs)/new-complaint");
    if (id === "3") router.push("/(root)/(tabs)/complaint");
  }

  function handlePlayMlaMessage() {
    Alert.alert(t("home.mlaMessageTitle"), t("home.videoComingSoon"));
  }

  const locationDisplay =
    location.status === "ready"
      ? location.label
      : location.status === "denied"
        ? t("home.locationDenied")
        : location.status === "error"
          ? t("home.locationUnavailable")
          : t("home.locationFetching");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Header ── */}
        <View style={styles.topHeader}>
          <Pressable
            style={styles.locationBtn}
            onPress={fetchLocation}
            accessibilityRole="button"
            accessibilityLabel={t("home.yourLocation")}
          >
            <MaterialIcons name="location-on" size={22} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>{t("home.yourLocation")}</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationText} numberOfLines={1}>
                  {locationDisplay}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={16} color={COLORS.onSurfaceVariant} />
              </View>
            </View>
          </Pressable>
          <Pressable style={styles.avatarBtn} accessibilityLabel="Profile" onPress={() => router.push("/(root)/(tabs)/profile")}>
            <MaterialIcons name="account-circle" size={40} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* ── Banner Card (Hero) ── */}
        <View style={styles.bannerCard}>
          <MaterialIcons name="campaign" size={36} color={COLORS.onPrimary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t("home.bannerTitle")}</Text>
            <Text style={styles.bannerSub}>{t("home.bannerSub")}</Text>
          </View>
          <Pressable
            style={styles.bannerBtn}
            accessibilityRole="button"
            onPress={() => router.push("/(root)/(tabs)/new-complaint")}
          >
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* ── MLA Message Video ── */}
        <View style={styles.mlaCard}>
          <Pressable
            style={styles.mlaThumbnail}
            onPress={handlePlayMlaMessage}
            accessibilityRole="button"
            accessibilityLabel={t("home.mlaMessageTitle")}
          >
            <MaterialIcons name="person" size={48} color={COLORS.surfaceContainerHigh} />
            <View style={styles.mlaPlayBtn}>
              <MaterialIcons name="play-arrow" size={28} color={COLORS.white} />
            </View>
          </Pressable>
          <View style={styles.mlaTextWrap}>
            <Text style={styles.mlaTitle}>{t("home.mlaMessageTitle")}</Text>
            <Text style={styles.mlaSub}>{t("home.mlaMessageSub")}</Text>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>{t("home.quickActions")}</Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              style={styles.quickActionItem}
              accessibilityLabel={t(action.labelKey)}
              onPress={() => handleQuickAction(action.id)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
                <MaterialIcons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{t(action.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Recent Grievances ── */}
        <Text style={styles.sectionTitle}>{t("home.recentGrievances")}</Text>
        <View style={styles.grievanceList}>
          {recent.length === 0 ? (
            <Text style={styles.emptyText}>{t("home.noGrievances")}</Text>
          ) : (
            recent.map((item) => {
              const statusStyle = STATUS_COLORS[item.status] ?? { bg: COLORS.surfaceContainerHigh, text: COLORS.onSurface };
              return (
                <Pressable
                  key={item._id}
                  style={styles.grievanceCard}
                  onPress={() => router.push(`/(root)/(tabs)/complaint/${item._id}`)}
                >
                  <View style={styles.grievanceCardTop}>
                    <Text style={styles.grievanceId}>{item._id.slice(-8).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.grievanceTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.grievanceBottom}>
                    <MaterialIcons name="calendar-today" size={13} color={COLORS.outline} />
                    <Text style={styles.grievanceDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32, gap: 20 },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  locationBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    flexShrink: 1,
  },
  avatarBtn: { padding: 4 },
  mlaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mlaThumbnail: {
    height: 160,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  mlaPlayBtn: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  mlaTextWrap: {
    padding: 14,
    gap: 2,
  },
  mlaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  mlaSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    lineHeight: 17,
  },
  bannerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: COLORS.onPrimaryContainer,
    lineHeight: 17,
  },
  bannerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
    letterSpacing: -0.2,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: -8,
  },
  quickActionItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 15,
  },
  grievanceList: { gap: 12, marginTop: -8 },
  grievanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  grievanceCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grievanceId: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  grievanceTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  grievanceBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  grievanceDate: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: "400",
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: 8,
  },
});
