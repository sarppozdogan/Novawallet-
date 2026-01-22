import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { createCard } from "../api/cards";
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
import { isValidCardNumber, sanitizeCardNumberInput, sanitizeNumericInput } from "../utils/validation";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";

type Props = NativeStackScreenProps<MainStackParamList, "CardCreate">;

export function CardCreateScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      isValidCardNumber(cardNumber) &&
      cardHolderName.trim().length > 1 &&
      Number(expiryMonth) > 0 &&
      Number(expiryMonth) <= 12 &&
      Number(expiryYear) >= new Date().getFullYear()
    );
  }, [cardNumber, cardHolderName, expiryMonth, expiryYear]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createCard({
        cardNumber,
        cardHolderName: cardHolderName.trim(),
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(expiryYear)
      });
      navigation.replace("CardDetail", { cardId: result.id });
    } catch (err) {
      setError(formatApiError(err, t("cards.create.error")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container}>
            <BackButton onPress={() => navigation.goBack()} />

            <Text style={styles.kicker}>{t("cards.create.kicker")}</Text>
            <Text style={styles.title}>{t("cards.create.title")}</Text>

            {error ? <ErrorBanner message={error} /> : null}

            <GlassCard style={styles.card}>
              <GlassInput
                label={t("cards.create.card_number_label")}
                value={cardNumber}
                onChangeText={(value) => setCardNumber(sanitizeCardNumberInput(value))}
                placeholder={t("cards.create.card_number_placeholder")}
                keyboardType="number-pad"
                maxLength={19}
              />
              <GlassInput
                label={t("cards.create.card_holder_label")}
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder={t("cards.create.card_holder_placeholder")}
                maxLength={150}
              />
              <GlassInput
                label={t("cards.create.expiry_month_label")}
                value={expiryMonth}
                onChangeText={(value) => setExpiryMonth(sanitizeNumericInput(value, 2))}
                keyboardType="number-pad"
                placeholder={t("cards.create.expiry_month_placeholder")}
                maxLength={2}
              />
              <GlassInput
                label={t("cards.create.expiry_year_label")}
                value={expiryYear}
                onChangeText={(value) => setExpiryYear(sanitizeNumericInput(value, 4))}
                keyboardType="number-pad"
                placeholder={t("cards.create.expiry_year_placeholder")}
                maxLength={4}
              />
              <GlassButton
                title={t("cards.create.add_button")}
                onPress={handleSubmit}
                loading={loading}
                disabled={!canSubmit || loading}
              />
            </GlassCard>
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
  card: {
    marginTop: 20
  }
});
