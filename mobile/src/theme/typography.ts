import { Platform } from "react-native";

const ios = {
  display: "AvenirNext-DemiBold",
  displayBold: "AvenirNext-Bold",
  body: "AvenirNext-Regular",
  bodyMedium: "AvenirNext-Medium"
};

const android = {
  display: "serif",
  displayBold: "serif",
  body: "sans-serif-light",
  bodyMedium: "sans-serif-medium"
};

export const fonts = Platform.select({
  ios,
  android,
  default: ios
}) as typeof ios;
