/**
 * app/(tabs)/complaint/[id].tsx
 * Jana Samasya — Complaint Detail with timeline tracker
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useApi } from "@/hooks/useApi";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

// ─── Status pipeline ──────────────────────────────────────────────────────────
const PIPELINE: { status: ComplaintStatus; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { status: "Pending",     label: "Submitted",           icon: "check-circle" },
  { status: "Pending",     label: "Verified",            icon: "verified" },
  { status: "In Progress", label: "Department Assigned", icon: "assignment-ind" },
  { status: "In Progress", label: "Work Started",        icon: "build" },
  { status: "Resolved",    label: "Completed",           icon: "task-alt" },
];

function getPipelineStep(status: ComplaintStatus): number {
  if (status === "Resolved") return PIPELINE.length;   // all done
  if (status === "In Progress") return 2;              // up to Department Assigned
  return 1;                                            // Pending → Submitted only
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#e3f2fd", text: COLORS.secondary },
  Resolved:      { bg: "#e8f5e9", text: COLORS.primary },
  Pending:       { bg: "#fff3e0", text: COLORS.tertiary },
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CitizenComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { call } = useApi();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await call<Complaint>(`/api/complaints/${id}`);
      setComplaint(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load complaint.");
    } finally {
      setIsLoading(false);
    }
  }, [call, id]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Text style={styles.centerText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Text style={styles.centerText}>{error ?? "Complaint not found."}</Text>
      </SafeAreaView>
    );
  }

  const statusStyle = STATUS_COLORS[complaint.status] ?? { bg: COLORS.surfaceContainerHigh, text: COLORS.onSurface };
  const doneUpTo = getPipelineStep(complaint.status);

  // Match history entries to pipeline steps by index
  const historyByStep = complaint.statusHistory;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

      {/* ── Header ── */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Complaint Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Info Card ── */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.complaintIdLabel}>Complaint ID</Text>
              <Text style={styles.complaintId}>#CMP{complaint._id.slice(-4).toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{complaint.status}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <MaterialIcons name="report-problem" size={15} color={COLORS.onSurfaceVariant} />
            <Text style={styles.metaValue}>{complaint.title}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="location-on" size={15} color={COLORS.onSurfaceVariant} />
            <Text style={styles.metaValue}>{complaint.category}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="calendar-today" size={15} color={COLORS.onSurfaceVariant} />
            <Text style={styles.metaValue}>
              {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })},{" "}
              {new Date(complaint.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit", minute: "2-digit",
              })}
            </Text>
          </View>

          {complaint.photoUrl ? (
            <Image source={{ uri: complaint.photoUrl }} style={styles.photo} resizeMode="cover" />
          ) : null}
        </View>

        {/* ── Tracking Status Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tracking Status</Text>

          {PIPELINE.map((step, i) => {
            const isDone    = i < doneUpTo;
            const isCurrent = i === doneUpTo - 1;
            const isPending = i >= doneUpTo;
            const isLast    = i === PIPELINE.length - 1;

            // Pull matching history entry if available
            const histEntry = historyByStep[i];
            const dateStr = histEntry
              ? new Date(histEntry.changedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                }) +
                ", " +
                new Date(histEntry.changedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit", minute: "2-digit",
                })
              : isPending
              ? "Pending"
              : null;

            const dotColor = isDone
              ? isCurrent
                ? COLORS.secondary
                : COLORS.primary
              : COLORS.outlineVariant;

            return (
              <View key={i} style={styles.timelineRow}>
                {/* Left: dot + line */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.dot, { backgroundColor: dotColor, borderColor: dotColor }]}>
                    {isDone && (
                      <MaterialIcons
                        name={isCurrent ? step.icon : "check"}
                        size={12}
                        color={COLORS.white}
                      />
                    )}
                  </View>
                  {!isLast && (
                    <View style={[styles.line, { backgroundColor: i < doneUpTo - 1 ? COLORS.primary : COLORS.outlineVariant }]} />
                  )}
                </View>

                {/* Right: label + date */}
                <View style={styles.timelineContent}>
                  <Text style={[styles.stepLabel, isPending && styles.stepLabelPending]}>
                    {step.label}
                  </Text>
                  {dateStr ? (
                    <Text style={[styles.stepDate, isPending && styles.stepDatePending]}>
                      {dateStr}
                    </Text>
                  ) : null}
                  {histEntry?.note ? (
                    <Text style={styles.stepNote}>{histEntry.note}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── MLA Response ── */}
        {complaint.mlaResponse ? (
          <View style={styles.card}>
            <View style={styles.responseHeader}>
              <MaterialIcons name="account-balance" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Response from your MLA</Text>
            </View>
            <Text style={styles.responseText}>{complaint.mlaResponse}</Text>
          </View>
        ) : null}

        {/* ── View All Button ── */}
        <Pressable
          style={({ pressed }) => [styles.allBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.allBtnText}>View All Complaints</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  centerText: { textAlign: "center", marginTop: 40, color: COLORS.onSurfaceVariant },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: COLORS.white },

  scrollContent: { padding: 16, gap: 14, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  cardTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  complaintIdLabel: { fontSize: 11, color: COLORS.outline, fontWeight: "500", letterSpacing: 0.3 },
  complaintId: { fontSize: 18, fontWeight: "800", color: COLORS.onSurface, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "700" },

  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  metaValue: { fontSize: 13, color: COLORS.onSurfaceVariant, flex: 1, lineHeight: 18 },

  photo: { width: "100%", height: 160, borderRadius: 10, marginTop: 4 },

  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.onSurface, marginBottom: 4 },

  // Timeline
  timelineRow: { flexDirection: "row", gap: 14 },
  timelineLeft: { alignItems: "center", width: 24 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { width: 2, flex: 1, minHeight: 28, marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 14, fontWeight: "700", color: COLORS.onSurface },
  stepLabelPending: { color: COLORS.outline, fontWeight: "500" },
  stepDate: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  stepDatePending: { color: COLORS.outlineVariant },
  stepNote: { fontSize: 12, color: COLORS.secondary, marginTop: 2 },

  responseHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  responseText: { fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 20 },

  allBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    marginTop: 4,
  },
  allBtnText: { fontSize: 15, fontWeight: "700", color: COLORS.secondary },
});
