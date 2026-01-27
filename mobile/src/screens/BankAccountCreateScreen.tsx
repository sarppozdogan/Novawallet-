import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBankAccount } from "../api/bankAccounts";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { GlassInput } from "../components/GlassInput";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { isValidIban, sanitizeIbanInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";

type Props = NativeStackScreenProps<MainStackParamList, "BankAccountCreate">;

export function BankAccountCreateScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [iban, setIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return isValidIban(iban) && bankName.trim().length > 1 && accountHolderName.trim().length > 1;
  }, [iban, bankName, accountHolderName]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createBankAccount({
        iban: sanitizeIbanInput(iban),
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim()
      });
      navigation.replace("BankAccountDetail", { accountId: result.id });
    } catch (err) {
      setError(formatApiError(err, t("bank_accounts.create.error")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container}>
            <BackButton onPress={() => navigation.goBack()} />

            <Text style={styles.kicker}>{t("bank_accounts.create.kicker")}</Text>
            <Text style={styles.title}>{t("bank_accounts.create.title")}</Text>

            {error ? <ErrorBanner message={error} /> : null}

            <GlassCard style={styles.card}>
              <GlassInput
                label={t("bank_accounts.iban_label")}
                value={iban}
                onChangeText={(value) => setIban(sanitizeIbanInput(value))}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                autoCapitalize="characters"
                maxLength={26}
              />
              <GlassInput
                label={t("bank_accounts.bank_name_label")}
                value={bankName}
                onChangeText={setBankName}
                placeholder={t("bank_accounts.bank_name_placeholder")}
                maxLength={100}
              />
              <GlassInput
                label={t("bank_accounts.account_holder_label")}
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder={t("bank_accounts.account_holder_placeholder")}
                maxLength={150}
              />
              <GlassButton
                title={t("bank_accounts.create.add_button")}
                onPress={handleSubmit}
                loading={loading}
                disabled={!canSubmit || loading}
              />
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
    paddingTop: 20,
    paddingBottom: 40
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2.2,
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 16
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: 10
  },
  card: {
    marginTop: 20
  }
});
