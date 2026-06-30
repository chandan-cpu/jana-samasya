/**
 * app/(auth)/verify.tsx
 * Jana Samasya — Email OTP Verification Screen
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/clerk-expo";
import { COLORS } from "@/constants/colors";
import { GamosaBorder } from "@/components/GamosaBorder";

// ─── OTP Input Boxes ──────────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(6, " ").split("");

  return (
    <Pressable style={styles.otpRow} onPress={() => inputRef.current?.focus()}>
      {digits.map((d, i) => (
        <View
          key={i}
          style={[
            styles.otpBox,
            value.length === i && styles.otpBoxActive,
            d.trim() !== "" && styles.otpBoxFilled,
          ]}
        >
          <Text style={styles.otpDigit}>{d.trim()}</Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.hiddenInput}
        caretHidden
        showSoftInputOnFocus
        autoFocus
      />
    </Pressable>
  );
}

// ─── Verify Screen ────────────────────────────────────────────────────────────
export default function VerifyScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const btnScale = useRef(new Animated.Value(1)).current;
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [resendMsg, setResendMsg] = React.useState("");

  // Redirect back if there's no pending signup to verify
  useEffect(() => {
    if (!isLoaded) return;
    if (!signUp || signUp.status === "abandoned") {
      router.replace("/(auth)/register");
    }
  }, [isLoaded, signUp]);

  async function handleVerify() {
    if (!isLoaded || code.length < 6 || isLoading) return;
    setError("");

    // Guard: signUp must exist and be in pending verification state
    if (!signUp) {
      setError("Session expired. Please go back and register again.");
      return;
    }

    // Lock immediately so a second tap during the button animation can't
    // fire a concurrent attemptEmailAddressVerification call.
    setIsLoading(true);

    // If already complete, just activate the session
    if (signUp.status === "complete") {
      if (signUp.createdSessionId) {
        await setActive!({ session: signUp.createdSessionId });
        router.replace("/");
      } else {
        setError("Account already verified. Please log in.");
        router.replace("/(auth)/login");
      }
      setIsLoading(false);
      return;
    }

    // Must be in unverified email state
    if (signUp.status !== "missing_requirements" && signUp.unverifiedFields?.includes("email_address") === false) {
      setError("No pending verification found. Please register again.");
      setIsLoading(false);
      return;
    }

    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(async () => {
      try {
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await setActive!({ session: result.createdSessionId });
          router.replace("/");
        } else {
          console.log("[verify] signUp not complete:", result.status, result.missingFields, result.unverifiedFields);
          setError(
            result.status === "missing_requirements"
              ? `Email verified, but more info is needed: ${result.missingFields?.join(", ") || "unknown"}.`
              : "Verification incomplete. Please try again."
          );
        }
      } catch (err: any) {
        const clerkCode = err?.errors?.[0]?.code;
        // Handle "already verified" gracefully
        if (clerkCode === "form_identifier_exists" || clerkCode === "session_exists") {
          router.replace("/(auth)/login");
          return;
        }
        const msg =
          err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          "Invalid code. Please try again.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    });
  }


  async function handleResend() {
    if (!isLoaded) return;
    setResendMsg("");
    setError("");
    try {
      setIsResending(true);
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      setResendMsg("A new code has been sent to your email.");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ?? "Could not resend code. Try again.";
      setError(msg);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <GamosaBorder opacity={0.6} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="mark-email-unread" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.screenTitle}>Verify Email</Text>
            <Text style={styles.screenSubtitle}>
              Enter the 6-digit code sent to your email address
            </Text>
          </View>

          {/* OTP Card */}
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Verification Code</Text>

            {/* OTP Boxes */}
            <OtpInput value={code} onChange={setCode} />

            {/* Verify Button */}
            <Animated.View
              style={{ transform: [{ scale: btnScale }] }}
              className="w-full mt-4 px-5"
            >
              <Pressable
                onPress={handleVerify}
                disabled={code.length < 6 || isLoading}
                accessibilityRole="button"
                accessibilityLabel="Verify email"
                className="w-full flex-row items-center justify-center rounded-2xl bg-black py-4 shadow-lg"
                style={({ pressed }) => ({
                  opacity: code.length < 6 ? 0.5 : pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                {isLoading ? (
                  <MaterialIcons name="sync" size={24} color="#FFFFFF" />
                ) : (
                  <>
                    <Text className="mr-2 text-base font-bold text-white">
                      Verify & Continue
                    </Text>
                    <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                  </>
                )}
              </Pressable>
            </Animated.View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Resend success */}
            {resendMsg ? (
              <View style={styles.successBox}>
                <MaterialIcons name="check-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.successText}>{resendMsg}</Text>
              </View>
            ) : null}
          </View>

          {/* Resend Link */}
          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
            <Pressable onPress={handleResend} disabled={isResending}>
              <Text style={styles.resendLink}>
                {isResending ? "Sending..." : "Resend Code"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GamosaBorder opacity={0.4} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.onSurface,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  // ── OTP ──
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    position: "relative",
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: "#f0faf1",
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: "#f0faf1",
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: "transparent",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  // ── Error / Success ──
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff0f0",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ffd0d0",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
    fontWeight: "500",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0faf1",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#b8deba",
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  // ── Resend ──
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  resendPrompt: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "700",
  },
});
