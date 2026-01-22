import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

type GlassCardProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.02)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24
  },
  content: {
    padding: 20
  }
});
