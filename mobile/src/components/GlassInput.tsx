import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type GlassInputProps = TextInputProps & {
  label: string;
};

export function GlassInput({ label, style, ...props }: GlassInputProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor="rgba(246, 247, 251, 0.45)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 16
  },
  label: {
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
  }
});
