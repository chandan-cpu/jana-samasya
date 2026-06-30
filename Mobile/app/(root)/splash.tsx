/**
 * app/splash.tsx
 * Jana Samasya — Splash / Launch Screen
 * First screen shown on app open. Navigates to (auth)/login on "Get Started".
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { GamosaBorder } from "@/components/GamosaBorder";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Floating Animation Hook ──────────────────────────────────────────────────
function useFloating() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 15, duration: 1500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return anim;
}

// ─── Fade-In-Up Animation Hook ────────────────────────────────────────────────
function useFadeInUp(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 800, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, delay]);
  return { opacity, translateY };
}

// ─── Main Splash Screen ───────────────────────────────────────────────────────
export default function SplashScreen() {
  const router = useRouter();
  const floatAnim = useFloating();

  const tagline = useFadeInUp(300);
  const hero = useFadeInUp(500);
  const footer = useFadeInUp(700);

  const btnScale = useRef(new Animated.Value(1)).current;
  const [isLoading, setIsLoading] = React.useState(false);

  function handleGetStarted() {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setIsLoading(true);
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 800);
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Background Decorative Circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Top Gamosa Accent */}
      <GamosaBorder opacity={0.6} />

      {/* Main Content */}
      <View style={styles.mainContent}>

        {/* Logo — floating */}
        <Animated.View style={[styles.logoWrapper, { transform: [{ translateY: floatAnim }] }]}>
          <View style={styles.logoCircle}>
            <View style={styles.logoGlow} />
            <MaterialIcons name="account-balance" size={80} color={COLORS.primary} />
            <View style={styles.assamBadge}>
              <Text style={styles.assamBadgeText}>ASSAM</Text>
            </View>
          </View>
        </Animated.View>

        {/* App Title */}
        <Text style={styles.appTitle}>Jana Samasya</Text>
        <Text style={styles.appSubtitle}>Public Grievance Redressal System</Text>

        {/* Tagline — fade-in-up */}
        <Animated.View
          style={[
            styles.taglineContainer,
            { opacity: tagline.opacity, transform: [{ translateY: tagline.translateY }] },
          ]}
        >
          <Text style={styles.taglineAssamese}>
            "আপোনাৰ সমস্যা, আপোনাৰ কণ্ঠ"
          </Text>
          <View style={styles.taglineUnderline} />
          <Text style={styles.taglineEnglish}>(Your Problem, Your Voice)</Text>
        </Animated.View>

        {/* Hero Image — fade-in-up */}
        <Animated.View
          style={[
            styles.heroImageContainer,
            { opacity: hero.opacity, transform: [{ translateY: hero.translateY }] },
          ]}
        >
          <Image
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgF4iBA5fKZziJHlMSSJ7P6ARPYIkAaiEnS21SijFlhsC3P6J9xAiGD5_6BSjkDuVjmyQ-bvCf57rXkvnUNEN4la4YqKqCYYnuW4gVlkQ-dc5eMnwb-MT_4ZR5_Q8oLG_4QK89xORcjJiEV8bQ2hjG35cz73AHu3fPkPDYgornRadi_JYhCwPsMSURmsVEQRY-kFiUJaBAmdUsCJqK5xZ36acDUIb8k9II992Zf60B6CIIQHTuSNau_4ZYYJrl8kXV-4MX0fdl5Q4e",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroGradient} />
        </Animated.View>
      </View>

      {/* Footer — fade-in-up */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: footer.opacity, transform: [{ translateY: footer.translateY }] },
        ]}
      >
        {/* Get Started Button */}
        {/* Get Started Button */}
        <Animated.View
          style={{ transform: [{ scale: btnScale }], width: "100%" }}
          className="mt-6 px-5"
        >
          <Pressable
            onPress={handleGetStarted}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 shadow-lg active:scale-95"
          >
            {isLoading ? (
              <MaterialIcons
                name="sync"
                size={24}
                color={COLORS.onPrimary}
              />
            ) : (
              <>
                <Text className="text-base font-bold text-white">
                  Get Started
                </Text>

                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color={COLORS.onPrimary}
                />
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* Secure badge */}
        <View style={styles.securityRow}>
          <MaterialIcons name="verified-user" size={16} color={COLORS.onSurfaceVariant} />
          <Text style={styles.securityText}>Secure Government Portal</Text>
        </View>

        {/* Gov Branding */}
        <View style={styles.govBranding}>
          <Text style={styles.govInitiativeLabel}>An initiative by</Text>
          <Text style={styles.govName}>GOVERNMENT OF ASSAM</Text>
        </View>

        {/* Bottom Gamosa Accent */}
        <GamosaBorder opacity={0.4} />
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    top: -SCREEN_HEIGHT * 0.1,
    left: -SCREEN_WIDTH * 0.15,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 16,
    borderColor: COLORS.primary,
    opacity: 0.06,
    zIndex: 0,
  },
  bgCircle2: {
    position: "absolute",
    bottom: -SCREEN_HEIGHT * 0.05,
    right: -SCREEN_WIDTH * 0.1,
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 24,
    borderColor: COLORS.tertiary,
    opacity: 0.04,
    zIndex: 0,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    zIndex: 5,
  },
  logoWrapper: {
    marginBottom: 24,
    alignItems: "center",
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    position: "relative",
  },
  logoGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
  },
  assamBadge: {
    position: "absolute",
    bottom: -10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  assamBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  appTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 240,
    marginBottom: 24,
  },
  taglineContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  taglineAssamese: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "600",
    fontStyle: "italic",
    color: COLORS.onSurface,
    textAlign: "center",
    opacity: 0.9,
  },
  taglineUnderline: {
    height: 3,
    width: "50%",
    backgroundColor: COLORS.tertiaryContainer,
    borderRadius: 999,
    marginTop: 8,
    opacity: 0.5,
  },
  taglineEnglish: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginTop: 10,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  heroImageContainer: {
    width: "100%",
    maxWidth: 360,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: COLORS.surface,
    opacity: 0.35,
  },
  footer: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 8,
    alignItems: "center",
    gap: 12,
    zIndex: 5,
  },
  getStartedBtn: {
    width: "100%",
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedBtnPressed: {
    backgroundColor: COLORS.primaryContainer,
  },
  getStartedText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.6,
    marginTop: 4,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
  },
  govBranding: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  govInitiativeLabel: {
    fontSize: 12,
    color: COLORS.outline,
    marginBottom: 2,
    fontWeight: "400",
  },
  govName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
  },
});
