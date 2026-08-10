import React from 'react';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getColors } from '../theme/colors';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { CollectionItemModel } from '../models/FeedModel';
import { useAuth } from '../context/AuthContext';
import { AuthGateScreen } from '../screens/auth/AuthGateScreen';

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  ItemDetail: { item: CollectionItemModel };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Tabs" component={BottomTabNavigator} />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              options={{
                animation: 'slide_from_bottom',
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthGateScreen}
            options={{ animationTypeForReplace: 'pop' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
