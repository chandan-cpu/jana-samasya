/**
 * app/(mla)/index.tsx
 * MLA Panel — All Complaints, with status filter and pull-to-refresh
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useApi } from "@/hooks/useApi";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

const FILTERS: Array<{ label: string; value: ComplaintStatus | "All" }> = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Resolved", value: "Resolved" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#e3f2fd", text: COLORS.secondary },
  Resolved: { bg: "#e8f5e9", text: COLORS.primary },
  Pending: { bg: "#fff3e0", text: COLORS.tertiary },
};

export default function MlaComplaintsScreen() {
  const router = useRouter();
  const { call } = useApi();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<ComplaintStatus | "All">("All");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (status: ComplaintStatus | "All") => {
    setError(null);
    try {
      const query = status === "All" ? "" : `?status=${encodeURIComponent(status)}`;
      const data = await call<Complaint[]>(`/api/complaints${query}`);
      setComplaints(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load complaints.");
    }
  }, [call]);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await load(filter);
    setIsRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Citizen Complaints</Text>
        <Text style={styles.headerSub}>Review and resolve grievances</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {complaints.length === 0 && !error ? (
          <Text style={styles.emptyText}>No complaints found.</Text>
        ) : null}

        {complaints.map((item) => {
          const statusStyle = STATUS_COLORS[item.status] ?? { bg: COLORS.surfaceContainerHigh, text: COLORS.onSurface };
          return (
            <Pressable
              key={item._id}
              style={styles.card}
              onPress={() => router.push(`/(root)/(mla)/complaint/${item._id}`)}
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLORS.onSurface },
  headerSub: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 2 },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: "600", color: COLORS.onSurfaceVariant },
  filterChipTextActive: { color: COLORS.white },
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
