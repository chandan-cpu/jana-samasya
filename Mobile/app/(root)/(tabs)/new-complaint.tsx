/**
 * app/(tabs)/new-complaint.tsx
 * Jana Samasya — File a New Grievance
 */

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";
import { useApi } from "@/hooks/useApi";
import type { Complaint, ComplaintCategory } from "@/types/complaint";

// Index-aligned with each other: CATEGORIES_BY_LANG.as[i] is the Assamese
// label for CATEGORIES_BY_LANG.en[i], so a selection survives a language switch.
const CATEGORIES_BY_LANG: Record<"en" | "as", ComplaintCategory[]> = {
  en: ["Roads", "Water Supply", "Electricity", "Sanitation", "Public Safety", "Other"],
  as: ["ৰাস্তা", "পানী যোগান", "বিদ্যুৎ", "পৰিষ্কাৰ-পৰিচ্ছন্নতা", "জনসুৰক্ষা", "অন্যান্য"],
};

type PickedMedia = { uri: string; name: string; type: string };
type LocationState =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "error" }
  | { status: "ready"; lat: number; lng: number };

export default function NewComplaintScreen() {
  const router = useRouter();
  const { call } = useApi();
  const { t, i18n } = useTranslation();

  const lang = i18n.language === "as" ? "as" : "en";
  const CATEGORIES = CATEGORIES_BY_LANG[lang];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>(CATEGORIES_BY_LANG.en[0]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  useEffect(() => {
    setCategory((prev) => {
      const idx = CATEGORIES_BY_LANG.en.indexOf(prev);
      const idxAs = idx === -1 ? CATEGORIES_BY_LANG.as.indexOf(prev) : idx;
      return idxAs === -1 ? CATEGORIES[0] : CATEGORIES[idxAs];
    });
  }, [lang]);
  const [photo, setPhoto] = useState<PickedMedia | null>(null);
  const [video, setVideo] = useState<PickedMedia | null>(null);
  const [location, setLocation] = useState<LocationState>({ status: "loading" });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation({ status: "denied" });
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ status: "ready", lat, lng });
        setCoords({ lat, lng });
      } catch {
        setLocation({ status: "error" });
      }
    })();
  }, []);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    const asset = result.assets?.[0];
    if (!asset) return;
    setPhoto({
      uri: asset.uri,
      name: asset.fileName ?? "photo.jpg",
      type: asset.mimeType ?? "image/jpeg",
    });
  }

  async function pickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.7,
    });
    const asset = result.assets?.[0];
    if (!asset) return;
    setVideo({
      uri: asset.uri,
      name: asset.fileName ?? "video.mp4",
      type: asset.mimeType ?? "video/mp4",
    });
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setError(t("newComplaint.validationError"));
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("category", category);
      if (coords) {
        form.append("lat", String(coords.lat));
        form.append("lng", String(coords.lng));
      }
      if (photo) {
        form.append("photo", { uri: photo.uri, name: photo.name, type: photo.type } as any);
      }
      if (video) {
        form.append("video", { uri: video.uri, name: video.name, type: video.type } as any);
      }

      await call<Complaint>("/api/complaints", { method: "POST", body: form });
      router.back();
    } catch (err: any) {
      setError(err?.message ?? t("newComplaint.submitError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable className="self-start p-1" onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </Pressable>

          <View className="gap-1">
            <Text className="text-2xl font-bold text-on-surface">{t("newComplaint.title")}</Text>
            <Text className="text-sm text-on-surface-variant">{t("newComplaint.subtitle")}</Text>
          </View>

          {/* Category */}
          <View className="gap-2">
            <Text className="ml-1 text-sm font-semibold text-on-surface-variant">{t("newComplaint.category")}</Text>
            <Pressable
              className="h-14 flex-row items-center justify-between rounded-xl border border-outline bg-surface px-4"
              onPress={() => setCategoryPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Select category"
            >
              <Text className="text-base text-on-surface">{category}</Text>
              <MaterialIcons name="expand-more" size={22} color={COLORS.onSurfaceVariant} />
            </Pressable>
          </View>

          {/* Title */}
          <View className="gap-2">
            <Text className="ml-1 text-sm font-semibold text-on-surface-variant">{t("newComplaint.titleLabel")}</Text>
            <TextInput
              className="h-14 rounded-xl border border-outline bg-surface px-4 text-base text-on-surface"
              placeholder={t("newComplaint.titlePlaceholder")}
              placeholderTextColor={COLORS.outlineVariant}
              value={title}
              onChangeText={setTitle}
              accessibilityLabel="Complaint title"
            />
          </View>

          {/* Description */}
          <View className="gap-2">
            <Text className="ml-1 text-sm font-semibold text-on-surface-variant">{t("newComplaint.descriptionLabel")}</Text>
            <TextInput
              className="rounded-xl border border-outline bg-surface p-4 text-base text-on-surface"
              style={{ minHeight: 120, textAlignVertical: "top" }}
              placeholder={t("newComplaint.descriptionPlaceholder")}
              placeholderTextColor={COLORS.outlineVariant}
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              accessibilityLabel="Complaint description"
            />
          </View>

          {/* Media Uploads */}
          <View className="flex-row gap-4">
            <Pressable
              className="flex-1 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-5 active:scale-95"
              onPress={pickPhoto}
              accessibilityRole="button"
              accessibilityLabel="Upload photo"
            >
              {photo ? (
                <>
                  <Image source={{ uri: photo.uri }} style={{ width: 56, height: 56, borderRadius: 8 }} />
                  <Text className="mt-2 text-xs font-semibold text-on-surface" numberOfLines={1}>
                    {photo.name}
                  </Text>
                  <Pressable onPress={() => setPhoto(null)} className="mt-1">
                    <Text className="text-xs font-semibold text-error">{t("newComplaint.remove")}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <MaterialIcons name="add-a-photo" size={32} color={COLORS.primary} />
                  <Text className="mt-2 text-sm font-semibold text-on-surface">{t("newComplaint.uploadPhoto")}</Text>
                </>
              )}
            </Pressable>

            <Pressable
              className="flex-1 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-5 active:scale-95"
              onPress={pickVideo}
              accessibilityRole="button"
              accessibilityLabel="Upload video"
            >
              {video ? (
                <>
                  <MaterialIcons name="movie" size={32} color={COLORS.secondary} />
                  <Text className="mt-2 text-xs font-semibold text-on-surface" numberOfLines={1}>
                    {video.name}
                  </Text>
                  <Pressable onPress={() => setVideo(null)} className="mt-1">
                    <Text className="text-xs font-semibold text-error">{t("newComplaint.remove")}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <MaterialIcons name="video-call" size={32} color={COLORS.secondary} />
                  <Text className="mt-2 text-sm font-semibold text-on-surface">{t("newComplaint.uploadVideo")}</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* GPS Location Card */}
          <View className="overflow-hidden rounded-xl bg-surface-container-high">
            <View className="flex-row items-center justify-between border-b border-outline-variant p-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
                <Text className="text-sm font-semibold text-on-surface">{t("newComplaint.locationTitle")}</Text>
              </View>
              {coords ? (
                <View className="flex-row items-center gap-1">
                  <View className="h-2 w-2 rounded-full bg-primary" />
                  <Text className="text-xs font-semibold text-primary">{t("newComplaint.locationActive")}</Text>
                </View>
              ) : location.status === "loading" ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text className="text-xs font-semibold text-error">{t("newComplaint.locationUnavailable")}</Text>
              )}
            </View>

            {coords ? (
              <>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={{ height: 180, width: "100%" }}
                  initialRegion={{
                    latitude: coords.lat,
                    longitude: coords.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{ latitude: coords.lat, longitude: coords.lng }}
                    draggable
                    onDragEnd={(e) =>
                      setCoords({
                        lat: e.nativeEvent.coordinate.latitude,
                        lng: e.nativeEvent.coordinate.longitude,
                      })
                    }
                  />
                </MapView>
                <View className="flex-row items-center justify-center gap-1 p-2">
                  <MaterialIcons name="my-location" size={14} color={COLORS.onSurfaceVariant} />
                  <Text className="text-xs font-medium text-on-surface-variant">
                    Lat: {coords.lat.toFixed(4)}°, Lon: {coords.lng.toFixed(4)}°
                  </Text>
                </View>
              </>
            ) : (
              <View className="h-32 items-center justify-center bg-surface-dim">
                {location.status === "loading" ? (
                  <Text className="text-xs font-medium text-on-surface-variant">{t("newComplaint.fetchingLocation")}</Text>
                ) : location.status === "denied" ? (
                  <Text className="px-6 text-center text-xs font-medium text-on-surface-variant">
                    {t("newComplaint.locationDenied")}
                  </Text>
                ) : (
                  <Text className="text-xs font-medium text-on-surface-variant">{t("newComplaint.locationError")}</Text>
                )}
              </View>
            )}
          </View>

          {error ? (
            <View className="flex-row items-center gap-2 rounded-lg border border-[#ffd0d0] bg-[#fff0f0] p-3">
              <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
              <Text className="flex-1 text-sm font-medium text-error">{error}</Text>
            </View>
          ) : null}

          <Pressable
            className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:scale-95"
            onPress={handleSubmit}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Submit complaint"
          >
            {isLoading ? (
              <MaterialIcons name="sync" size={22} color={COLORS.onPrimary} />
            ) : (
              <>
                <Text className="text-base font-bold text-on-primary">{t("newComplaint.submitComplaint")}</Text>
                <MaterialIcons name="send" size={18} color={COLORS.onPrimary} />
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Picker */}
      <Modal visible={categoryPickerOpen} transparent animationType="fade" onRequestClose={() => setCategoryPickerOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setCategoryPickerOpen(false)}>
          <Pressable className="rounded-t-2xl bg-white p-4" onPress={() => {}}>
            <Text className="mb-2 px-2 text-sm font-semibold text-on-surface-variant">{t("newComplaint.selectCategory")}</Text>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                className="flex-row items-center justify-between rounded-lg px-3 py-3 active:bg-surface-container-low"
                onPress={() => {
                  setCategory(c);
                  setCategoryPickerOpen(false);
                }}
              >
                <Text className="text-base text-on-surface">{c}</Text>
                {category === c ? <MaterialIcons name="check" size={20} color={COLORS.primary} /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
