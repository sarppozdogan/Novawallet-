import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { getTransactionStatusLabel } from "../utils/formatters";

type Props = NativeStackScreenProps<MainStackParamList, "WithdrawResult">;

export function WithdrawResultScreen({ navigation, route }: Props) {
  const { status, referenceCode, walletId, transactionId } = route.params;
  const statusLabel = getTransactionStatusLabel(status);
  const statusColor = status === 1 ? colors.success : status === 2 ? colors.warning : colors.textSecondary;

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <GlassCard style={styles.card}>
            <Text style={styles.kicker}>Withdraw result</Text>
            <Text style={styles.title}>
              {status === 1 ? "Withdrawal initiated" : status === 2 ? "Withdraw failed" : "Withdraw pending"}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Reference</Text>
              <Text style={styles.metaValue}>{referenceCode}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Transaction ID</Text>
              <Text style={styles.metaValue}>{transactionId}</Text>
            </View>
          </GlassCard>

          <GlassButton
            title="View wallet"
            onPress={() => navigation.navigate("WalletDetail", { walletId })}
            style={styles.primary}
          />
          <GlassButton
            title="View transaction"
            variant="ghost"
            onPress={() => navigation.navigate("TransactionDetail", { transactionId })}
            style={styles.secondary}
          />
        </View>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40
  },
  card: {
    paddingVertical: 10
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2.2,
    color: colors.textSecondary,
    textTransform: "uppercase"
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: 10
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 16
  },
  metaLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary
  },
  metaValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: "right",
    flexShrink: 1
  },
  primary: {
    marginTop: 20
  },
  secondary: {
    marginTop: 12
  }
});
