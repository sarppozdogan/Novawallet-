import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { completeProfile } from "../api/auth";
import { ErrorBanner } from "../components/ErrorBanner";
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
import { createScaledStyles } from "../theme/scale";
import { isValidCurrencyCode, isValidPassword, isValidTaxNumber, isValidTckn, sanitizeNumericInput } from "../utils/validation";

type Props = NativeStackScreenProps<AuthStackParamList, "ProfileComplete">;

type UserType = "individual" | "corporate";

export function ProfileCompleteScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { phone, tckn: initialTckn } = route.params;
  const [userType, setUserType] = useState<UserType>("individual");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [tckn, setTckn] = useState(initialTckn ?? "");
  const [taxNumber, setTaxNumber] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [currencyCode, setCurrencyCode] = useState("TRY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!isValidPassword(password)) {
      return false;
    }
    if (!isValidCurrencyCode(currencyCode)) {
      return false;
    }
    if (userType === "individual") {
      return name.trim().length > 0 && surname.trim().length > 0 && isValidTckn(tckn);
    }
    return isValidTaxNumber(taxNumber);
  }, [password, userType, name, surname, tckn, taxNumber, currencyCode]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setLocalError(null);
    if (!isValidPassword(password)) {
      setLoading(false);
      setLocalError(t("auth.error_password_short"));
      return;
    }
    if (!isValidCurrencyCode(currencyCode)) {
      setLoading(false);
      setLocalError(t("auth.error_currency_code"));
      return;
    }
    if (userType === "individual") {
      if (!name.trim() || !surname.trim()) {
        setLoading(false);
        setLocalError(t("auth.error_name_surname_required"));
        return;
      }
      if (!isValidTckn(tckn)) {
        setLoading(false);
        setLocalError(t("auth.error_tckn"));
        return;
      }
    } else if (!isValidTaxNumber(taxNumber)) {
      setLoading(false);
      setLocalError(t("auth.error_tax_number"));
      return;
    }
    try {
      await completeProfile({
        phone,
        userType: userType === "individual" ? 1 : 2,
        password: password.trim(),
        name: name.trim() || null,
        surname: surname.trim() || null,
        address: address.trim() || null,
        tckn: userType === "individual" ? tckn.trim() : null,
        taxNumber: userType === "corporate" ? taxNumber.trim() : null,
        currencyCode: currencyCode.trim().toUpperCase() || "TRY"
      });

      navigation.navigate("Login", { phone });
    } catch (err) {
      setError(formatApiError(err, t("auth.profile_complete_failed")));
    } finally {
      setLoading(false);
    }
  };

  const steps = [t("auth.step_phone"), t("auth.step_otp"), t("auth.step_profile")];

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.kicker}>{t("auth.profile.kicker")}</Text>
            <Text style={styles.title}>{t("auth.profile.title")}</Text>
            <Text style={styles.subtitle}>{t("auth.profile.subtitle")}</Text>

            <StepIndicator labels={steps} currentIndex={2} />

            <View style={styles.segmented}>
              <Text style={styles.segmentLabel}>{t("auth.account_type_label")}</Text>
              <View style={styles.segmentRow}>
                <Pressable
                  onPress={() => setUserType("individual")}
                  style={[styles.segmentItem, userType === "individual" && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, userType === "individual" && styles.segmentTextActive]}>
                    {t("auth.account_individual")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setUserType("corporate")}
                  style={[styles.segmentItem, userType === "corporate" && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, userType === "corporate" && styles.segmentTextActive]}>
                    {t("auth.account_corporate")}
                  </Text>
                </Pressable>
              </View>
            </View>

            <GlassCard>
              {userType === "individual" ? (
                <>
                  <GlassInput
                    label={t("auth.first_name")}
                    value={name}
                    onChangeText={setName}
                    placeholder={t("auth.name_placeholder")}
                    maxLength={100}
                  />
                  <GlassInput
                    label={t("auth.last_name")}
                    value={surname}
                    onChangeText={setSurname}
                    placeholder={t("auth.surname_placeholder")}
                    maxLength={100}
                  />
                  <GlassInput
                    label={t("auth.tckn_short_label")}
                    value={tckn}
                    onChangeText={(value) => setTckn(sanitizeNumericInput(value, 11))}
                    keyboardType="number-pad"
                    placeholder={t("auth.tckn_short_placeholder")}
                    maxLength={11}
                  />
                </>
              ) : (
                <>
                  <GlassInput
                    label={t("auth.tax_number")}
                    value={taxNumber}
                    onChangeText={(value) => setTaxNumber(sanitizeNumericInput(value, 10))}
                    keyboardType="number-pad"
                    placeholder={t("auth.tax_number_placeholder")}
                    maxLength={10}
                  />
                  <GlassInput label={t("auth.contact_name_optional")} value={name} onChangeText={setName} maxLength={100} />
                  <GlassInput label={t("auth.contact_surname_optional")} value={surname} onChangeText={setSurname} maxLength={100} />
                </>
              )}

              <GlassInput
                label={t("auth.password_label")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={t("auth.password_placeholder_short")}
              />
              <GlassInput
                label={t("auth.address_optional")}
                value={address}
                onChangeText={setAddress}
                placeholder={t("auth.address_placeholder")}
                maxLength={512}
              />
              <GlassInput
                label={t("auth.currency_code")}
                value={currencyCode}
                onChangeText={(value) => setCurrencyCode(value.toUpperCase().replace(/[^A-Z]/g, ""))}
                placeholder="TRY"
                autoCapitalize="characters"
                maxLength={3}
              />

              <GlassButton
                title={t("auth.complete_profile")}
                onPress={handleSubmit}
                loading={loading}
                disabled={!canSubmit || loading}
              />
              {localError ? <ErrorBanner message={localError} /> : null}
              {error ? <ErrorBanner message={error} /> : null}
            </GlassCard>
          </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40
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
  segmented: {
    marginBottom: 16
  },
  segmentLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)"
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentItemActive: {
    backgroundColor: "rgba(98, 247, 247, 0.2)",
    overflow: "hidden"
  },
  segmentText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary
  },
  segmentTextActive: {
    color: colors.textPrimary
  }
});
