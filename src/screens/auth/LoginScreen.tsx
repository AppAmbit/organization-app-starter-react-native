import React, { useState } from 'react';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { useAuth } from '../../context/AuthContext';
import { InvalidCredentialsError } from '../../services/AuthDB';
import { validateEmail, validatePassword } from '../../utils/authValidation';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    if (emailValidation || passwordValidation) { return; }

    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      if (e instanceof InvalidCredentialsError) {
        setPasswordError(e.message);
      } else {
        setPasswordError('Something went wrong. Please try again.');
        console.warn('[LoginScreen] login failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard icon="log-in-outline" title="Welcome back" subtitle="Log in to access your profile">
      <AuthInput
        label="Email"
        icon="mail-outline"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(null);
        }}
        error={emailError}
        placeholder="you@example.com"
      />
      <AuthInput
        label="Password"
        icon="lock-closed-outline"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(null);
        }}
        error={passwordError}
        placeholder="••••••••"
      />
      <AuthButton label="Log In" onPress={handleSubmit} loading={loading} />
      <AuthButton label="Don't have an account? Register" variant="ghost" onPress={onSwitchToRegister} />
    </AuthCard>
  );
};
