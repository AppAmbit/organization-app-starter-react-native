import React, { useState } from 'react';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { useAuth } from '../../context/AuthContext';
import { EmailAlreadyExistsError } from '../../services/AuthDB';
import { validateConfirmPassword, validateEmail, validateName, validatePassword } from '../../utils/authValidation';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validatePassword(password) ? null : validateConfirmPassword(password, confirmPassword);
    setNameError(nameValidation);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    setConfirmPasswordError(confirmPasswordValidation);
    if (nameValidation || emailValidation || passwordValidation || confirmPasswordValidation) { return; }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (e) {
      if (e instanceof EmailAlreadyExistsError) {
        setEmailError(e.message);
      } else {
        setPasswordError('Something went wrong. Please try again.');
        console.warn('[RegisterScreen] register failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard icon="person-add-outline" title="Create account" subtitle="Sign up to set up your profile">
      <AuthInput
        label="Name"
        icon="person-outline"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setNameError(null);
        }}
        error={nameError}
        placeholder="Your name"
      />
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
        placeholder="At least 6 characters"
      />
      <AuthInput
        label="Confirm password"
        icon="lock-closed-outline"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setConfirmPasswordError(null);
        }}
        error={confirmPasswordError}
        placeholder="Re-enter your password"
      />
      <AuthButton label="Register" onPress={handleSubmit} loading={loading} />
      <AuthButton label="Already have an account? Log in" variant="ghost" onPress={onSwitchToLogin} />
    </AuthCard>
  );
};
