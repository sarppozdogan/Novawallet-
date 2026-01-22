import React from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { createScaledStyles } from "../theme/scale";

type GlassButtonProps = {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
};

export function GlassButton({
  title,
  onPress,
  style,
  variant = "primary",
  loading = false,
  disabled = false
}: GlassButtonProps) {
  const isDisabled = disabled || loading;
  if (variant === "ghost") {
    return (
      <Pressable onPress={onPress} style={[styles.ghost, isDisabled && styles.disabled, style]} disabled={isDisabled}>
        {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.ghostText}>{title}</Text>}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.primary, isDisabled && styles.disabled, style]} disabled={isDisabled}>
      <LinearGradient
        colors={["rgba(159, 240, 255, 0.9)", "rgba(98, 247, 247, 0.5)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {loading ? <ActivityIndicator color="#0B0F1F" /> : <Text style={styles.primaryText}>{title}</Text>}
    </Pressable>
  );
}

const styles = createScaledStyles({
  primary: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: colors.glowCyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16
  },
  primaryText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: "#0B0F1F",
    letterSpacing: 0.4
  },
  ghost: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  ghostText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: 0.3
  },
  disabled: {
    opacity: 0.6
  }
});
