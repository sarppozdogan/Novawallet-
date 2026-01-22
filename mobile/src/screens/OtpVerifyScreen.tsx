import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { verifyOtp } from "../api/auth";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { GlassInput } from "../components/GlassInput";
import { LiquidBackground } from "../components/LiquidBackground";
import { StepIndicator } from "../components/StepIndicator";
import { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

const steps = ["Phone", "OTP", "Profile"];

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerify">;

export function OtpVerifyScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => code.trim().length >= 4, [code]);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(phone, code.trim());
      navigation.navigate("ProfileComplete", { phone });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to verify OTP.");
      }
    } finally {
      setLoading(false);
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
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="000000"
              />
              <GlassButton title="Verify" onPress={handleVerify} loading={loading} disabled={!canContinue} />
              <GlassButton
                title="Edit phone"
                variant="ghost"
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("RegisterStart", { phone })}
              />
              {error ? <ErrorBanner message={error} /> : null}
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
