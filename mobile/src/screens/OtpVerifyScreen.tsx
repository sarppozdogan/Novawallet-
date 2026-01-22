import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerStart, verifyOtp } from "../api/auth";
import { ErrorBanner } from "../components/ErrorBanner";
import { InfoBanner } from "../components/InfoBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { GlassInput } from "../components/GlassInput";
import { LiquidBackground } from "../components/LiquidBackground";
import { StepIndicator } from "../components/StepIndicator";
import { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { formatApiError } from "../utils/errorMapper";
import { isValidOtp, sanitizeNumericInput } from "../utils/validation";

const steps = ["Phone", "OTP", "Profile"];

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerify">;

export function OtpVerifyScreen({ navigation, route }: Props) {
  const { phone, tckn } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(30);

  const canContinue = useMemo(() => isValidOtp(code), [code]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await verifyOtp(phone, code.trim());
      navigation.navigate("ProfileComplete", { phone, tckn });
    } catch (err) {
      setError(formatApiError(err, "Unable to verify OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      await registerStart(phone);
      setInfo("A new verification code has been sent.");
      setCooldown(30);
    } catch (err) {
      setError(formatApiError(err, "Unable to resend OTP."));
    } finally {
      setResending(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.container}>
            <Text style={styles.kicker}>Security check</Text>
            <Text style={styles.title}>Enter verification code</Text>
            <Text style={styles.subtitle}>Code sent to {phone}</Text>

            <StepIndicator labels={steps} currentIndex={1} />

            <GlassCard>
              <GlassInput
                label="OTP Code"
                value={code}
                onChangeText={(value) => setCode(sanitizeNumericInput(value, 6))}
                keyboardType="number-pad"
                placeholder="000000"
                maxLength={6}
              />
              <GlassButton title="Verify" onPress={handleVerify} loading={loading} disabled={!canContinue || loading} />
              <GlassButton
                title="Edit phone"
                variant="ghost"
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("RegisterStart", { phone, tckn })}
              />
              <GlassButton
                title={cooldown > 0 ? `Resend in 00:${String(cooldown).padStart(2, "0")}` : "Resend code"}
                variant="ghost"
                style={styles.secondaryButton}
                onPress={handleResend}
                disabled={cooldown > 0}
                loading={resending}
              />
              {error ? <ErrorBanner message={error} /> : null}
              {info ? <InfoBanner message={info} /> : null}
            </GlassCard>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  safe: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 2.2,
    color: colors.textSecondary,
    textTransform: "uppercase"
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: 12
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10
  },
  secondaryButton: {
    marginTop: 12
  }
});
