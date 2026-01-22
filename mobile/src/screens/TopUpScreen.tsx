import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { getBankAccounts, BankAccountSummary } from "../api/bankAccounts";
import { topUp } from "../api/transactions";
import { getWallets, WalletSummary } from "../api/wallets";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { GlassInput } from "../components/GlassInput";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { formatApiError } from "../utils/errorMapper";
import { formatAmount } from "../utils/formatters";
import { sanitizeAmountInput } from "../utils/validation";

type Props = NativeStackScreenProps<MainStackParamList, "TopUp">;

export function TopUpScreen({ navigation, route }: Props) {
  const initialWalletId = route.params?.walletId;
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountSummary[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(initialWalletId ?? null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [walletData, bankData] = await Promise.all([getWallets(), getBankAccounts(false)]);
        if (!mounted) {
          return;
        }
        setWallets(walletData);
        setBankAccounts(bankData.filter((item) => item.isActive));
        if (!selectedWalletId && walletData.length > 0) {
          setSelectedWalletId(walletData[0].id);
        }
      } catch (err) {
        if (mounted) {
          setError(formatApiError(err, "Unable to load top up data."));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId) || null;
  const amountValue = Number(amount);
  const canSubmit = useMemo(() => {
    return !!selectedWallet && !!selectedBankAccountId && amountValue > 0 && !Number.isNaN(amountValue);
  }, [selectedWallet, selectedBankAccountId, amountValue]);

  const handleSubmit = async () => {
    if (!selectedWallet || !selectedBankAccountId) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await topUp({
        walletId: selectedWallet.id,
        amount: amountValue,
        bankAccountId: selectedBankAccountId,
        currencyCode: selectedWallet.currencyCode,
        description: description.trim() || null
      });

      navigation.navigate("TopUpResult", {
        transactionId: result.transactionId,
        referenceCode: result.referenceCode,
        status: result.status,
        walletId: selectedWallet.id
      });
    } catch (err) {
      setError(formatApiError(err, "Unable to complete top up."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container}>
            <GlassButton title="Back" variant="ghost" onPress={() => navigation.goBack()} style={styles.back} />

            <Text style={styles.kicker}>Top up</Text>
            <Text style={styles.title}>Move money into your wallet</Text>

            {error ? <ErrorBanner message={error} /> : null}

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Select wallet</Text>
              <View style={styles.selectorList}>
                {wallets.map((wallet) => {
                  const active = wallet.id === selectedWalletId;
                  return (
                    <Pressable
                      key={wallet.id}
                      onPress={() => setSelectedWalletId(wallet.id)}
                      style={[styles.selectorItem, active && styles.selectorItemActive]}
                    >
                      <Text style={[styles.selectorTitle, active && styles.selectorTitleActive]}>
                        {formatAmount(wallet.balance, wallet.currencyCode)}
                      </Text>
                      <Text style={styles.selectorMeta}>#{wallet.walletNumber}</Text>
                    </Pressable>
                  );
                })}
                {!loading && wallets.length === 0 ? (
                  <Text style={styles.emptyInline}>No wallets available.</Text>
                ) : null}
              </View>
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <GlassInput
                label={`Amount (${selectedWallet?.currencyCode ?? "TRY"})`}
                value={amount}
                onChangeText={(value) => setAmount(sanitizeAmountInput(value))}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
              <GlassInput
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Top up" 
                maxLength={140}
              />
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Bank account</Text>
              <View style={styles.selectorList}>
                {bankAccounts.map((account) => {
                  const active = account.id === selectedBankAccountId;
                  return (
                    <Pressable
                      key={account.id}
                      onPress={() => setSelectedBankAccountId(account.id)}
                      style={[styles.selectorItem, active && styles.selectorItemActive]}
                    >
                      <Text style={[styles.selectorTitle, active && styles.selectorTitleActive]}>{account.bankName}</Text>
                      <Text style={styles.selectorMeta}>{account.iban}</Text>
                      <Text style={styles.selectorMeta}>{account.accountHolderName}</Text>
                    </Pressable>
                  );
                })}
                {!loading && bankAccounts.length === 0 ? (
                  <Text style={styles.emptyInline}>No bank accounts found.</Text>
                ) : null}
              </View>
            </GlassCard>

            <GlassButton
              title={submitting ? "Processing" : "Confirm top up"}
              onPress={handleSubmit}
              loading={submitting}
              disabled={!canSubmit || submitting}
              style={styles.submit}
            />
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
  sectionCard: {
    marginTop: 16
  },
  sectionTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10
  },
  selectorList: {
    gap: 10
  },
  selectorItem: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(10, 15, 30, 0.35)"
  },
  selectorItemActive: {
    borderColor: colors.glowCyan,
    backgroundColor: "rgba(98, 247, 247, 0.15)"
  },
  selectorTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textPrimary
  },
  selectorTitleActive: {
    color: colors.textPrimary
  },
  selectorMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  emptyInline: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary
  },
  submit: {
    marginTop: 18
  }
});
