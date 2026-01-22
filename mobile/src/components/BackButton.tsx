import React from "react";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { createScaledStyles } from "../theme/scale";
import { useI18n } from "../i18n/I18nProvider";

type BackButtonProps = {
  onPress: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
};

export function BackButton({ onPress, title, style }: BackButtonProps) {
  const { t } = useI18n();
  const label = title || t("common.back");

  return (
    <Pressable onPress={onPress} style={[styles.button, style]} hitSlop={8}>
      <Ionicons name="chevron-back" size={16} color={colors.textPrimary} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = createScaledStyles({
  button: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(10, 15, 30, 0.35)"
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: 0.3
  }
});
