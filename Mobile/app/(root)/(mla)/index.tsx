/**
 * app/(mla)/index.tsx
 * MLA Admin Dashboard — Summary, Trends, Categories, Recent Complaints
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
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";
import { useApi } from "@/hooks/useApi";
import type { Complaint } from "@/types/complaint";

// ── Types ─────────────────────────────────────────────────────────────────────
type Stats = {
  total: number;
  resolved: number;
  pending: number;
  critical: number;
};

type MonthBar = { labelKey: string; pct: number; active?: boolean };

const MONTHLY_BARS: MonthBar[] = [
  { labelKey: "mla.dashboard.months.apr", pct: 40 },
  { labelKey: "mla.dashboard.months.may", pct: 65 },
  { labelKey: "mla.dashboard.months.jun", pct: 85 },
  { labelKey: "mla.dashboard.months.jul", pct: 100, active: true },
  { labelKey: "mla.dashboard.months.aug", pct: 55 },
  { labelKey: "mla.dashboard.months.sep", pct: 70 },
];

const CATEGORY_DATA = [
  { labelKey: "mla.dashboard.categories.infrastructure", pct: 60, color: COLORS.primary },
  { labelKey: "mla.dashboard.categories.health", pct: 25, color: COLORS.secondary },
  { labelKey: "mla.dashboard.categories.education", pct: 15, color: COLORS.tertiary },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#e3f2fd", text: COLORS.secondary },
  Resolved: { bg: "#e8f5e9", text: COLORS.primary },
  Pending: { bg: "#fff3e0", text: COLORS.tertiary },
  Critical: { bg: "#fdecea", text: COLORS.error },
};

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MlaDashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { call } = useApi();

  const [stats, setStats] = useState<Stats>({ total: 0, resolved: 0, pending: 0, critical: 0 });
  const [recent, setRecent] = useState<Complaint[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [statsData, recentData] = await Promise.all([
        call<{ total: number; resolved: number; pending: number; inProgress: number }>(
          "/api/complaints/stats"
        ),
        call<{ data: Complaint[] }>("/api/complaints?limit=5"),
      ]);
      setStats({
        total: statsData.total,
        resolved: statsData.resolved,
        pending: statsData.pending,
        critical: statsData.inProgress,
      });
      setRecent(recentData.data);
    } catch (err: any) {
      setError(err?.message ?? t("common.error"));
    }
  }, [call, t]);

  useEffect(() => { load(); }, [load]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* App Bar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appBarTitle}>{t("mla.dashboard.title")}</Text>
          <Text style={styles.appBarSub}>{t("mla.dashboard.subtitle")}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <MaterialIcons name="account-balance" size={22} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* ── Summary Cards 2×2 ────────────────────────────────────── */}
        <View style={styles.bento}>
          <StatCard
            icon="fact-check"
            label={t("mla.dashboard.stats.total")}
            value={stats.total.toLocaleString()}
            color={COLORS.primary}
            iconBg="#e8f5e9"
          />
          <StatCard
            icon="check-circle"
            label={t("mla.dashboard.stats.resolved")}
            value={stats.resolved.toLocaleString()}
            color={COLORS.primary}
            iconBg={COLORS.primary}
            iconColor={COLORS.onPrimary}
          />
          <StatCard
            icon="pending"
            label={t("mla.dashboard.stats.pending")}
            value={stats.pending.toLocaleString()}
            color={COLORS.secondary}
            iconBg="#e3f2fd"
          />
          <StatCard
            icon="warning"
            label={t("mla.dashboard.stats.critical")}
            value={stats.critical.toLocaleString()}
            color={COLORS.error}
            iconBg="#fdecea"
          />
        </View>

        {/* ── Monthly Trends Bar Chart ──────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t("mla.dashboard.trends.title")}</Text>
            <MaterialIcons name="more-vert" size={20} color={COLORS.onSurfaceVariant} />
          </View>
          <View style={styles.barChart}>
            {MONTHLY_BARS.map((bar) => (
              <View key={bar.labelKey} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${bar.pct}%` },
                      bar.active ? styles.barFillActive : styles.barFillInactive,
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, bar.active && styles.barLabelActive]}>
                  {t(bar.labelKey)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Issues by Category ────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("mla.dashboard.categories.title")}</Text>
          <View style={styles.donutRow}>
            {/* Ring built from stacked arcs via View borders */}
            <DonutRing segments={CATEGORY_DATA.map((c) => ({ pct: c.pct, color: c.color }))} />
            <View style={styles.legend}>
              {CATEGORY_DATA.map((cat) => (
                <View key={cat.labelKey} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.legendLabel}>{t(cat.labelKey)}</Text>
                  <Text style={styles.legendPct}>{cat.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Recent Complaints ─────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>{t("mla.dashboard.recent.title")}</Text>
          <Pressable onPress={() => router.push("/(root)/(mla)/complaints" as any)}>
            <Text style={styles.viewAll}>{t("mla.dashboard.recent.viewAll")}</Text>
          </Pressable>
        </View>

        {recent.length === 0 && !error ? (
          <Text style={styles.emptyText}>{t("mla.dashboard.recent.empty")}</Text>
        ) : null}

        {recent.map((item) => {
          const s = STATUS_COLORS[item.status] ?? { bg: COLORS.surfaceContainerHigh, text: COLORS.onSurface };
          return (
            <Pressable
              key={item._id}
              style={styles.complaintCard}
              onPress={() => router.push(`/(root)/(mla)/complaint/${item._id}` as any)}
            >
              <View style={styles.complaintTop}>
                <Text style={styles.complaintId}>ID: {item._id.slice(-8).toUpperCase()}</Text>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.text }]}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.complaintTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.complaintMeta}>
                <MaterialIcons name="category" size={13} color={COLORS.outline} />
                <Text style={styles.metaText}>{item.category}</Text>
                <MaterialIcons name="calendar-today" size={13} color={COLORS.outline} style={styles.metaIcon} />
                <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, color, iconBg, iconColor,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  color: string;
  iconBg: string;
  iconColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={20} color={iconColor ?? color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

/** Simple donut-style ring using nested View technique */
function DonutRing({ segments }: { segments: { pct: number; color: string }[] }) {
  const SIZE = 96;
  const RING = 10;
  return (
    <View style={{ width: SIZE, height: SIZE, justifyContent: "center", alignItems: "center" }}>
      {/* Background ring */}
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: RING,
          borderColor: COLORS.surfaceContainerHigh,
          position: "absolute",
        }}
      />
      {/* Segmented arcs — approximate with stacked colored quarter rings */}
      {segments.map((seg, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: RING,
            borderColor: "transparent",
            borderTopColor: seg.color,
            transform: [{ rotate: `${i * 120}deg` }],
            opacity: 0.85,
          }}
        />
      ))}
      <View style={styles.donutCenter}>
        <Text style={styles.donutValue}>{segments.length}</Text>
        <Text style={styles.donutSub}>Depts</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },

  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
  },
  appBarTitle: { fontSize: 22, fontWeight: "700", color: COLORS.primary },
  appBarSub: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 32 },

  errorText: { color: COLORS.error, fontSize: 13, fontWeight: "500" },
  emptyText: { color: COLORS.onSurfaceVariant, fontSize: 13, textAlign: "center", marginTop: 8 },

  // Bento grid
  bento: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(191,202,186,0.3)",
  },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statLabel: { fontSize: 11, color: COLORS.onSurfaceVariant, fontWeight: "500" },
  statValue: { fontSize: 24, fontWeight: "700" },

  // Card shared
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.onSurface },

  // Bar chart
  barChart: { flexDirection: "row", height: 140, alignItems: "flex-end", gap: 8 },
  barCol: { flex: 1, alignItems: "center", gap: 6 },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  barFill: { width: "100%", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barFillActive: { backgroundColor: COLORS.primary },
  barFillInactive: { backgroundColor: "#a3f69c" },
  barLabel: { fontSize: 10, color: COLORS.onSurfaceVariant },
  barLabelActive: { color: COLORS.primary, fontWeight: "700" },

  // Donut
  donutRow: { flexDirection: "row", alignItems: "center", gap: 24, marginTop: 16 },
  donutCenter: { alignItems: "center" },
  donutValue: { fontSize: 18, fontWeight: "700", color: COLORS.onSurface },
  donutSub: { fontSize: 8, color: COLORS.onSurfaceVariant, letterSpacing: 0.5 },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: 12, color: COLORS.onSurfaceVariant },
  legendPct: { fontSize: 12, fontWeight: "700", color: COLORS.onSurface },

  // Recent
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  viewAll: { fontSize: 13, fontWeight: "600", color: COLORS.primary },

  complaintCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(191,202,186,0.2)",
  },
  complaintTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  complaintId: { fontSize: 10, fontWeight: "600", color: COLORS.outline, letterSpacing: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  complaintTitle: { fontSize: 14, fontWeight: "600", color: COLORS.onSurface, lineHeight: 20 },
  complaintMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaIcon: { marginLeft: 10 },
  metaText: { fontSize: 12, color: COLORS.outline },
});
