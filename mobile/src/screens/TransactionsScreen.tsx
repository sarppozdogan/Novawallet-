import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTransactions, TransactionSummary } from "../api/transactions";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { formatAmount, formatDate, getTransactionStatusLabel, getTransactionTypeLabel } from "../utils/formatters";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";

type Props = NativeStackScreenProps<MainStackParamList, "Transactions">;

export function TransactionsScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { walletId, walletNumber, currencyCode } = route.params;
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransactions(walletId);
        if (mounted) {
          setTransactions(data);
        }
      } catch (err) {
        if (mounted) {
          setError(formatApiError(err, t("transactions.error_load")));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTransactions();
    return () => {
      mounted = false;
    };
  }, [walletId]);

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <BackButton onPress={() => navigation.goBack()} style={styles.back} />

          <Text style={styles.kicker}>{t("transactions.kicker")}</Text>
          <Text style={styles.title}>{t("transactions.title", { number: walletNumber })}</Text>
          <Text style={styles.subtitle}>{t("transactions.subtitle", { currency: currencyCode })}</Text>

          {error ? <ErrorBanner message={error} /> : null}

          <View style={styles.list}>
            {transactions.map((item) => (
              <GlassCard key={item.transactionId} style={styles.card}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.cardTitle}>{getTransactionTypeLabel(item.transactionType)}</Text>
                    <Text style={styles.cardMeta}>{formatDate(item.transactionDate)}</Text>
                  </View>
                  <Text style={styles.cardAmount}>
                    {item.isIncoming ? "+" : "-"}
                    {formatAmount(item.amount, item.currencyCode)}
                  </Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.cardMeta}>{getTransactionStatusLabel(item.status)}</Text>
                  <Text style={styles.cardMeta}>Ref {item.referenceCode}</Text>
                </View>
                <GlassButton
                  title={t("common.details")}
                  variant="ghost"
                  onPress={() => navigation.navigate("TransactionDetail", { transactionId: item.transactionId })}
                  style={styles.detailButton}
                />
              </GlassCard>
            ))}

            {!loading && transactions.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{t("transactions.no_items_title")}</Text>
                <Text style={styles.emptySubtitle}>{t("transactions.no_items_subtitle")}</Text>
                <GlassButton
                  title={t("wallet.top_up")}
                  onPress={() => navigation.navigate("TopUp", { walletId })}
                  style={styles.emptyButton}
                />
              </GlassCard>
            ) : null}
            {loading && transactions.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptySubtitle}>{t("transactions.loading")}</Text>
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
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6
  },
  list: {
    marginTop: 16,
    gap: 12
  },
  card: {
    paddingVertical: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
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
  cardAmount: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.textPrimary
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10
  },
  detailButton: {
    marginTop: 12
  },
  emptyCard: {
    paddingVertical: 10
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
  emptyButton: {
    marginTop: 12
  }
});
