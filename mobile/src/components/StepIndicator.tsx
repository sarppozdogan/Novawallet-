import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type StepIndicatorProps = {
  labels: string[];
  currentIndex: number;
};

export function StepIndicator({ labels, currentIndex }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {labels.map((label, index) => {
        const active = index === currentIndex;
        return (
          <View key={label} style={[styles.step, active && styles.stepActive]}>
            <Text style={[styles.stepText, active && styles.stepTextActive]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
  },
  step: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  stepActive: {
    borderColor: colors.glowCyan,
    backgroundColor: "rgba(98, 247, 247, 0.2)"
  },
  stepText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary
  },
  stepTextActive: {
    color: colors.textPrimary
  }
});
