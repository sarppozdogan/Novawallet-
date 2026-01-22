import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LiquidBackground } from "../components/LiquidBackground";
import { GlassCard } from "../components/GlassCard";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { createScaledStyles } from "../theme/scale";

export function SplashScreen() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1600, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 140]
  });

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <GlassCard style={styles.card}>
            <View style={styles.logoRow}>
              <View style={styles.logoCore}>
                <View style={styles.logoInner} />
              </View>
              <View>
                <Text style={styles.brand}>NovaWallet</Text>
                <Text style={styles.tagline}>Liquid clarity for modern money</Text>
              </View>
            </View>
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>Secured • Instant • Transparent</Text>
            </View>
          </GlassCard>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressGlow, { transform: [{ translateX: shimmerTranslate }] }]} />
          </View>
        </View>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = createScaledStyles({
  safe: {
    flex: 1
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  card: {
    width: "100%",
    paddingVertical: 8
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  logoCore: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.glassHighlight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  logoInner: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.glowCyan,
    shadowColor: colors.glowCyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.textPrimary
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  ribbon: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  ribbonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary
  },
  progressTrack: {
    marginTop: 26,
    width: 180,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden"
  },
  progressGlow: {
    width: 80,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.glowCyan
  }
});
