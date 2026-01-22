import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerStart } from "../api/auth";
import { PhoneField } from "../components/PhoneField";
import { ErrorBanner } from "../components/ErrorBanner";
import { InfoBanner } from "../components/InfoBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { GlassInput } from "../components/GlassInput";
import { LiquidBackground } from "../components/LiquidBackground";
import { LanguageSelector } from "../components/LanguageSelector";
import { StepIndicator } from "../components/StepIndicator";
import { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { buildPhoneNumber, getMaxLocalLength, parsePhoneNumber, sanitizeLocalPhoneInput } from "../utils/countryCodes";
import { isValidPhone, isValidTckn, sanitizeNumericInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";

type Props = NativeStackScreenProps<AuthStackParamList, "RegisterStart">;

export function RegisterStartScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const initialPhone = route.params?.phone ?? "";
  const initialTckn = route.params?.tckn ?? "";
  const [country, setCountry] = useState(() => parsePhoneNumber(initialPhone).country);
  const [localNumber, setLocalNumber] = useState(() => parsePhoneNumber(initialPhone).local);
  const [tckn, setTckn] = useState(initialTckn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const parsed = parsePhoneNumber(initialPhone);
    setCountry(parsed.country);
    setLocalNumber(parsed.local);
  }, [initialPhone]);

  const maxLocalLength = getMaxLocalLength(country);
  const fullPhone = buildPhoneNumber(country, localNumber);
  const canContinue = useMemo(() => isValidPhone(fullPhone) && isValidTckn(tckn), [fullPhone, tckn]);

  const handleContinue = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await registerStart(fullPhone.trim());
      setInfo(t("auth.register_start_success"));
      navigation.navigate("OtpVerify", { phone: fullPhone.trim(), tckn: tckn.trim() });
    } catch (err) {
      setError(formatApiError(err, t("auth.register_start_failed")));
    } finally {
      setLoading(false);
    }
  };

  const steps = [t("auth.step_phone"), t("auth.step_otp"), t("auth.step_profile")];

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            <View style={styles.language}>
              <LanguageSelector />
            </View>
            <Text style={styles.kicker}>{t("auth.register.kicker")}</Text>
            <Text style={styles.title}>{t("auth.register.title")}</Text>
            <Text style={styles.subtitle}>{t("auth.register.subtitle")}</Text>

            <StepIndicator labels={steps} currentIndex={0} />

            <GlassCard>
              <PhoneField
                label={t("auth.phone_label")}
                country={country}
                onSelectCountry={setCountry}
                value={localNumber}
                onChangeText={(value) => setLocalNumber(sanitizeLocalPhoneInput(value, country))}
                placeholder={t("auth.phone_placeholder")}
                maxLength={maxLocalLength}
              />
              <GlassInput
                label={t("auth.tckn_label")}
                value={tckn}
                onChangeText={(value) => setTckn(sanitizeNumericInput(value, 11))}
                keyboardType="number-pad"
                placeholder={t("auth.tckn_placeholder")}
                maxLength={11}
              />
              <GlassButton
                title={t("auth.send_otp")}
                onPress={handleContinue}
                loading={loading}
                disabled={!canContinue || loading}
              />
              <GlassButton
                title={t("auth.already_have_account")}
                variant="ghost"
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Login", { phone: fullPhone })}
              />
              {error ? <ErrorBanner message={error} /> : null}
              {info ? <InfoBanner message={info} /> : null}
            </GlassCard>

            <View style={styles.metaRow}>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{t("auth.meta_never_share")}</Text>
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
