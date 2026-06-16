import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Screen from '../../components/Screen';
import {
  getFirstValidationMessage,
  registerUserApi,
} from '../../lib/auth';
import { RegisterSchema } from '../../lib/schemas';

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export default function RegisterStep2() {
  const params = useLocalSearchParams();
  const name = getParamValue(params.name);
  const surname = getParamValue(params.surname);
  const birthDate = getParamValue(params.birthDate);
  const email = getParamValue(params.email);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isRegisterDisabled = useMemo(
    () =>
      !username.trim() ||
      !password ||
      !confirmPassword ||
      !acceptTerms ||
      isLoading,
    [acceptTerms, confirmPassword, isLoading, password, username]
  );

  async function handleRegister() {
    if (isRegisterDisabled) {
      return;
    }

    const validation = RegisterSchema.safeParse({
      name,
      surname,
      birthDate,
      email,
      username,
      password,
      confirmPassword,
      acceptTerms,
    });

    if (!validation.success) {
      setError(getFirstValidationMessage(validation.error));
      return;
    }

    try {
      setIsLoading(true);

      await registerUserApi({
        name: validation.data.name,
        surname: validation.data.surname,
        birthDate: validation.data.birthDate.toISOString(),
        email: validation.data.email,
        username: validation.data.username,
        password: validation.data.password,
        confirmPassword: validation.data.confirmPassword,
        acceptTerms: validation.data.acceptTerms,
      });

      setError('');

      Alert.alert('Registrazione completata', 'Il tuo account è stato creato.', [
        {
          text: 'Continua',
          onPress: () => router.replace('/feed'),
        },
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Registrazione non riuscita. Riprova.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>OutGrow</Text>
          <Text style={styles.subtitle}>
            Scegli username e password per completare la registrazione.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#7A7F9A"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError('');
            }}
          />

          <View style={styles.passwordField}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#7A7F9A"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
            />

            <Pressable
              hitSlop={10}
              style={({ pressed }) => [
                styles.eyeButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setShowPassword((currentValue) => !currentValue)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#5B5FEF"
              />
            </Pressable>
          </View>

          <View style={styles.passwordField}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ripeti password"
              placeholderTextColor="#7A7F9A"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
            />

            <Pressable
              hitSlop={10}
              style={({ pressed }) => [
                styles.eyeButton,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                setShowConfirmPassword((currentValue) => !currentValue)
              }
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#5B5FEF"
              />
            </Pressable>
          </View>

          <Text style={styles.helperText}>
            La password deve avere da 8 a 16 caratteri, almeno una maiuscola,
            un numero e un carattere speciale.
          </Text>

          <View style={styles.termsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.checkbox,
                acceptTerms && styles.checkboxChecked,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                setAcceptTerms((currentValue) => !currentValue);
                setError('');
              }}
            >
              {acceptTerms ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </Pressable>

            <Text style={styles.termsText}>
  Accetto i{' '}
  <Text
    style={styles.privacyLink}
    onPress={() => router.push('/(auth)/terms-of-service')}
  >
    termini di servizio
  </Text>
  {' '}e la{' '}
  <Text
    style={styles.privacyLink}
    onPress={() => router.push('/(auth)/privacy-policy')}
  >
    privacy policy
  </Text>
</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            disabled={isRegisterDisabled}
            style={({ pressed }) => [
              styles.registerButton,
              isRegisterDisabled && styles.registerButtonDisabled,
              pressed && !isRegisterDisabled && styles.pressed,
            ]}
            onPress={handleRegister}
          >
            <Text
              style={[
                styles.registerButtonText,
                isRegisterDisabled && styles.registerButtonTextDisabled,
              ]}
            >
              {isLoading ? 'Registrazione...' : 'Registrati'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 26,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#5B5FEF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#5E6278',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#17172F',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  passwordField: {
    minHeight: 53,
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF0F6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 8,
    fontSize: 15,
    color: '#17172F',
  },
  eyeButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    color: '#5E6278',
    fontSize: 12,
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 14,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFC3D8',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5B5FEF',
    borderColor: '#5B5FEF',
  },
  checkboxMark: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  termsText: {
    flexShrink: 1,
    color: '#5E6278',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  privacyLink: {
    color: '#5B5FEF',
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  registerButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#5B5FEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#D8DAEA',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  registerButtonTextDisabled: {
    color: '#8C91AA',
  },
  pressed: {
    opacity: 0.75,
  },
});