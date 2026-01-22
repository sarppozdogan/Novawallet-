import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { LiquidBackground } from "../components/LiquidBackground";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

const quickActions = [
  { title: "Top up", subtitle: "Instant" },
  { title: "Send", subtitle: "P2P" },
  { title: "Withdraw", subtitle: "Bank" }
];

const recentActivity = [
  { title: "Top up", amount: "+4,500 TRY", meta: "Just now" },
  { title: "Sent to 4321", amount: "-320 TRY", meta: "Today" },
  { title: "Withdraw", amount: "-1,200 TRY", meta: "Yesterday" }
];

type HomeScreenProps = {
  onSignOut?: () => void;
};

export function HomeScreen({ onSignOut }: HomeScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(riseAnim, { toValue: 0, duration: 700, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, riseAnim]);

  const heroStyle = useMemo(
    () => ({
      opacity: fadeAnim,
      transform: [{ translateY: riseAnim }]
    }),
    [fadeAnim, riseAnim]
  );

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Animated.View style={heroStyle}>
            <Text style={styles.kicker}>Good evening</Text>
            <Text style={styles.title}>Your liquid balance</Text>
          </Animated.View>

          <GlassCard style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total balance</Text>
            <Text style={styles.balanceAmount}>12,480.50 TRY</Text>
            <View style={styles.balanceMeta}>
              <Text style={styles.balanceMetaText}>Primary wallet • TRY</Text>
              <View style={styles.balanceDot} />
              <Text style={styles.balanceMetaText}>Active</Text>
            </View>
          </GlassCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <View style={styles.actionsRow}>
              {quickActions.map((item) => (
                <Pressable key={item.title} style={styles.actionCard}>
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            <GlassCard>
              {recentActivity.map((item, index) => (
                <View key={item.title} style={[styles.activityRow, index === 0 ? styles.activityRowFirst : null]}>
                  <View>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityMeta}>{item.meta}</Text>
                  </View>
                  <Text style={styles.activityAmount}>{item.amount}</Text>
                </View>
              ))}
            </GlassCard>
          </View>

          <GlassButton title="Sign out" variant="ghost" onPress={onSignOut} style={styles.signOut} />
        </View>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 2.2,
    color: colors.textSecondary,
    textTransform: "uppercase"
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: 10
  },
  balanceCard: {
    marginTop: 20
  },
  balanceLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.6
  },
  balanceAmount: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: colors.textPrimary,
    marginTop: 6
  },
  balanceMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8
  },
  balanceMetaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary
  },
  balanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glowMint
  },
  section: {
    marginTop: 22
  },
  sectionTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12
  },
  actionCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(15, 26, 46, 0.65)"
  },
  actionTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textPrimary
  },
  actionSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)"
  },
  activityRowFirst: {
    borderTopWidth: 0
  },
  activityTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textPrimary
  },
  activityMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  activityAmount: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textPrimary
  },
  signOut: {
    marginTop: 20
  }
});
