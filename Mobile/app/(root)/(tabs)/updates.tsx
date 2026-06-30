/**
 * app/(tabs)/updates.tsx
 * Jana Samasya — Updates / Announcements
 */

import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";

export default function UpdatesScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("updates.title")}</Text>
        <Text style={styles.headerSub}>{t("updates.subtitle")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.empty}>
          <MaterialIcons name="campaign" size={48} color={COLORS.outline} />
          <Text style={styles.emptyText}>{t("updates.empty")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLORS.onSurface },
  headerSub: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 2 },
  content: { flexGrow: 1, paddingHorizontal: 20 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.onSurfaceVariant },
});
