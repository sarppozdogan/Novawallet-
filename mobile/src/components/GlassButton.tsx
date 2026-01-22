import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type GlassButtonProps = {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "ghost";
};

export function GlassButton({ title, onPress, style, variant = "primary" }: GlassButtonProps) {
  if (variant === "ghost") {
    return (
      <Pressable onPress={onPress} style={[styles.ghost, style]}>
        <Text style={styles.ghostText}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.primary, style]}>
      <LinearGradient
        colors={["rgba(159, 240, 255, 0.9)", "rgba(98, 247, 247, 0.5)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  }
});
