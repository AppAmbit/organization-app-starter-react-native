import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

type AuthMode = 'login' | 'register';

export const AuthGateScreen: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xxl },
          ]}>
          <View style={styles.cardWrapper}>
            {mode === 'login' ? (
              <LoginScreen onSwitchToRegister={() => setMode('register')} />
            ) : (
              <RegisterScreen onSwitchToLogin={() => setMode('login')} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
