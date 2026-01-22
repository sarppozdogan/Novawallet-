import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getBankAccounts, BankAccountSummary } from "../api/bankAccounts";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";


type Props = NativeStackScreenProps<MainStackParamList, "BankAccounts">;

export function BankAccountsScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<BankAccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBankAccounts(true);
      setAccounts(data);
    } catch (err) {
      setError(formatApiError(err, t("bank_accounts.error_load")));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <BackButton onPress={() => navigation.goBack()} />
            <GlassButton
              title={t("common.add")}
              onPress={() => navigation.navigate("BankAccountCreate")}
              style={styles.addButton}
            />
          </View>

          <Text style={styles.kicker}>{t("bank_accounts.kicker")}</Text>
          <Text style={styles.title}>{t("bank_accounts.title")}</Text>

          {error ? <ErrorBanner message={error} /> : null}

          <View style={styles.list}>
            {accounts.map((account) => (
              <GlassCard key={account.id} style={styles.card}>
                <Text style={styles.cardTitle}>{account.bankName}</Text>
                <Text style={styles.cardMeta}>{account.iban}</Text>
                <Text style={styles.cardMeta}>{account.accountHolderName}</Text>
                <View style={styles.cardFooter}>
                  <Text style={[styles.status, account.isActive ? styles.statusActive : styles.statusInactive]}>
                    {account.isActive ? t("common.active") : t("common.inactive")}
                  </Text>
                  <GlassButton
                    title={t("common.details")}
                    variant="ghost"
                    onPress={() => navigation.navigate("BankAccountDetail", { accountId: account.id })}
                    style={styles.detailButton}
                  />
                </View>
              </GlassCard>
            ))}
            {!loading && accounts.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptyTitle}>{t("bank_accounts.empty_title")}</Text>
                <Text style={styles.emptySubtitle}>{t("bank_accounts.empty_subtitle")}</Text>
                <GlassButton
                  title={t("bank_accounts.add_button")}
                  onPress={() => navigation.navigate("BankAccountCreate")}
                  style={styles.addButtonFull}
                />
              </GlassCard>
            ) : null}
            {loading && accounts.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptySubtitle}>{t("bank_accounts.loading")}</Text>
              </GlassCard>
            ) : null}
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  addButton: {
    minWidth: 90
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
  list: {
    marginTop: 16,
    gap: 12
  },
  card: {
    paddingVertical: 8
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textPrimary
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  status: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  statusActive: {
    color: colors.success
  },
  statusInactive: {
    color: colors.warning
  },
  detailButton: {
    minWidth: 90
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.textPrimary
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6
  },
  addButtonFull: {
    marginTop: 12
  }
});
