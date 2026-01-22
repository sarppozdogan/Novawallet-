import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { login, registerStart } from "../api/auth";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { GlassInput } from "../components/GlassInput";
import { LiquidBackground } from "../components/LiquidBackground";
import { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { formatApiError } from "../utils/errorMapper";
import { isValidPassword, isValidPhone, sanitizePhoneInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";

type Props = NativeStackScreenProps<AuthStackParamList, "Login"> & {
  onAuthenticated: (token: string) => void;
};

export function LoginScreen({ navigation, route, onAuthenticated }: Props) {
  const initialPhone = route.params?.phone ?? "";
  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  const canLogin = useMemo(() => isValidPhone(phone) && isValidPassword(password), [phone, password]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setNeedsProfile(false);
    try {
      const result = await login(phone.trim(), password.trim());
      if (result.isSuccess && result.token) {
        onAuthenticated(result.token);
        return;
      }

      if (result.requiresProfileCompletion) {
        setNeedsProfile(true);
        await registerStart(phone.trim());
        navigation.navigate("OtpVerify", { phone: phone.trim() });
        return;
      }

      setError("Login failed.");
    } catch (err) {
      setError(formatApiError(err, "Login failed."));
    } finally {
      setLoading(false);
    }
  };


  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.container}>
            <Text style={styles.kicker}>Welcome back</Text>
            <Text style={styles.title}>Sign in to NovaWallet</Text>
            <Text style={styles.subtitle}>Secure access to your liquid portfolio.</Text>

            <GlassCard style={styles.card}>
              <GlassInput
                label="Phone"
                value={phone}
                onChangeText={(value) => setPhone(sanitizePhoneInput(value))}
                keyboardType="phone-pad"
                placeholder="+90 5xx xxx xxxx"
              />
              <GlassInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
              />
              <GlassButton title="Sign in" onPress={handleLogin} loading={loading} disabled={!canLogin || loading} />
              <GlassButton
                title={needsProfile ? "Completing profile" : "Create account"}
                variant="ghost"
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("RegisterStart", { phone })}
                disabled={loading}
              />
              {error ? <ErrorBanner message={error} /> : null}
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Face ID • Encrypted storage • Zero sharing</Text>
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
    paddingTop: 24,
    justifyContent: "center"
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
    fontSize: 30,
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
  card: {
    marginTop: 32
  },
  secondaryButton: {
    marginTop: 12
  },
  footer: {
    marginTop: 24,
    alignItems: "center"
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary
  }
});
