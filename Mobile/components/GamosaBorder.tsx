import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/colors";

export function GamosaBorder({ opacity = 0.6 }: { opacity?: number }) {
  return (
    <View style={[styles.gamosaRow, { opacity }]}>
      {Array.from({ length: 16 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.gamosaStripe,
            { backgroundColor: i % 2 === 0 ? COLORS.error : COLORS.white },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gamosaRow: {
    width: "100%",
    height: 4,
    flexDirection: "row",
  },
  gamosaStripe: {
    flex: 1,
    height: "100%",
  },
});
