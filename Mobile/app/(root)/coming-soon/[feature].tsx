/**
 * app/(root)/coming-soon/[feature].tsx
 * Generic "coming soon" route for not-yet-built profile menu items.
 */

import React from "react";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import ComingSoon from "@/components/ComingSoon";

export default function ComingSoonRoute() {
  const { title, icon } = useLocalSearchParams<{ title?: string; icon?: string }>();

  return (
    <ComingSoon
      title={title ?? "Coming Soon"}
      icon={(icon as keyof typeof MaterialIcons.glyphMap) ?? "hourglass-empty"}
    />
  );
}
