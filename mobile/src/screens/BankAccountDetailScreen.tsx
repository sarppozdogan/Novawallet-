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
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { formatDate } from "../utils/formatters";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";

type Props = NativeStackScreenProps<MainStackParamList, "BankAccountDetail">;

export function BankAccountDetailScreen({ navigation, route }: Props) {
  const { t } = useI18n();
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
          setError(formatApiError(err, t("bank_account.detail.error_load")));
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
      setError(formatApiError(err, t("bank_account.detail.error_deactivate")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <BackButton onPress={() => navigation.goBack()} style={styles.back} />

          <Text style={styles.kicker}>{t("bank_account.detail.kicker")}</Text>
          <Text style={styles.title}>{t("bank_account.detail.title")}</Text>

          {error ? <ErrorBanner message={error} /> : null}

          {account ? (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.bank")}</Text>
                <Text style={styles.value}>{account.bankName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.iban")}</Text>
                <Text style={styles.value}>{account.iban}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.account_holder")}</Text>
                <Text style={styles.value}>{account.accountHolderName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.status")}</Text>
                <Text style={styles.value}>{account.isActive ? t("common.active") : t("common.inactive")}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.added")}</Text>
                <Text style={styles.value}>{formatDate(account.createdAt)}</Text>
              </View>
            </GlassCard>
          ) : null}

          {loading && !account ? (
            <GlassCard>
              <Text style={styles.loadingText}>{t("bank_account.detail.loading")}</Text>
            </GlassCard>
          ) : null}

          {account && account.isActive ? (
            <GlassButton
              title={submitting ? t("bank_account.detail.deactivating") : t("bank_account.detail.deactivate")}
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

const styles = createScaledStyles({
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
