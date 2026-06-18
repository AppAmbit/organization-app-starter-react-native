import React, { useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { useAuth } from '../../context/AuthContext';
import { EmailAlreadyExistsError } from '../../services/AuthDB';
import { EMAIL_MAX, NAME_MAX, PASSWORD_MAX, validateConfirmPassword, validateEmail, validateName, validatePassword } from '../../utils/authValidation';

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

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

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
        maxLength={NAME_MAX}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        blurOnSubmit={false}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setNameError(null);
        }}
        error={nameError}
        placeholder="Your name"
      />
      <AuthInput
        ref={emailRef}
        label="Email"
        icon="mail-outline"
        keyboardType="email-address"
        maxLength={EMAIL_MAX}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(null);
        }}
        error={emailError}
        placeholder="you@example.com"
      />
      <AuthInput
        ref={passwordRef}
        label="Password"
        icon="lock-closed-outline"
        secureTextEntry
        maxLength={PASSWORD_MAX}
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        blurOnSubmit={false}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(null);
        }}
        error={passwordError}
        placeholder="6–20 characters"
      />
      <AuthInput
        ref={confirmPasswordRef}
        label="Confirm password"
        icon="lock-closed-outline"
        secureTextEntry
        maxLength={PASSWORD_MAX}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
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
