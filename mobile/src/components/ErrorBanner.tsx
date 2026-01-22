import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { createScaledStyles } from "../theme/scale";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = createScaledStyles({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 124, 203, 0.4)",
    backgroundColor: "rgba(255, 124, 203, 0.12)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textPrimary
  }
});
