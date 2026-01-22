import React, { ReactNode, useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { createScaledStyles } from "../theme/scale";

const AnimatedView = Animated.createAnimatedComponent(View);

type LiquidBackgroundProps = {
  children?: ReactNode;
};

export function LiquidBackground({ children }: LiquidBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            useNativeDriver: true
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: duration + 1200,
            useNativeDriver: true
          })
        ])
      );

    const loop1 = createLoop(float1, 12000);
    const loop2 = createLoop(float2, 15000);
    const loop3 = createLoop(float3, 18000);

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, [float1, float2, float3]);

  const orbSize = useMemo(() => Math.max(width, height) * 0.7, [width, height]);
  const orbSmall = useMemo(() => Math.max(width, height) * 0.45, [width, height]);

  const orb1Style = {
    transform: [
      {
        translateX: float1.interpolate({
          inputRange: [0, 1],
          outputRange: [-width * 0.2, width * 0.15]
        })
      },
      {
        translateY: float1.interpolate({
          inputRange: [0, 1],
          outputRange: [-height * 0.25, height * 0.1]
        })
      }
    ]
  };

  const orb2Style = {
    transform: [
      {
        translateX: float2.interpolate({
          inputRange: [0, 1],
          outputRange: [width * 0.25, -width * 0.1]
        })
      },
      {
        translateY: float2.interpolate({
          inputRange: [0, 1],
          outputRange: [height * 0.2, -height * 0.15]
        })
      }
    ]
  };

  const orb3Style = {
    transform: [
      {
        translateX: float3.interpolate({
          inputRange: [0, 1],
          outputRange: [width * 0.05, -width * 0.25]
        })
      },
      {
        translateY: float3.interpolate({
          inputRange: [0, 1],
          outputRange: [-height * 0.05, height * 0.2]
        })
      }
    ]
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.midnight, colors.deep, colors.ink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <AnimatedView style={[styles.orb, { width: orbSize, height: orbSize }, orb1Style]} pointerEvents="none">
        <LinearGradient
          colors={["rgba(98, 247, 247, 0.6)", "rgba(98, 247, 247, 0.05)"]}
          style={styles.orbFill}
        />
      </AnimatedView>
      <AnimatedView style={[styles.orb, { width: orbSmall, height: orbSmall }, orb2Style]} pointerEvents="none">
        <LinearGradient
          colors={["rgba(255, 124, 203, 0.5)", "rgba(255, 124, 203, 0.04)"]}
          style={styles.orbFill}
        />
      </AnimatedView>
      <AnimatedView style={[styles.orb, { width: orbSmall * 0.85, height: orbSmall * 0.85 }, orb3Style]} pointerEvents="none">
        <LinearGradient
          colors={["rgba(123, 140, 255, 0.45)", "rgba(123, 140, 255, 0.05)"]}
          style={styles.orbFill}
        />
      </AnimatedView>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = createScaledStyles({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.9
  },
  orbFill: {
    flex: 1,
    borderRadius: 999
  }
});
