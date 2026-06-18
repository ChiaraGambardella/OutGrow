import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AppButton from '../../components/AppButton';
import Screen from '../../components/Screen';
import { getFirstValidationMessage, loginUserApi } from '../../lib/auth';
import { LoginSchema } from '@outgrow/shared';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (isLoading) {
      return;
    }

    const validation = LoginSchema.safeParse({ username, password });

    if (!validation.success) {
      setError(getFirstValidationMessage(validation.error));
      return;
    }

    try {
      setIsLoading(true);

      await loginUserApi({
        username: validation.data.username,
        password: validation.data.password,
      });

      setError('');
      router.replace('/feed');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Credenziali non valide. Riprova.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/outgrow-logo.png')}
          style={styles.loginLogo}
        />
        <Text style={styles.appTitle}>OutGrow</Text>
        <Text style={styles.subtitle}>
          Esci dalla routine. Affronta nuove sfide. {'\n'}Cresci un passo alla
          volta.
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AppButton
          title={isLoading ? 'Accesso...' : 'Accedi'}
          onPress={handleLogin}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} >
          <Text style={styles.linkText}>Password dimenticata?</Text>
        </TouchableOpacity>

        <View style={styles.registerBottom}>
          <View style={styles.divider} />

          <AppButton
            title="Registrati"
            variant="secondary"
            onPress={() => router.push('/(auth)/register-step1')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 10,
    marginBottom: 24,
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
    flex: 1,
    justifyContent: 'flex-start',
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
  errorText: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  linkText: {
    color: '#5B5FEF',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  registerBottom: {
    marginTop: 60,
    marginBottom: 60,
  },
  divider: {
    height: 1,
    backgroundColor: '#E4E6F0',
    marginBottom: 60,
  },
  pressed: {
    opacity: 0.75,
  },
  loginLogo: {
  width: 170,
  height: 170,
  resizeMode: 'contain',
  alignSelf: 'center',
  marginBottom: 0,
},
});