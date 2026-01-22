import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RegisterStartScreen } from "../screens/RegisterStartScreen";
import { OtpVerifyScreen } from "../screens/OtpVerifyScreen";
import { ProfileCompleteScreen } from "../screens/ProfileCompleteScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { AuthStackParamList } from "./types";

type AuthNavigatorProps = {
  onAuthenticated: (token: string) => void;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator({ onAuthenticated }: AuthNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="RegisterStart" component={RegisterStartScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="ProfileComplete" component={ProfileCompleteScreen} />
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onAuthenticated={onAuthenticated} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
