import React, { useCallback, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getBankAccounts, BankAccountSummary } from "../api/bankAccounts";
import { getCards, CardSummary } from "../api/cards";
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
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { formatAmount } from "../utils/formatters";
import { sanitizeAmountInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";

type Props = NativeStackScreenProps<MainStackParamList, "TopUp">;

export function TopUpScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const initialWalletId = route.params?.walletId;
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountSummary[]>([]);
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(initialWalletId ?? null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [paymentSource, setPaymentSource] = useState<"bank" | "card">("bank");
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
        const [walletData, bankData, cardData] = await Promise.all([
          getWallets(),
          getBankAccounts(false),
          getCards(false)
        ]);
        if (!isActive()) {
          return;
        }

        const activeBankAccounts = bankData.filter((item) => item.isActive);
        const activeCards = cardData.filter((item) => item.isActive);

        setWallets(walletData);
        setBankAccounts(activeBankAccounts);
        setCards(activeCards);

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
        setSelectedCardId((current) => (current && activeCards.some((card) => card.id === current) ? current : null));
      } catch (err) {
        if (isActive()) {
          setError(formatApiError(err, t("topup.error_load")));
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
    const sourceValid = paymentSource === "bank" ? !!selectedBankAccountId : !!selectedCardId;
    return !!selectedWallet && sourceValid && amountValue > 0 && !Number.isNaN(amountValue);
  }, [selectedWallet, selectedBankAccountId, selectedCardId, amountValue, paymentSource]);

  const handleSubmit = async () => {
    if (!selectedWallet) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await topUp({
        walletId: selectedWallet.id,
        amount: amountValue,
        bankAccountId: paymentSource === "bank" ? selectedBankAccountId : null,
        cardId: paymentSource === "card" ? selectedCardId : null,
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
      setError(formatApiError(err, t("topup.error_submit")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSourceChange = (source: "bank" | "card") => {
    setPaymentSource(source);
    if (source === "bank") {
      setSelectedCardId(null);
    } else {
      setSelectedBankAccountId(null);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container}>
            <BackButton onPress={() => navigation.goBack()} style={styles.back} />

            <Text style={styles.kicker}>{t("topup.kicker")}</Text>
            <Text style={styles.title}>{t("topup.title")}</Text>

            {error ? <ErrorBanner message={error} /> : null}

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t("topup.section_wallet")}</Text>
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
                  <Text style={styles.emptyInline}>{t("topup.no_wallets")}</Text>
                ) : null}
              </View>
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t("topup.section_payment_source")}</Text>
              <View style={styles.segmentRow}>
                <Pressable
                  onPress={() => handleSourceChange("bank")}
                  style={[styles.segmentItem, paymentSource === "bank" && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, paymentSource === "bank" && styles.segmentTextActive]}>
                    {t("topup.payment_bank")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSourceChange("card")}
                  style={[styles.segmentItem, paymentSource === "card" && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, paymentSource === "card" && styles.segmentTextActive]}>
                    {t("topup.payment_card")}
                  </Text>
                </Pressable>
              </View>
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t("topup.section_amount")}</Text>
              <GlassInput
                label={t("common.amount_with_currency", { currency: selectedWallet?.currencyCode ?? "TRY" })}
                value={amount}
                onChangeText={(value) => setAmount(sanitizeAmountInput(value))}
                keyboardType="decimal-pad"
                placeholder={t("topup.amount_placeholder")}
              />
              <GlassInput
                label={t("topup.description_label")}
                value={description}
                onChangeText={setDescription}
                placeholder={t("topup.description_placeholder")}
                maxLength={140}
              />
            </GlassCard>

            {paymentSource === "bank" ? (
              <GlassCard style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{t("topup.section_bank_account")}</Text>
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
                    <Text style={styles.emptyInline}>{t("topup.no_bank_accounts")}</Text>
                  ) : null}
                </View>
                <GlassButton
                  title={t("topup.manage_bank_accounts")}
                  variant="ghost"
                  style={styles.manageButton}
                  onPress={() => navigation.navigate("BankAccounts")}
                />
              </GlassCard>
            ) : (
              <GlassCard style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{t("topup.section_card")}</Text>
                <View style={styles.selectorList}>
                  {cards.map((card) => {
                    const active = card.id === selectedCardId;
                    return (
                      <Pressable
                        key={card.id}
                        onPress={() => setSelectedCardId(card.id)}
                        style={[styles.selectorItem, active && styles.selectorItemActive]}
                      >
                        <Text style={[styles.selectorTitle, active && styles.selectorTitleActive]}>{card.brand}</Text>
                        <Text style={styles.selectorMeta}>{card.maskedPan}</Text>
                        <Text style={styles.selectorMeta}>{card.cardHolderName}</Text>
                      </Pressable>
                    );
                  })}
                  {!loading && cards.length === 0 ? (
                    <Text style={styles.emptyInline}>{t("topup.no_cards")}</Text>
                  ) : null}
                </View>
                <GlassButton
                  title={t("topup.manage_cards")}
                  variant="ghost"
                  style={styles.manageButton}
                  onPress={() => navigation.navigate("Cards")}
                />
              </GlassCard>
            )}

            <GlassButton
              title={submitting ? t("common.processing") : t("topup.confirm")}
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
  segmentRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)"
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12
  },
  segmentItemActive: {
    backgroundColor: "rgba(98, 247, 247, 0.2)"
  },
  segmentText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary
  },
  segmentTextActive: {
    color: colors.textPrimary
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
