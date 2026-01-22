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
import { formatApiError } from "../utils/errorMapper";


type Props = NativeStackScreenProps<MainStackParamList, "BankAccounts">;

export function BankAccountsScreen({ navigation }: Props) {
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
      setError(formatApiError(err, "Unable to load bank accounts."));
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
            <GlassButton title="Back" variant="ghost" onPress={() => navigation.goBack()} />
            <GlassButton
              title="Add"
              onPress={() => navigation.navigate("BankAccountCreate")}
              style={styles.addButton}
            />
          </View>

          <Text style={styles.kicker}>Bank accounts</Text>
          <Text style={styles.title}>Linked banks</Text>

          {error ? <ErrorBanner message={error} /> : null}

          <View style={styles.list}>
            {accounts.map((account) => (
              <GlassCard key={account.id} style={styles.card}>
                <Text style={styles.cardTitle}>{account.bankName}</Text>
                <Text style={styles.cardMeta}>{account.iban}</Text>
                <Text style={styles.cardMeta}>{account.accountHolderName}</Text>
                <View style={styles.cardFooter}>
                  <Text style={[styles.status, account.isActive ? styles.statusActive : styles.statusInactive]}>
                    {account.isActive ? "Active" : "Inactive"}
                  </Text>
                  <GlassButton
                    title="Details"
                    variant="ghost"
                    onPress={() => navigation.navigate("BankAccountDetail", { accountId: account.id })}
                    style={styles.detailButton}
                  />
                </View>
              </GlassCard>
            ))}
            {!loading && accounts.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptyTitle}>No bank accounts</Text>
                <Text style={styles.emptySubtitle}>Add your first bank account to top up or withdraw.</Text>
                <GlassButton
                  title="Add bank account"
                  onPress={() => navigation.navigate("BankAccountCreate")}
                  style={styles.addButtonFull}
                />
              </GlassCard>
            ) : null}
            {loading && accounts.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptySubtitle}>Loading bank accounts...</Text>
              </GlassCard>
            ) : null}
          </View>
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
