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
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { isValidOtp, sanitizeNumericInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerify">;

export function OtpVerifyScreen({ navigation, route }: Props) {
  const { t } = useI18n();
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
      setError(formatApiError(err, t("auth.otp_verify_failed")));
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
      setInfo(t("auth.otp_resend_success"));
      setCooldown(30);
    } catch (err) {
      setError(formatApiError(err, t("auth.otp_resend_failed")));
    } finally {
      setResending(false);
    }
  };

  const steps = [t("auth.step_phone"), t("auth.step_otp"), t("auth.step_profile")];
  const resendLabel = cooldown > 0 ? t("auth.resend_in", { time: `00:${String(cooldown).padStart(2, "0")}` }) : t("auth.resend_code");

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.container}>
            <Text style={styles.kicker}>{t("auth.otp.kicker")}</Text>
            <Text style={styles.title}>{t("auth.otp.title")}</Text>
            <Text style={styles.subtitle}>{t("auth.otp.subtitle", { phone })}</Text>

            <StepIndicator labels={steps} currentIndex={1} />

            <GlassCard>
              <GlassInput
                label={t("auth.otp.label")}
                value={code}
                onChangeText={(value) => setCode(sanitizeNumericInput(value, 6))}
                keyboardType="number-pad"
                placeholder={t("auth.otp.placeholder")}
                maxLength={6}
              />
              <GlassButton title={t("auth.verify")} onPress={handleVerify} loading={loading} disabled={!canContinue || loading} />
              <GlassButton
                title={t("auth.edit_phone")}
                variant="ghost"
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("RegisterStart", { phone, tckn })}
              />
              <GlassButton
                title={resendLabel}
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

const styles = createScaledStyles({
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
