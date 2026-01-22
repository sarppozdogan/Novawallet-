import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { LiquidBackground } from "../components/LiquidBackground";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type AuthScreenProps = {
  onAuthenticated?: () => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
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
            <Text style={styles.kicker}>NovaWallet</Text>
            <Text style={styles.title}>Welcome to liquid-grade banking</Text>
            <Text style={styles.subtitle}>
              Your money moves with clarity, precision, and calm.
            </Text>
          </Animated.View>

          <GlassCard style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+90 5xx xxx xxxx"
                placeholderTextColor="rgba(246, 247, 251, 0.45)"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="rgba(246, 247, 251, 0.45)"
                secureTextEntry
                style={styles.input}
              />
            </View>
            <GlassButton title="Continue" onPress={onAuthenticated} style={styles.primaryButton} />
            <GlassButton title="Create account" variant="ghost" />
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Face ID • Private Cloud • 24/7 Support</Text>
          </View>
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
    paddingTop: 24,
    justifyContent: "center"
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 2.4,
    color: colors.textSecondary,
    textTransform: "uppercase"
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.textPrimary,
    marginTop: 12
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 20
  },
  card: {
    marginTop: 32
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    backgroundColor: "rgba(10, 15, 30, 0.4)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    color: colors.textPrimary
  },
  primaryButton: {
    marginTop: 8
  },
  footer: {
    marginTop: 24,
    alignItems: "center"
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary
  }
});
