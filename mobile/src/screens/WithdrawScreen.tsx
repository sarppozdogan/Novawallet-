import React, { useCallback, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getBankAccounts, BankAccountSummary } from "../api/bankAccounts";
import { withdraw } from "../api/transactions";
import { getWallets, WalletSummary } from "../api/wallets";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { GlassInput } from "../components/GlassInput";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { formatAmount } from "../utils/formatters";
import { sanitizeAmountInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";

type Props = NativeStackScreenProps<MainStackParamList, "Withdraw">;

export function WithdrawScreen({ navigation, route }: Props) {
  const { t } = useI18n();
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

  const loadData = useCallback(
    async (isActive: () => boolean) => {
      setLoading(true);
      setError(null);
      try {
        const [walletData, bankData] = await Promise.all([getWallets(), getBankAccounts(false)]);
        if (!isActive()) {
          return;
        }

        const activeBankAccounts = bankData.filter((item) => item.isActive);
        setWallets(walletData);
        setBankAccounts(activeBankAccounts);

        setSelectedWalletId((current) => {
          if (initialWalletId && walletData.some((wallet) => wallet.id === initialWalletId)) {
            return initialWalletId;
          }
          if (current && walletData.some((wallet) => wallet.id === current)) {
            return current;
          }
          return walletData.length > 0 ? walletData[0].id : null;
        });
        setSelectedBankAccountId((current) =>
          current && activeBankAccounts.some((account) => account.id === current) ? current : null
        );
      } catch (err) {
        if (isActive()) {
          setError(formatApiError(err, t("withdraw.error_load")));
        }
      } finally {
        if (isActive()) {
          setLoading(false);
        }
      }
    },
    [initialWalletId, t]
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const isActive = () => active;
      void loadData(isActive);
      return () => {
        active = false;
      };
    }, [loadData])
  );

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
      const result = await withdraw({
        walletId: selectedWallet.id,
        amount: amountValue,
        bankAccountId: selectedBankAccountId,
        currencyCode: selectedWallet.currencyCode,
        description: description.trim() || null
      });

      navigation.navigate("WithdrawResult", {
        transactionId: result.transactionId,
        referenceCode: result.referenceCode,
        status: result.status,
        walletId: selectedWallet.id
      });
    } catch (err) {
      setError(formatApiError(err, t("withdraw.error_submit")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container}>
            <BackButton onPress={() => navigation.goBack()} style={styles.back} />

            <Text style={styles.kicker}>{t("withdraw.kicker")}</Text>
            <Text style={styles.title}>{t("withdraw.title")}</Text>

            {error ? <ErrorBanner message={error} /> : null}

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t("withdraw.section_wallet")}</Text>
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
                  <Text style={styles.emptyInline}>{t("withdraw.no_wallets")}</Text>
                ) : null}
              </View>
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t("withdraw.section_amount")}</Text>
              <GlassInput
                label={t("common.amount_with_currency", { currency: selectedWallet?.currencyCode ?? "TRY" })}
                value={amount}
                onChangeText={(value) => setAmount(sanitizeAmountInput(value))}
                keyboardType="decimal-pad"
                placeholder={t("topup.amount_placeholder")}
              />
              <GlassInput
                label={t("withdraw.description_label")}
                value={description}
                onChangeText={setDescription}
                placeholder={t("withdraw.description_placeholder")}
                maxLength={140}
              />
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t("withdraw.section_bank_account")}</Text>
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
                  <Text style={styles.emptyInline}>{t("withdraw.no_bank_accounts")}</Text>
                ) : null}
              </View>
              <GlassButton
                title={t("withdraw.manage_bank_accounts")}
                variant="ghost"
                style={styles.manageButton}
                onPress={() => navigation.navigate("BankAccounts")}
              />
            </GlassCard>

            <GlassButton
              title={submitting ? t("common.processing") : t("withdraw.confirm")}
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

const styles = createScaledStyles({
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
  manageButton: {
    marginTop: 12
  },
  submit: {
    marginTop: 18
  }
});
