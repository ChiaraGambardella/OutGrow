import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AppButton from '../../components/AppButton';
import Screen from '../../components/Screen';
import {
  forgotPasswordApi,
  getFirstValidationMessage,
} from '../../lib/auth';
import { ForgotPasswordSchema } from '@outgrow/shared';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRecoverPassword() {
    if (isLoading) {
      return;
    }

    const validation = ForgotPasswordSchema.safeParse({ email });

    if (!validation.success) {
      setError(getFirstValidationMessage(validation.error));
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await forgotPasswordApi(validation.data.email);

      Alert.alert('Recupero password', response.message, [
        {
          text: 'Torna al login',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Impossibile recuperare la password. Riprova.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Password dimenticata?</Text>

        <Text style={styles.subtitle}>
          Inserisci la tua email. Ti verrà generata una password temporanea.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7A7F9A"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AppButton
          title={isLoading ? 'Invio...' : 'Genera password temporanea'}
          onPress={handleRecoverPassword}
        />

        <AppButton
          title="Torna al login"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#5B5FEF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#5E6278',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
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
  errorText: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});