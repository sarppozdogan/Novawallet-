import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "../i18n/I18nProvider";
import { COUNTRY_OPTIONS, CountryOption } from "../utils/countryCodes";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { createScaledStyles } from "../theme/scale";

type CountryCodeSelectorProps = {
  value: CountryOption;
  onSelect: (country: CountryOption) => void;
  style?: StyleProp<ViewStyle>;
};

export function CountryCodeSelector({ value, onSelect, style }: CountryCodeSelectorProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={[styles.trigger, style]} hitSlop={8}>
        <Text style={styles.triggerDial}>{value.dial}</Text>
        <Text style={styles.triggerCode}>{value.code}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </Pressable>
      <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
          <View style={styles.sheet}>
            <Text style={styles.title}>{t("auth.country_code_title")}</Text>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {COUNTRY_OPTIONS.map((item) => {
                const active = item.code === value.code;
                return (
                  <Pressable
                    key={item.code}
                    onPress={() => {
                      onSelect(item);
                      setVisible(false);
                    }}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionTitle}>{t(item.nameKey)}</Text>
                      <Text style={styles.optionMeta}>{`${item.dial} • ${item.code}`}</Text>
                    </View>
                    {active ? <Ionicons name="checkmark" size={16} color={colors.glowCyan} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    backgroundColor: "rgba(10, 15, 30, 0.4)"
  },
  triggerDial: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary
  },
  triggerCode: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary
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
    width: "86%",
    maxHeight: "70%",
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
  list: {
    maxHeight: "100%"
  },
  listContent: {
    paddingBottom: 4
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
  optionTextWrap: {
    flex: 1
  },
  optionTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary
  },
  optionMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  }
});
