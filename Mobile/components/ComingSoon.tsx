/**
 * components/ComingSoon.tsx
 * Generic placeholder screen for features that are not yet built.
 */

import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/colors";

type ComingSoonProps = {
  title: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export default function ComingSoon({ title, icon = "hourglass-empty" }: ComingSoonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialIcons name={icon} size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.comingSoonText}>{t("comingSoon.title")}</Text>
        <Text style={styles.comingSoonSub}>{t("comingSoon.subtitle")}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: COLORS.white },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  comingSoonText: { fontSize: 18, fontWeight: "700", color: COLORS.onSurface },
  comingSoonSub: { fontSize: 13, color: COLORS.onSurfaceVariant, textAlign: "center", lineHeight: 19 },
});
