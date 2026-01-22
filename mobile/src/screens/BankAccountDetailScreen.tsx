import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { deactivateBankAccount, getBankAccountById, BankAccountDetail } from "../api/bankAccounts";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { formatApiError } from "../utils/errorMapper";
import { formatDate } from "../utils/formatters";

type Props = NativeStackScreenProps<MainStackParamList, "BankAccountDetail">;

export function BankAccountDetailScreen({ navigation, route }: Props) {
  const { accountId } = route.params;
  const [account, setAccount] = useState<BankAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadAccount = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBankAccountById(accountId);
        if (mounted) {
          setAccount(data);
        }
      } catch (err) {
        if (mounted) {
          setError(formatApiError(err, "Unable to load bank account."));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAccount();
    return () => {
      mounted = false;
    };
  }, [accountId]);

  const handleDeactivate = async () => {
    if (!account) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await deactivateBankAccount(account.id);
      setAccount({ ...account, isActive: false });
    } catch (err) {
      setError(formatApiError(err, "Unable to deactivate account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <GlassButton title="Back" variant="ghost" onPress={() => navigation.goBack()} style={styles.back} />

          <Text style={styles.kicker}>Bank account</Text>
          <Text style={styles.title}>Account details</Text>

          {error ? <ErrorBanner message={error} /> : null}

          {account ? (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Bank</Text>
                <Text style={styles.value}>{account.bankName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>IBAN</Text>
                <Text style={styles.value}>{account.iban}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Account holder</Text>
                <Text style={styles.value}>{account.accountHolderName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{account.isActive ? "Active" : "Inactive"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Added</Text>
                <Text style={styles.value}>{formatDate(account.createdAt)}</Text>
              </View>
            </GlassCard>
          ) : null}

          {loading && !account ? (
            <GlassCard>
              <Text style={styles.loadingText}>Loading account...</Text>
            </GlassCard>
          ) : null}

          {account && account.isActive ? (
            <GlassButton
              title={submitting ? "Deactivating" : "Deactivate account"}
              variant="ghost"
              onPress={handleDeactivate}
              loading={submitting}
              disabled={submitting}
              style={styles.deactivate}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40
  },
  back: {
    alignSelf: "flex-start"
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
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: "right",
    flexShrink: 1
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary
  },
  deactivate: {
    marginTop: 16
  }
});
