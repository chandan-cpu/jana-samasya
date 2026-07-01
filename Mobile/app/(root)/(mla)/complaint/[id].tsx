/**
 * app/(mla)/complaint/[id].tsx
 * MLA Panel — Complaint Detail with photo, location map, and resolution form
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";
import { useApi } from "@/hooks/useApi";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

const STATUS_OPTIONS: ComplaintStatus[] = ["Pending", "In Progress", "Resolved"];

const STATUS_STYLE: Record<ComplaintStatus, { bg: string; text: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  Pending:      { bg: "#fff3e0", text: "#e65100", icon: "schedule" },
  "In Progress": { bg: "#e3f2fd", text: COLORS.secondary, icon: "autorenew" },
  Resolved:     { bg: "#e8f5e9", text: COLORS.primary, icon: "check-circle" },
};

export default function MlaComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { call } = useApi();
  const { t } = useTranslation();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState<ComplaintStatus>("Pending");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoExpanded, setPhotoExpanded] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await call<Complaint>(`/api/complaints/${id}`);
      setComplaint(data);
      setStatus(data.status);
      setResponse(data.mlaResponse ?? "");
    } catch (err: any) {
      setError(err?.message ?? t("common.error"));
    } finally {
      setIsLoading(false);
    }
  }, [call, id, t]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!response.trim() && status === complaint?.status) return;
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const updated = await call<Complaint>(`/api/complaints/${id}`, {
        method: "PATCH",
        body: { status, response },
      });
      setComplaint(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? t("common.error"));
    } finally {
      setIsSaving(false);
    }
  }

  function openInMaps() {
    if (!complaint?.location) return;
    const { lat, lng } = complaint.location;
    const label = encodeURIComponent(complaint.title);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open maps.")
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centerFill}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.outlineVariant} />
          <Text style={styles.loadingText}>{error ?? t("mla.detail.notFound")}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>{t("mla.detail.retry")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const s = STATUS_STYLE[complaint.status];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* App Bar */}
      <View style={styles.appBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </Pressable>
        <Text style={styles.appBarTitle} numberOfLines={1}>{t("mla.detail.title")}</Text>
        <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
          <MaterialIcons name={s.icon} size={13} color={s.text} />
          <Text style={[styles.statusPillText, { color: s.text }]}>{complaint.status}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Complaint Info ──────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View style={styles.idChip}>
              <Text style={styles.idChipText}>#{id.slice(-6).toUpperCase()}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </Text>
          </View>

          <Text style={styles.complaintTitle}>{complaint.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <MaterialIcons name="category" size={14} color={COLORS.primary} />
              <Text style={styles.metaChipText}>{complaint.category}</Text>
            </View>
          </View>

          <Text style={styles.descriptionText}>{complaint.description}</Text>

          {complaint.mlaResponse ? (
            <View style={styles.prevResponseBox}>
              <View style={styles.prevResponseHeader}>
                <MaterialIcons name="verified" size={14} color={COLORS.primary} />
                <Text style={styles.prevResponseLabel}>{t("mla.detail.prevResponse")}</Text>
              </View>
              <Text style={styles.prevResponseText}>{complaint.mlaResponse}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Photo ──────────────────────────────────────────────────── */}
        {complaint.photoUrl ? (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="photo-camera" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t("mla.detail.photo")}</Text>
            </View>
            <Pressable onPress={() => setPhotoExpanded(!photoExpanded)} style={styles.photoWrap}>
              <Image
                source={{ uri: complaint.photoUrl }}
                style={[styles.photo, photoExpanded && styles.photoExpanded]}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.photoExpandHint}>
                <MaterialIcons
                  name={photoExpanded ? "zoom-out" : "zoom-in"}
                  size={18}
                  color="#fff"
                />
              </View>
            </Pressable>
          </View>
        ) : null}

        {/* ── Location Map ────────────────────────────────────────────── */}
        {complaint.location ? (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={18} color={COLORS.error} />
              <Text style={styles.sectionTitle}>{t("mla.detail.location")}</Text>
              <Pressable style={styles.openMapsBtn} onPress={openInMaps}>
                <MaterialIcons name="open-in-new" size={14} color={COLORS.secondary} />
                <Text style={styles.openMapsText}>{t("mla.detail.openMaps")}</Text>
              </Pressable>
            </View>

            <View style={styles.mapWrap}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: complaint.location.lat,
                  longitude: complaint.location.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: complaint.location.lat,
                    longitude: complaint.location.lng,
                  }}
                  title={complaint.title}
                  description={complaint.category}
                />
              </MapView>
            </View>

            <View style={styles.coordsRow}>
              <MaterialIcons name="my-location" size={14} color={COLORS.outline} />
              <Text style={styles.coordsText}>
                {complaint.location.lat.toFixed(6)}, {complaint.location.lng.toFixed(6)}
              </Text>
            </View>
          </View>
        ) : null}

        {/* ── Status History ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="history" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t("mla.detail.history")}</Text>
          </View>

          {complaint.statusHistory.length === 0 ? (
            <Text style={styles.emptyText}>{t("mla.detail.noHistory")}</Text>
          ) : (
            <View style={styles.timeline}>
              {[...complaint.statusHistory].reverse().map((entry, i) => {
                const hs = STATUS_STYLE[entry.status] ?? STATUS_STYLE["Pending"];
                return (
                  <View key={i} style={styles.timelineItem}>
                    <View style={styles.timelineDotCol}>
                      <View style={[styles.timelineDot, { backgroundColor: hs.text }]} />
                      {i < complaint.statusHistory.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={[styles.timelineStatusBadge, { backgroundColor: hs.bg }]}>
                        <Text style={[styles.timelineStatusText, { color: hs.text }]}>
                          {entry.status}
                        </Text>
                      </View>
                      {entry.note ? (
                        <Text style={styles.timelineNote}>{entry.note}</Text>
                      ) : null}
                      <Text style={styles.timelineDate}>
                        {new Date(entry.changedAt).toLocaleString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── MLA Resolution Form ──────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="edit-note" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t("mla.detail.updateTitle")}</Text>
          </View>

          {/* Status chips */}
          <Text style={styles.fieldLabel}>{t("mla.detail.statusLabel")}</Text>
          <View style={styles.statusChips}>
            {STATUS_OPTIONS.map((opt) => {
              const os = STATUS_STYLE[opt];
              return (
                <Pressable
                  key={opt}
                  style={[
                    styles.statusChip,
                    status === opt
                      ? { backgroundColor: os.text, borderColor: os.text }
                      : { borderColor: COLORS.outlineVariant },
                  ]}
                  onPress={() => setStatus(opt)}
                >
                  <MaterialIcons
                    name={os.icon}
                    size={14}
                    color={status === opt ? "#fff" : os.text}
                  />
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: status === opt ? "#fff" : COLORS.onSurfaceVariant },
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Response input */}
          <Text style={styles.fieldLabel}>{t("mla.detail.responseLabel")}</Text>
          <TextInput
            style={styles.responseInput}
            placeholder={t("mla.detail.responsePlaceholder")}
            placeholderTextColor={COLORS.outlineVariant}
            multiline
            numberOfLines={4}
            value={response}
            onChangeText={setResponse}
            textAlignVertical="top"
            accessibilityLabel={t("mla.detail.responseLabel")}
          />

          {error ? (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {saveSuccess ? (
            <View style={styles.successBox}>
              <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
              <Text style={styles.successText}>{t("mla.detail.saveSuccess")}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>{t("mla.detail.saveBtn")}</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },

  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  loadingText: { fontSize: 14, color: COLORS.onSurfaceVariant },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // App bar
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  backBtn: { padding: 4 },
  appBarTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: COLORS.onSurface },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillText: { fontSize: 11, fontWeight: "700" },

  scrollContent: { padding: 16, gap: 14 },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Complaint info
  cardLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  idChip: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  idChipText: { fontSize: 10, fontWeight: "700", color: COLORS.outline, letterSpacing: 1 },
  dateText: { fontSize: 12, color: COLORS.onSurfaceVariant },
  complaintTitle: { fontSize: 18, fontWeight: "700", color: COLORS.onSurface, lineHeight: 26 },
  metaRow: { flexDirection: "row", gap: 8 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaChipText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  descriptionText: { fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 22 },
  prevResponseBox: {
    backgroundColor: "#f0f7ff",
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  prevResponseHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  prevResponseLabel: { fontSize: 12, fontWeight: "700", color: COLORS.secondary },
  prevResponseText: { fontSize: 13, color: COLORS.onSurface, lineHeight: 20 },

  // Section header
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.onSurface, flex: 1 },

  // Photo
  photoWrap: { borderRadius: 12, overflow: "hidden", position: "relative" },
  photo: { width: "100%", height: 200, borderRadius: 12 },
  photoExpanded: { height: 320 },
  photoExpandHint: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    padding: 6,
  },

  // Map
  mapWrap: { borderRadius: 12, overflow: "hidden" },
  map: { width: "100%", height: 200 },
  coordsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  coordsText: { fontSize: 12, color: COLORS.outline, fontFamily: "monospace" },
  openMapsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  openMapsText: { fontSize: 12, fontWeight: "600", color: COLORS.secondary },

  // Timeline
  emptyText: { fontSize: 13, color: COLORS.outline, textAlign: "center", paddingVertical: 8 },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", gap: 12, paddingBottom: 16 },
  timelineDotCol: { alignItems: "center", width: 14 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { flex: 1, width: 2, backgroundColor: COLORS.surfaceContainerHigh, marginTop: 4 },
  timelineContent: { flex: 1, gap: 4, paddingBottom: 4 },
  timelineStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  timelineStatusText: { fontSize: 11, fontWeight: "700" },
  timelineNote: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 19 },
  timelineDate: { fontSize: 11, color: COLORS.outline },

  // Resolution form
  fieldLabel: { fontSize: 13, fontWeight: "600", color: COLORS.onSurfaceVariant, marginBottom: -4 },
  statusChips: { flexDirection: "row", gap: 8 },
  statusChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  statusChipText: { fontSize: 11, fontWeight: "700" },
  responseInput: {
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 14,
    fontSize: 14,
    color: COLORS.onSurface,
    minHeight: 100,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fdecea",
    borderRadius: 10,
    padding: 12,
  },
  errorText: { fontSize: 13, color: COLORS.error, flex: 1 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 12,
  },
  successText: { fontSize: 13, color: COLORS.primary, fontWeight: "600", flex: 1 },
  saveBtn: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
