import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "./src/screens/SplashScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { clearToken, getToken, setToken } from "./src/storage/authStorage";
import { delay } from "./src/utils/time";

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

  const handleAuth = useCallback(async () => {
    await setToken("demo-token");
    setBootState({ checking: false, authed: true });
  }, []);

  const handleSignOut = useCallback(async () => {
    await clearToken();
    setBootState({ checking: false, authed: false });
  }, []);

  if (bootState.checking) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {bootState.authed ? (
          <Stack.Screen name="Home">
            {() => <HomeScreen onSignOut={handleSignOut} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onAuthenticated={handleAuth} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
