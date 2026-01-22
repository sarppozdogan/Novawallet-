import { Dimensions, Platform, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
const isLargeIphone = Platform.OS === "ios" && width >= 428 && height >= 926;
const BASE_WIDTH = 390;
const SCALE = isLargeIphone ? width / BASE_WIDTH : 1;

const SKIP_KEYS = new Set([
  "flex",
  "flexGrow",
  "flexShrink",
  "opacity",
  "zIndex",
  "elevation",
  "shadowOpacity",
  "aspectRatio"
]);

const SKIP_NESTED_KEYS = new Set(["transform"]);

const round = (value: number) => Math.round(value * 100) / 100;

const scaleNumber = (value: number) => {
  if (SCALE === 1) {
    return value;
  }
  return round(value * SCALE);
};

const scaleStyleValue = (key: string, value: unknown): unknown => {
  if (SKIP_NESTED_KEYS.has(key)) {
    return value;
  }
  if (typeof value === "number") {
    if (SKIP_KEYS.has(key)) {
      return value;
    }
    return scaleNumber(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return scaleStyleObject(item as Record<string, unknown>);
      }
      return item;
    });
  }
  if (value && typeof value === "object") {
    return scaleStyleObject(value as Record<string, unknown>);
  }
  return value;
};

const scaleStyleObject = (style: Record<string, unknown>) => {
  const next: Record<string, unknown> = {};
  Object.keys(style).forEach((key) => {
    next[key] = scaleStyleValue(key, style[key]);
  });
  return next;
};

const scaleNamedStyles = <T extends StyleSheet.NamedStyles<T>>(styles: T): T => {
  const next: Record<string, unknown> = {};
  Object.keys(styles).forEach((styleName) => {
    next[styleName] = scaleStyleObject(styles[styleName] as Record<string, unknown>);
  });
  return next as T;
};

export const createScaledStyles = <T extends StyleSheet.NamedStyles<T>>(styles: T): T =>
  StyleSheet.create(scaleNamedStyles(styles));
