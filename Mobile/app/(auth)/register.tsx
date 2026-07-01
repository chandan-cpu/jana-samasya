import React, { useRef, useState } from "react";
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

// ─── Register Screen ──────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoaded } = useSignUp();
  const btnScale = useRef(new Animated.Value(1)).current;
  const [formdata, setFormdata] = useState({
    fullName: "",
    email: "",
    phone: "",
    aadhaar: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
  })

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!isLoaded) return;
    setError("");

    if (formdata.password !== formdata.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(async () => {
      try {
        setIsLoading(true);
        await signUp.create({
          emailAddress: formdata.email,
          password: formdata.password,
          firstName: formdata.fullName.split(" ")[0],
          lastName: formdata.fullName.split(" ").slice(1).join(" ") || undefined,
          unsafeMetadata: { phone: formdata.phone, aadhaar: formdata.aadhaar },
        });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        router.push("/(auth)/verify");
      } catch (err: any) {
        const msg = err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Registration failed. Please try again.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    });
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
            <View style={styles.logoSmall}>
              <MaterialIcons name="account-balance" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.screenTitle}>Create Account</Text>
            <Text style={styles.screenSubtitle}>Join Jana Samasya — your voice matters</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color={COLORS.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.outlineVariant}
                  autoCapitalize="words"
                  value={formdata.fullName}
                  onChangeText={(text) => setFormdata({ ...formdata, fullName: text })}
                  accessibilityLabel="Full name input"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color={COLORS.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formdata.email}
                  onChangeText={(text) => setFormdata({ ...formdata, email: text })}
                  accessibilityLabel="Email address input"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="phone" size={20} color={COLORS.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={COLORS.outlineVariant}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formdata.phone}
                  onChangeText={(text) => setFormdata({ ...formdata, phone: text })}
                  accessibilityLabel="Mobile number input"
                />
              </View>
            </View>

            {/* Aadhaar */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Aadhaar Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="badge" size={20} color={COLORS.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="12-digit Aadhaar number"
                  placeholderTextColor={COLORS.outlineVariant}
                  keyboardType="number-pad"
                  maxLength={12}
                  value={formdata.aadhaar}
                  onChangeText={(text) => setFormdata({ ...formdata, aadhaar: text })}
                  accessibilityLabel="Aadhaar number input"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={COLORS.outline} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Create a strong password"
                  placeholderTextColor={COLORS.outlineVariant}
                  secureTextEntry={!formdata.showPassword}
                  value={formdata.password}
                  onChangeText={(text) => setFormdata({ ...formdata, password: text })}
                  accessibilityLabel="Password input"
                />
                <Pressable onPress={() => setFormdata({ ...formdata, showPassword: !formdata.showPassword })} style={styles.eyeBtn}>
                  <MaterialIcons
                    name={formdata.showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={COLORS.outline}
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" size={20} color={COLORS.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your password"
                  placeholderTextColor={COLORS.outlineVariant}
                  secureTextEntry={!formdata.showPassword}
                  value={formdata.confirmPassword}
                  onChangeText={(text) => setFormdata({ ...formdata, confirmPassword: text })}
                  accessibilityLabel="Confirm password input"
                />
              </View>
            </View>

            {/* Register Button */}
            <Animated.View
              style={{ transform: [{ scale: btnScale }] }}
              className="w-full mt-4 px-5"
            >
              <Pressable
                onPress={handleRegister}
                accessibilityRole="button"
                accessibilityLabel="Create Account"
                className="w-full flex-row items-center justify-center rounded-2xl bg-black py-4 shadow-lg border border-zinc-800"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                {isLoading ? (
                  <MaterialIcons
                    name="sync"
                    size={24}
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Text className="mr-2 text-base font-bold text-white">
                      Create Account
                    </Text>

                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>
            </Animated.View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginLink}>Login</Text>
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
  },
  backBtn: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoSmall: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
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
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: "400",
  },
  eyeBtn: {
    padding: 4,
  },
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginPrompt: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "700",
  },
});
