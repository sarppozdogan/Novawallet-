import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { createScaledStyles } from "../theme/scale";
import { useI18n } from "../i18n/I18nProvider";

type LanguageSelectorProps = {
  style?: StyleProp<ViewStyle>;
};

export function LanguageSelector({ style }: LanguageSelectorProps) {
  const { locale, setLocale, supportedLocales, t } = useI18n();
  const [visible, setVisible] = useState(false);

  const currentLabel = useMemo(() => {
    return supportedLocales.find((item) => item.code === locale)?.label || locale;
  }, [supportedLocales, locale]);

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={[styles.trigger, style]} hitSlop={8}>
        <Ionicons name="globe-outline" size={16} color={colors.textPrimary} />
        <Text style={styles.triggerText}>{currentLabel}</Text>
      </Pressable>
      <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
          <View style={styles.sheet}>
            <Text style={styles.title}>{t("language.title")}</Text>
            {supportedLocales.map((item) => {
              const active = item.code === locale;
              return (
                <Pressable
                  key={item.code}
                  onPress={() => {
                    setLocale(item.code);
                    setVisible(false);
                  }}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{item.label}</Text>
                  {active ? <Ionicons name="checkmark" size={16} color={colors.glowCyan} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = createScaledStyles({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: "rgba(10, 15, 30, 0.35)"
  },
  triggerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textPrimary
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(4, 8, 16, 0.6)"
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  sheet: {
    width: "84%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: "rgba(10, 15, 30, 0.92)",
    padding: 16
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  optionActive: {
    borderColor: colors.glowCyan,
    backgroundColor: "rgba(98, 247, 247, 0.15)"
  },
  optionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary
  },
  optionTextActive: {
    color: colors.textPrimary
  }
});
