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
import { LanguageSelector } from "../components/LanguageSelector";
import { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { isValidPassword, isValidPhone, sanitizePhoneInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";

type Props = NativeStackScreenProps<AuthStackParamList, "Login"> & {
  onAuthenticated: (token: string) => void;
};

export function LoginScreen({ navigation, route, onAuthenticated }: Props) {
  const { t } = useI18n();
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

      setError(t("auth.login_failed"));
    } catch (err) {
      setError(formatApiError(err, t("auth.login_failed")));
    } finally {
      setLoading(false);
    }
  };


  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.container}>
            <View style={styles.language}>
              <LanguageSelector />
            </View>
            <Text style={styles.kicker}>{t("auth.login.kicker")}</Text>
            <Text style={styles.title}>{t("auth.login.title")}</Text>
            <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>

            <GlassCard style={styles.card}>
              <GlassInput
                label={t("auth.phone_label")}
                value={phone}
                onChangeText={(value) => setPhone(sanitizePhoneInput(value))}
                keyboardType="phone-pad"
                placeholder={t("auth.phone_placeholder")}
              />
              <GlassInput
                label={t("auth.password_label")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={t("auth.password_placeholder")}
              />
              <GlassButton title={t("auth.sign_in")} onPress={handleLogin} loading={loading} disabled={!canLogin || loading} />
              <GlassButton
                title={needsProfile ? t("auth.completing_profile") : t("auth.create_account")}
                variant="ghost"
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("RegisterStart", { phone })}
                disabled={loading}
              />
              {error ? <ErrorBanner message={error} /> : null}
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("auth.footer")}</Text>
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
    justifyContent: "center",
    position: "relative"
  },
  language: {
    position: "absolute",
    right: 0,
    top: 0
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
