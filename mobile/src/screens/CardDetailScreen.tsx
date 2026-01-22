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
import { formatApiError } from "../utils/errorMapper";
import { formatDate } from "../utils/formatters";

type Props = NativeStackScreenProps<MainStackParamList, "CardDetail">;

export function CardDetailScreen({ navigation, route }: Props) {
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
          setError(formatApiError(err, "Unable to load card."));
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
      setError(formatApiError(err, "Unable to deactivate card."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <GlassButton title="Back" variant="ghost" onPress={() => navigation.goBack()} style={styles.back} />

          <Text style={styles.kicker}>Card</Text>
          <Text style={styles.title}>Card details</Text>

          {error ? <ErrorBanner message={error} /> : null}

          {card ? (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Brand</Text>
                <Text style={styles.value}>{card.brand}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Card</Text>
                <Text style={styles.value}>{card.maskedPan}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Holder</Text>
                <Text style={styles.value}>{card.cardHolderName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Expiry</Text>
                <Text style={styles.value}>{String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{card.isActive ? "Active" : "Inactive"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Added</Text>
                <Text style={styles.value}>{formatDate(card.createdAt)}</Text>
              </View>
            </GlassCard>
          ) : null}

          {loading && !card ? (
            <GlassCard>
              <Text style={styles.loadingText}>Loading card...</Text>
            </GlassCard>
          ) : null}

          {card && card.isActive ? (
            <GlassButton
              title={submitting ? "Deactivating" : "Deactivate card"}
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
