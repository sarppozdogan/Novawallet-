import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "./types";
import { WalletsScreen } from "../screens/WalletsScreen";
import { WalletDetailScreen } from "../screens/WalletDetailScreen";
import { TransactionsScreen } from "../screens/TransactionsScreen";
import { TransactionDetailScreen } from "../screens/TransactionDetailScreen";
import { TopUpScreen } from "../screens/TopUpScreen";
import { TopUpResultScreen } from "../screens/TopUpResultScreen";
import { WithdrawScreen } from "../screens/WithdrawScreen";
import { WithdrawResultScreen } from "../screens/WithdrawResultScreen";
import { P2PScreen } from "../screens/P2PScreen";
import { P2PResultScreen } from "../screens/P2PResultScreen";
import { BankAccountsScreen } from "../screens/BankAccountsScreen";
import { BankAccountDetailScreen } from "../screens/BankAccountDetailScreen";
import { BankAccountCreateScreen } from "../screens/BankAccountCreateScreen";
import { CardsScreen } from "../screens/CardsScreen";
import { CardDetailScreen } from "../screens/CardDetailScreen";
import { CardCreateScreen } from "../screens/CardCreateScreen";

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
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="WithdrawResult" component={WithdrawResultScreen} />
      <Stack.Screen name="P2P" component={P2PScreen} />
      <Stack.Screen name="P2PResult" component={P2PResultScreen} />
      <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
      <Stack.Screen name="BankAccountDetail" component={BankAccountDetailScreen} />
      <Stack.Screen name="BankAccountCreate" component={BankAccountCreateScreen} />
      <Stack.Screen name="Cards" component={CardsScreen} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      <Stack.Screen name="CardCreate" component={CardCreateScreen} />
    </Stack.Navigator>
  );
}
