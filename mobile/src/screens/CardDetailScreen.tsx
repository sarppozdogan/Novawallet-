import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { deactivateCard, getCardById, CardDetail } from "../api/cards";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { LiquidBackground } from "../components/LiquidBackground";
import { MainStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useI18n } from "../i18n/I18nProvider";
import { formatApiError } from "../utils/errorMapper";
import { formatDate } from "../utils/formatters";
import { createScaledStyles } from "../theme/scale";
import { BackButton } from "../components/BackButton";

type Props = NativeStackScreenProps<MainStackParamList, "CardDetail">;

export function CardDetailScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { cardId } = route.params;
  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadCard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCardById(cardId);
        if (mounted) {
          setCard(data);
        }
      } catch (err) {
        if (mounted) {
          setError(formatApiError(err, t("cards.detail.error_load")));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCard();
    return () => {
      mounted = false;
    };
  }, [cardId]);

  const handleDeactivate = async () => {
    if (!card) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await deactivateCard(card.id);
      setCard({ ...card, isActive: false });
    } catch (err) {
      setError(formatApiError(err, t("cards.detail.error_deactivate")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <BackButton onPress={() => navigation.goBack()} style={styles.back} />

          <Text style={styles.kicker}>{t("cards.detail.kicker")}</Text>
          <Text style={styles.title}>{t("cards.detail.title")}</Text>

          {error ? <ErrorBanner message={error} /> : null}

          {card ? (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.brand")}</Text>
                <Text style={styles.value}>{card.brand}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.card")}</Text>
                <Text style={styles.value}>{card.maskedPan}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.holder")}</Text>
                <Text style={styles.value}>{card.cardHolderName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.expiry")}</Text>
                <Text style={styles.value}>{String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.status")}</Text>
                <Text style={styles.value}>{card.isActive ? t("common.active") : t("common.inactive")}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t("common.added")}</Text>
                <Text style={styles.value}>{formatDate(card.createdAt)}</Text>
              </View>
            </GlassCard>
          ) : null}

          {loading && !card ? (
            <GlassCard>
              <Text style={styles.loadingText}>{t("cards.detail.loading")}</Text>
            </GlassCard>
          ) : null}

          {card && card.isActive ? (
            <GlassButton
              title={submitting ? t("cards.detail.deactivating") : t("cards.detail.deactivate")}
              variant="ghost"
              onPress={handleDeactivate}
              loading={submitting}
              disabled={submitting}
              style={styles.deactivate}
            />
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
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: 10
  },
  card: {
    marginTop: 20
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.1
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
  },
  deactivate: {
    marginTop: 16
  }
});
