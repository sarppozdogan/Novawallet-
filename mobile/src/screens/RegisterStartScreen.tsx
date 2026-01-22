import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerStart } from "../api/auth";
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
import { isValidPhone, isValidTckn, sanitizeNumericInput, sanitizePhoneInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";

const steps = ["Phone", "OTP", "Profile"];

type Props = NativeStackScreenProps<AuthStackParamList, "RegisterStart">;

export function RegisterStartScreen({ navigation, route }: Props) {
  const initialPhone = route.params?.phone ?? "";
  const initialTckn = route.params?.tckn ?? "";
  const [phone, setPhone] = useState(initialPhone);
  const [tckn, setTckn] = useState(initialTckn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canContinue = useMemo(() => isValidPhone(phone) && isValidTckn(tckn), [phone, tckn]);

  const handleContinue = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await registerStart(phone.trim());
      setInfo("Verification code sent. Please check your messages.");
      navigation.navigate("OtpVerify", { phone: phone.trim(), tckn: tckn.trim() });
    } catch (err) {
      setError(formatApiError(err, "Unable to start registration."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            <Text style={styles.kicker}>Create account</Text>
            <Text style={styles.title}>Begin with your phone number</Text>
            <Text style={styles.subtitle}>We will send a secure verification code in seconds.</Text>

            <StepIndicator labels={steps} currentIndex={0} />

            <GlassCard>
              <GlassInput
                label="Phone"
                value={phone}
                onChangeText={(value) => setPhone(sanitizePhoneInput(value))}
                keyboardType="phone-pad"
                placeholder="+90 5xx xxx xxxx"
              />
              <GlassInput
                label="TC Kimlik No"
                value={tckn}
                onChangeText={(value) => setTckn(sanitizeNumericInput(value, 11))}
                keyboardType="number-pad"
                placeholder="11 haneli kimlik numarası"
                maxLength={11}
              />
              <GlassButton
                title="Send OTP"
                onPress={handleContinue}
                loading={loading}
                disabled={!canContinue || loading}
              />
              <GlassButton
                title="I already have an account"
                variant="ghost"
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Login", { phone })}
              />
              {error ? <ErrorBanner message={error} /> : null}
              {info ? <InfoBanner message={info} /> : null}
            </GlassCard>

            <View style={styles.metaRow}>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>We never share your number.</Text>
            </View>
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
    marginTop: 10,
    lineHeight: 20
  },
  secondaryButton: {
    marginTop: 12
  },
  metaRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  metaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glowCyan
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary
  }
});
