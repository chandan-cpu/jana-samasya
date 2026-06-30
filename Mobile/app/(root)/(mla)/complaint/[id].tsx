/**
 * app/(mla)/complaint/[id].tsx
 * MLA Panel — Complaint Detail + Resolution Form
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useApi } from "@/hooks/useApi";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

const STATUS_OPTIONS: ComplaintStatus[] = ["Pending", "In Progress", "Resolved"];

export default function MlaComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { call } = useApi();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState<ComplaintStatus>("Pending");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await call<Complaint>(`/api/complaints/${id}`);
      setComplaint(data);
      setStatus(data.status);
      setResponse(data.mlaResponse ?? "");
    } catch (err: any) {
      setError(err?.message ?? "Failed to load complaint.");
    } finally {
      setIsLoading(false);
    }
  }, [call, id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await call<Complaint>(`/api/complaints/${id}`, {
        method: "PATCH",
        body: { status, response },
      });
      setComplaint(updated);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update complaint.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Text style={styles.loadingText}>{error ?? "Complaint not found."}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.title}>{complaint.title}</Text>
          <View style={styles.metaRow}>
            <MaterialIcons name="category" size={14} color={COLORS.outline} />
            <Text style={styles.metaText}>{complaint.category}</Text>
            <MaterialIcons name="calendar-today" size={14} color={COLORS.outline} style={{ marginLeft: 12 }} />
            <Text style={styles.metaText}>{new Date(complaint.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.description}>{complaint.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>History</Text>
          {complaint.statusHistory.length === 0 ? (
            <Text style={styles.emptyText}>No status changes yet.</Text>
          ) : (
            complaint.statusHistory.map((entry, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyStatus}>{entry.status}</Text>
                {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
                <Text style={styles.historyDate}>{new Date(entry.changedAt).toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Update Status & Resolution</Text>

          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.statusChip, status === opt && styles.statusChipActive]}
                onPress={() => setStatus(opt)}
              >
                <Text style={[styles.statusChipText, status === opt && styles.statusChipTextActive]}>{opt}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.responseInput}
            placeholder="Write a response to the citizen..."
            placeholderTextColor={COLORS.outlineVariant}
            multiline
            numberOfLines={4}
            value={response}
            onChangeText={setResponse}
            accessibilityLabel="Resolution response"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={isSaving} accessibilityRole="button" accessibilityLabel="Save">
            {isSaving ? (
              <MaterialIcons name="sync" size={20} color={COLORS.onPrimary} />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Save Update</Text>
                <MaterialIcons name="check-circle" size={18} color={COLORS.onPrimary} />
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  loadingText: { textAlign: "center", marginTop: 40, color: COLORS.onSurfaceVariant },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  backBtn: { alignSelf: "flex-start", padding: 4 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.onSurface },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.outline },
  description: { fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.onSurface },
  emptyText: { fontSize: 13, color: COLORS.outline },
  historyRow: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.outlineVariant,
    paddingLeft: 12,
    gap: 2,
  },
  historyStatus: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  historyNote: { fontSize: 13, color: COLORS.onSurfaceVariant },
  historyDate: { fontSize: 11, color: COLORS.outline },
  statusOptions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  statusChipActive: { backgroundColor: COLORS.primary },
  statusChipText: { fontSize: 12, fontWeight: "600", color: COLORS.onSurfaceVariant },
  statusChipTextActive: { color: COLORS.white },
  responseInput: {
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 12,
    fontSize: 14,
    color: COLORS.onSurface,
    minHeight: 96,
    textAlignVertical: "top",
  },
  errorText: { fontSize: 13, color: COLORS.error, fontWeight: "500" },
  saveBtn: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: { color: COLORS.onPrimary, fontSize: 15, fontWeight: "700" },
});
