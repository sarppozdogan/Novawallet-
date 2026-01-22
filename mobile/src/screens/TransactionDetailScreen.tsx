import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTransactionById, TransactionDetail } from "../api/transactions";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { formatApiError } from "../utils/errorMapper";
import { formatAmount, formatDate, getTransactionStatusLabel, getTransactionTypeLabel } from "../utils/formatters";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";

type Props = NativeStackScreenProps<MainStackParamList, "TransactionDetail">;

export function TransactionDetailScreen({ navigation, route }: Props) {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadTransaction = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransactionById(transactionId);
        if (mounted) {
          setTransaction(data);
        }
      } catch (err) {
        if (mounted) {
          setError(formatApiError(err, "Unable to load transaction."));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTransaction();
    return () => {
      mounted = false;
    };
  }, [transactionId]);

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <BackButton onPress={() => navigation.goBack()} style={styles.back} />

          <Text style={styles.kicker}>Transaction detail</Text>
          <Text style={styles.title}>Reference {transaction?.referenceCode ?? ""}</Text>

          {error ? <ErrorBanner message={error} /> : null}

          {transaction ? (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{getTransactionTypeLabel(transaction.transactionType)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{getTransactionStatusLabel(transaction.status)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.value}>{formatAmount(transaction.amount, transaction.currencyCode)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fee</Text>
                <Text style={styles.value}>{formatAmount(transaction.feeAmount, transaction.currencyCode)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Net</Text>
                <Text style={styles.value}>{formatAmount(transaction.netTransactionAmount, transaction.currencyCode)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{formatDate(transaction.transactionDate)}</Text>
              </View>
              {transaction.senderWalletNumber ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Sender</Text>
                  <Text style={styles.value}>#{transaction.senderWalletNumber}</Text>
                </View>
              ) : null}
              {transaction.receiverWalletNumber ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Receiver</Text>
                  <Text style={styles.value}>#{transaction.receiverWalletNumber}</Text>
                </View>
              ) : null}
              {transaction.bankAccountIban ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Bank IBAN</Text>
                  <Text style={styles.value}>{transaction.bankAccountIban}</Text>
                </View>
              ) : null}
              {transaction.description ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Description</Text>
                  <Text style={styles.value}>{transaction.description}</Text>
                </View>
              ) : null}
            </GlassCard>
          ) : null}

          {loading && !transaction ? (
            <GlassCard>
              <Text style={styles.loadingText}>Loading transaction...</Text>
            </GlassCard>
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
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: 10
  },
  card: {
    marginTop: 20
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2
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
  }
});
