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
import { formatApiError } from "../utils/errorMapper";
import { isValidIban, sanitizeIbanInput } from "../utils/validation";

type Props = NativeStackScreenProps<MainStackParamList, "BankAccountCreate">;

export function BankAccountCreateScreen({ navigation }: Props) {
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
      setError(formatApiError(err, "Unable to add bank account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container}>
            <GlassButton title="Back" variant="ghost" onPress={() => navigation.goBack()} />

            <Text style={styles.kicker}>Add account</Text>
            <Text style={styles.title}>Link your bank</Text>

            {error ? <ErrorBanner message={error} /> : null}

            <GlassCard style={styles.card}>
              <GlassInput
                label="IBAN"
                value={iban}
                onChangeText={(value) => setIban(sanitizeIbanInput(value))}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                autoCapitalize="characters"
                maxLength={34}
              />
              <GlassInput
                label="Bank name"
                value={bankName}
                onChangeText={setBankName}
                placeholder="Bank name"
                maxLength={100}
              />
              <GlassInput
                label="Account holder"
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder="Full name"
                maxLength={150}
              />
              <GlassButton
                title="Add bank account"
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

const styles = StyleSheet.create({
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
