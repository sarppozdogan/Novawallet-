import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "./types";
import { WalletsScreen } from "../screens/WalletsScreen";
import { WalletDetailScreen } from "../screens/WalletDetailScreen";
import { TransactionsScreen } from "../screens/TransactionsScreen";
import { TransactionDetailScreen } from "../screens/TransactionDetailScreen";
import { TopUpScreen } from "../screens/TopUpScreen";
import { TopUpResultScreen } from "../screens/TopUpResultScreen";

type MainNavigatorProps = {
  onSignOut: () => void;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator({ onSignOut }: MainNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Wallets">
      <Stack.Screen name="Wallets">
        {(props) => <WalletsScreen {...props} onSignOut={onSignOut} />}
      </Stack.Screen>
      <Stack.Screen name="WalletDetail" component={WalletDetailScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="TopUp" component={TopUpScreen} />
      <Stack.Screen name="TopUpResult" component={TopUpResultScreen} />
    </Stack.Navigator>
  );
}
