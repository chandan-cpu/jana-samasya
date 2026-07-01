/**
 * app/(tabs)/complaint/index.tsx
 * Jana Samasya — Citizen Complaint History (all past grievances)
 */

import React from "react";
import { Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";
import { useMyComplaints } from "@/hooks/useMyComplaints";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#e3f2fd", text: COLORS.secondary },
  Resolved: { bg: "#e8f5e9", text: COLORS.primary },
  Pending: { bg: "#fff3e0", text: COLORS.tertiary },
};

export default function ComplaintHistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { complaints, isLoading, error, refresh } = useMyComplaints();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>{t("history.title")}</Text>
          <Text style={styles.headerSub}>{t("history.subtitle")}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
      >
        {error ? <Text style={styles.errorText}>{t("history.loadError")}</Text> : null}

        {!isLoading && complaints.length === 0 && !error ? (
          <Text style={styles.emptyText}>{t("history.empty")}</Text>
        ) : null}

        {complaints.map((item) => {
          const statusStyle = STATUS_COLORS[item.status] ?? { bg: COLORS.surfaceContainerHigh, text: COLORS.onSurface };
          return (
            <Pressable
              key={item._id}
              style={styles.card}
              onPress={() => router.push(`/(root)/(tabs)/complaint/${item._id}`)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardId}>{item._id.slice(-8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.cardBottom}>
                <MaterialIcons name="category" size={13} color={COLORS.outline} />
                <Text style={styles.cardMeta}>{item.category}</Text>
                <MaterialIcons name="calendar-today" size={13} color={COLORS.outline} style={{ marginLeft: 10 }} />
                <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 42,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.white },
  headerSub: { fontSize: 13, color: COLORS.secondaryContainer, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, gap: 12, paddingBottom: 32 },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: "500" },
  emptyText: { color: COLORS.onSurfaceVariant, fontSize: 13, textAlign: "center", marginTop: 32 },
  card: {
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
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardId: { fontSize: 11, fontWeight: "600", color: COLORS.outline, letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 14, fontWeight: "500", color: COLORS.onSurface, lineHeight: 20 },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMeta: { fontSize: 12, color: COLORS.outline, fontWeight: "400" },
});
