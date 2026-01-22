import React from "react";
import { StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import { CountryOption } from "../utils/countryCodes";
import { CountryCodeSelector } from "./CountryCodeSelector";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { createScaledStyles } from "../theme/scale";

type PhoneFieldProps = {
  label: string;
  country: CountryOption;
  onSelectCountry: (country: CountryOption) => void;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
};

export function PhoneField({
  label,
  country,
  onSelectCountry,
  value,
  onChangeText,
  placeholder,
  maxLength,
  style
}: PhoneFieldProps) {
  return (
    <View style={[styles.group, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <CountryCodeSelector value={country} onSelect={onSelectCountry} style={styles.country} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor="rgba(246, 247, 251, 0.45)"
          style={styles.input}
          maxLength={maxLength}
        />
      </View>
    </View>
  );
}

const styles = createScaledStyles({
  group: {
    marginBottom: 16
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  country: {
    minWidth: 96,
    justifyContent: "center"
  },
  input: {
    flex: 1,
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
