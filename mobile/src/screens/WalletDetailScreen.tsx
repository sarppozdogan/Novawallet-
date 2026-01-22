import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWalletById, WalletSummary } from "../api/wallets";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { formatApiError } from "../utils/errorMapper";
import { formatAmount } from "../utils/formatters";

type Props = NativeStackScreenProps<MainStackParamList, "WalletDetail">;

export function WalletDetailScreen({ navigation, route }: Props) {
  const { walletId } = route.params;
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadWallet = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWalletById(walletId);
        if (mounted) {
          setWallet(data);
        }
      } catch (err) {
        if (mounted) {
          setError(formatApiError(err, "Unable to load wallet."));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadWallet();
    return () => {
      mounted = false;
    };
  }, [walletId]);

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <GlassButton title="Back" variant="ghost" onPress={() => navigation.goBack()} style={styles.back} />

          <Text style={styles.kicker}>Wallet detail</Text>
          <Text style={styles.title}>Your liquid vault</Text>

          {error ? <ErrorBanner message={error} /> : null}

          {wallet ? (
            <>
              <GlassCard style={styles.card}>
                <Text style={styles.walletLabel}>Balance</Text>
                <Text style={styles.walletBalance}>{formatAmount(wallet.balance, wallet.currencyCode)}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>#{wallet.walletNumber}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>{wallet.currencyCode}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>{wallet.isActive ? "Active" : "Inactive"}</Text>
                </View>
                {wallet.virtualIban ? (
                  <View style={styles.ibanRow}>
                    <Text style={styles.ibanLabel}>Virtual IBAN</Text>
                    <Text style={styles.ibanValue}>{wallet.virtualIban}</Text>
                  </View>
                ) : null}
              </GlassCard>

              <View style={styles.actions}>
                <GlassButton
                  title="Top up"
                  onPress={() => navigation.navigate("TopUp", { walletId: wallet.id })}
                  style={styles.actionButton}
                />
                <GlassButton
                  title="Withdraw"
                  variant="ghost"
                  onPress={() => navigation.navigate("Withdraw", { walletId: wallet.id })}
                  style={styles.actionButton}
                />
              </View>
              <View style={styles.actions}>
                <GlassButton
                  title="Send"
                  onPress={() => navigation.navigate("P2P", { walletId: wallet.id })}
                  style={styles.actionButton}
                />
                <GlassButton
                  title="Transactions"
                  variant="ghost"
                  onPress={() =>
                    navigation.navigate("Transactions", {
                      walletId: wallet.id,
                      walletNumber: wallet.walletNumber,
                      currencyCode: wallet.currencyCode
                    })
                  }
                  style={styles.actionButton}
                />
              </View>
            </>
          ) : null}

          {loading && !wallet ? (
            <GlassCard>
              <Text style={styles.loadingText}>Loading wallet...</Text>
            </GlassCard>
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
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: 10
  },
  card: {
    marginTop: 20
  },
  walletLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.4
  },
  walletBalance: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: colors.textPrimary,
    marginTop: 8
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary
  },
  ibanRow: {
    marginTop: 12
  },
  ibanLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  ibanValue: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 4
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glowMint
  },
  actions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12
  },
  actionButton: {
    flex: 1
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary
  }
});
