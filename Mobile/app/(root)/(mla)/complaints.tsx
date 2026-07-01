/**
 * app/(mla)/complaints.tsx
 * MLA Panel — Paginated complaint list with status filter and inline status update
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";
import { useApi } from "@/hooks/useApi";
import type { Complaint, ComplaintStatus, PaginatedComplaints } from "@/types/complaint";

// ── Constants ─────────────────────────────────────────────────────────────────
type FilterValue = ComplaintStatus | "All";
const PAGE_SIZE = 15;

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#e3f2fd", text: COLORS.secondary },
  Resolved:     { bg: "#e8f5e9", text: COLORS.primary },
  Pending:      { bg: "#fff3e0", text: COLORS.tertiary },
};

const STATUS_OPTIONS: ComplaintStatus[] = ["Pending", "In Progress", "Resolved"];

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MlaComplaintsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { call } = useApi();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<FilterValue>("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which complaint's status picker is open
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filterRef = useRef(filter);
  filterRef.current = filter;

  const FILTERS: Array<{ labelKey: string; value: FilterValue }> = [
    { labelKey: "mla.complaints.filterAll", value: "All" },
    { labelKey: "mla.complaints.filterPending", value: "Pending" },
    { labelKey: "mla.complaints.filterInProgress", value: "In Progress" },
    { labelKey: "mla.complaints.filterResolved", value: "Resolved" },
  ];

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (pageNum: number, status: FilterValue, replace: boolean) => {
      setError(null);
      if (replace) setIsLoading(true);
      else setIsFetchingMore(true);

      try {
        const params = new URLSearchParams({ page: String(pageNum), limit: String(PAGE_SIZE) });
        if (status !== "All") params.set("status", status);

        const res = await call<PaginatedComplaints>(`/api/complaints?${params}`);
        setTotalPages(res.pages);
        setPage(res.page);
        setComplaints((prev) => (replace ? res.data : [...prev, ...res.data]));
      } catch (err: any) {
        setError(err?.message ?? t("common.error"));
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
        setIsRefreshing(false);
      }
    },
    [call, t]
  );

  // Reset and reload when filter changes
  useEffect(() => {
    setComplaints([]);
    setPage(1);
    fetchPage(1, filter, true);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRefresh() {
    setIsRefreshing(true);
    setComplaints([]);
    fetchPage(1, filterRef.current, true);
  }

  function handleLoadMore() {
    if (isFetchingMore || isLoading || page >= totalPages) return;
    fetchPage(page + 1, filterRef.current, false);
  }

  // ── Inline status update ────────────────────────────────────────────────────
  async function handleStatusChange(complaint: Complaint, newStatus: ComplaintStatus) {
    if (newStatus === complaint.status || updatingId) return;
    setUpdatingId(complaint._id);
    setExpandedId(null);
    try {
      const updated = await call<Complaint>(`/api/complaints/${complaint._id}`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      setComplaints((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err: any) {
      setError(err?.message ?? t("common.error"));
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Render item ─────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: Complaint }) => {
    const s = STATUS_STYLE[item.status] ?? { bg: COLORS.surfaceContainerHigh, text: COLORS.onSurface };
    const isExpanded = expandedId === item._id;
    const isUpdating = updatingId === item._id;

    return (
      <View style={styles.card}>
        {/* Card header — tap to open detail */}
        <Pressable
          style={styles.cardPressable}
          onPress={() => router.push(`/(root)/(mla)/complaint/${item._id}` as any)}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardId}>#{item._id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.badge, { backgroundColor: s.bg }]}>
              <Text style={[styles.badgeText, { color: s.text }]}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.cardMeta}>
            <MaterialIcons name="category" size={13} color={COLORS.outline} />
            <Text style={styles.metaText}>{item.category}</Text>
            <MaterialIcons name="calendar-today" size={13} color={COLORS.outline} style={styles.metaIcon} />
            <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </Pressable>

        {/* MLA action bar */}
        <View style={styles.actionBar}>
          <Pressable
            style={styles.updateStatusBtn}
            onPress={() => setExpandedId(isExpanded ? null : item._id)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <MaterialIcons name="edit" size={14} color={COLORS.primary} />
                <Text style={styles.updateStatusText}>{t("mla.complaints.updateStatus")}</Text>
                <MaterialIcons
                  name={isExpanded ? "expand-less" : "expand-more"}
                  size={16}
                  color={COLORS.primary}
                />
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.viewBtn}
            onPress={() => router.push(`/(root)/(mla)/complaint/${item._id}` as any)}
          >
            <MaterialIcons name="open-in-new" size={14} color={COLORS.onSurfaceVariant} />
          </Pressable>
        </View>

        {/* Inline status picker */}
        {isExpanded && (
          <View style={styles.statusPicker}>
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.statusOption,
                  item.status === opt && styles.statusOptionActive,
                ]}
                onPress={() => handleStatusChange(item, opt)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    item.status === opt && styles.statusOptionTextActive,
                  ]}
                >
                  {opt}
                </Text>
                {item.status === opt && (
                  <MaterialIcons name="check" size={14} color={COLORS.onPrimary} />
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  // ── Footer loader ───────────────────────────────────────────────────────────
  const ListFooter = () => {
    if (!isFetchingMore) return <View style={{ height: 24 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>{t("common.loading")}</Text>
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t("mla.complaints.title")}</Text>
          <Text style={styles.headerSub}>{t("mla.complaints.subtitle")}</Text>
        </View>
        {complaints.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{complaints.length}</Text>
          </View>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>
              {t(f.labelKey)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Error banner */}
      {error ? (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Initial full-screen loader */}
      {isLoading && complaints.length === 0 ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={<ListFooter />}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyWrap}>
                <MaterialIcons name="inbox" size={48} color={COLORS.outlineVariant} />
                <Text style={styles.emptyText}>{t("mla.complaints.empty")}</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLORS.onSurface },
  headerSub: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  countBadge: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: { fontSize: 12, fontWeight: "700", color: COLORS.onPrimaryContainer },

  filterRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.onSurfaceVariant },
  chipTextActive: { color: COLORS.white },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "#fdecea",
    borderRadius: 10,
    padding: 12,
  },
  errorText: { fontSize: 13, color: COLORS.error, flex: 1 },

  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.onSurfaceVariant },

  listContent: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(191,202,186,0.2)",
  },
  cardPressable: { padding: 16, gap: 8 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardId: { fontSize: 10, fontWeight: "700", color: COLORS.outline, letterSpacing: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.onSurface, lineHeight: 22 },
  cardDesc: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 19 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaIcon: { marginLeft: 10 },
  metaText: { fontSize: 12, color: COLORS.outline },

  // Action bar
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  updateStatusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  updateStatusText: { fontSize: 13, fontWeight: "600", color: COLORS.primary, flex: 1 },
  viewBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  // Status picker
  statusPicker: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  statusOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  statusOptionActive: { backgroundColor: COLORS.primary },
  statusOptionText: { fontSize: 11, fontWeight: "600", color: COLORS.onSurfaceVariant },
  statusOptionTextActive: { color: COLORS.white },

  // Footer / empty
  footerLoader: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingVertical: 16 },
  footerText: { fontSize: 13, color: COLORS.onSurfaceVariant },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.onSurfaceVariant, textAlign: "center" },
});
