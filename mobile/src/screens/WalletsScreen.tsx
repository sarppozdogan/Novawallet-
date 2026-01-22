import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWallets, WalletSummary } from "../api/wallets";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { formatApiError } from "../utils/errorMapper";
import { formatAmount } from "../utils/formatters";

type Props = NativeStackScreenProps<MainStackParamList, "Wallets"> & {
  onSignOut: () => void;
};

export function WalletsScreen({ navigation, onSignOut }: Props) {
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWallets();
      setWallets(data);
    } catch (err) {
      setError(formatApiError(err, "Unable to load wallets."));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWallets();
    }, [loadWallets])
  );

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>NovaWallet</Text>
              <Text style={styles.title}>Your wallets</Text>
            </View>
            <GlassButton title="Sign out" variant="ghost" onPress={onSignOut} style={styles.signOut} />
          </View>

          <View style={styles.actionsRow}>
            <GlassButton
              title="Top up"
              onPress={() => navigation.navigate("TopUp", {})}
              style={styles.actionButton}
            />
            <GlassButton
              title="Withdraw"
              variant="ghost"
              onPress={() => navigation.navigate("Withdraw", {})}
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionsRow}>
            <GlassButton
              title="Send"
              onPress={() => navigation.navigate("P2P", {})}
              style={styles.actionButton}
            />
            <GlassButton
              title="Cards"
              variant="ghost"
              onPress={() => navigation.navigate("Cards")}
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionsRow}>
            <GlassButton
              title="Bank accounts"
              variant="ghost"
              onPress={() => navigation.navigate("BankAccounts")}
              style={styles.actionButton}
            />
            <GlassButton
              title="Refresh"
              variant="ghost"
              onPress={loadWallets}
              style={styles.actionButton}
              loading={loading}
            />
          </View>

          {error ? <ErrorBanner message={error} /> : null}

          <View style={styles.list}>
            {wallets.map((wallet) => (
              <GlassCard key={wallet.id} style={styles.card}>
                <Text style={styles.walletLabel}>{wallet.isActive ? "Active wallet" : "Inactive wallet"}</Text>
                <Text style={styles.walletBalance}>{formatAmount(wallet.balance, wallet.currencyCode)}</Text>
                <View style={styles.walletMeta}>
                  <Text style={styles.walletMetaText}>#{wallet.walletNumber}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.walletMetaText}>{wallet.currencyCode}</Text>
                </View>
                <View style={styles.cardActions}>
                  <GlassButton
                    title="Details"
                    variant="ghost"
                    onPress={() => navigation.navigate("WalletDetail", { walletId: wallet.id })}
                    style={styles.cardButton}
                  />
                  <GlassButton
                    title="Transactions"
                    onPress={() =>
                      navigation.navigate("Transactions", {
                        walletId: wallet.id,
                        walletNumber: wallet.walletNumber,
                        currencyCode: wallet.currencyCode
                      })
                    }
                    style={styles.cardButton}
                  />
                </View>
              </GlassCard>
            ))}
            {!loading && wallets.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No wallets yet</Text>
                <Text style={styles.emptySubtitle}>Complete your profile to activate your first wallet.</Text>
              </GlassCard>
            ) : null}
            {loading && wallets.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptySubtitle}>Loading wallets...</Text>
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
    justifyContent: "space-between",
    gap: 12
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
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: 10
  },
  signOut: {
    minWidth: 90
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12
  },
  actionButton: {
    flex: 1
  },
  list: {
    marginTop: 16,
    gap: 16
  },
  card: {
    paddingVertical: 6
  },
  walletLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  walletBalance: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.textPrimary,
    marginTop: 8
  },
  walletMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8
  },
  walletMetaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glowMint
  },
  cardActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  },
  cardButton: {
    flex: 1
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
  }
});
