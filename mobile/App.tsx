import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreen } from "./src/screens/SplashScreen";
import { AuthNavigator } from "./src/navigation/AuthNavigator";
import { MainNavigator } from "./src/navigation/MainNavigator";
import { clearToken, getToken, setToken } from "./src/storage/authStorage";
import { delay } from "./src/utils/time";
import { I18nProvider } from "./src/i18n/I18nProvider";

type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type BootState = {
  checking: boolean;
  authed: boolean;
};

export default function App() {
  const [bootState, setBootState] = useState<BootState>({ checking: true, authed: false });

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await delay(900);
      const token = await getToken();
      if (mounted) {
        setBootState({ checking: false, authed: Boolean(token) });
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAuth = useCallback(async (token: string) => {
    await setToken(token);
    setBootState({ checking: false, authed: true });
  }, []);

  const handleSignOut = useCallback(async () => {
    await clearToken();
    setBootState({ checking: false, authed: false });
  }, []);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#0B0F1F",
      card: "#0B0F1F",
      text: "#F6F7FB",
      border: "transparent"
    }
  };

  return (
    <I18nProvider>
      {bootState.checking ? (
        <SplashScreen />
      ) : (
        <SafeAreaProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {bootState.authed ? (
                <Stack.Screen name="Home">
                  {() => <MainNavigator onSignOut={handleSignOut} />}
                </Stack.Screen>
              ) : (
                <Stack.Screen name="Auth">
                  {() => <AuthNavigator onAuthenticated={handleAuth} />}
                </Stack.Screen>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      )}
    </I18nProvider>
  );
}
