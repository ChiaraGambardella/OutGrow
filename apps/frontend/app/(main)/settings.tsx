import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import {
  getFirstValidationMessage,
  logoutUser,
  updateEmailApi,
  updatePasswordApi,
} from '../../lib/auth';
import { UpdateEmailSchema, UpdatePasswordSchema } from '../../lib/schemas';

export default function Settings() {
  const [newChallenges, setNewChallenges] = useState(false);
  const [progressNotifications, setProgressNotifications] = useState(false);
  const [socialNotifications, setSocialNotifications] = useState(false);

  const [emailFormVisible, setEmailFormVisible] = useState(false);
  const [passwordFormVisible, setPasswordFormVisible] = useState(false);

  const [newEmail, setNewEmail] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    await logoutUser();
    router.replace('/login');
  }

  async function handleUpdateEmail() {
    if (isLoading) {
      return;
    }

    const validation = UpdateEmailSchema.safeParse({
      email: newEmail,
    });

    if (!validation.success) {
      setError(getFirstValidationMessage(validation.error));
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await updateEmailApi(validation.data.email);

      setNewEmail('');
      setEmailFormVisible(false);

      Alert.alert('Email aggiornata', 'La tua email è stata modificata.');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare l'email."
      );
    } finally {
      setIsLoading(false);
    }
  }

async function handleUpdatePassword() {
  if (isLoading) {
    return;
  }

  const validation = UpdatePasswordSchema.safeParse({
    oldPassword,
    newPassword,
    confirmPassword,
  });

  if (!validation.success) {
    setError(getFirstValidationMessage(validation.error));
    return;
  }

  try {
  setIsLoading(true);
  setError('');

  await updatePasswordApi({
    oldPassword: validation.data.oldPassword,
    newPassword: validation.data.newPassword,
    confirmPassword: validation.data.confirmPassword,
  });

  await logoutUser();
  router.replace('/login');
  return;
} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : 'Impossibile aggiornare la password.'
  );
} finally {
  setIsLoading(false);
}
}

  return (
    <Screen>
      <Pressable
        hitSlop={10}
        style={({ pressed }) => pressed && styles.pressed}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>‹ Indietro</Text>
      </Pressable>

      <Text style={styles.title}>Impostazioni</Text>

      {error ? (
        <Card>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionTitle}>Dati account</Text>

        <SettingRow
          title="Modifica email"
          isOpen={emailFormVisible}
          onPress={() => {
            setError('');
            setEmailFormVisible((currentValue) => !currentValue);
            setPasswordFormVisible(false);
          }}
        />

        {emailFormVisible ? (
          <View style={styles.formBox}>
            <TextInput
              style={styles.input}
              placeholder="Nuova email"
              placeholderTextColor="#7A7F9A"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={newEmail}
              onChangeText={(text) => {
                setNewEmail(text);
                setError('');
              }}
            />

            <AppButton
              title={isLoading ? 'Salvataggio...' : 'Salva email'}
              onPress={handleUpdateEmail}
            />
          </View>
        ) : null}

        <SettingRow
          title="Modifica password"
          isOpen={passwordFormVisible}
          onPress={() => {
            setError('');
            setPasswordFormVisible((currentValue) => !currentValue);
            setEmailFormVisible(false);
          }}
        />

        {passwordFormVisible ? (
          <View style={styles.formBox}>
            <PasswordInput
              placeholder="Vecchia password"
              value={oldPassword}
              showPassword={showOldPassword}
              onChangeText={(text) => {
                setOldPassword(text);
                setError('');
              }}
              onToggleVisibility={() =>
                setShowOldPassword((currentValue) => !currentValue)
              }
            />

            <PasswordInput
              placeholder="Nuova password"
              value={newPassword}
              showPassword={showNewPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setError('');
              }}
              onToggleVisibility={() =>
                setShowNewPassword((currentValue) => !currentValue)
              }
            />

            <PasswordInput
              placeholder="Ripeti nuova password"
              value={confirmPassword}
              showPassword={showConfirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              onToggleVisibility={() =>
                setShowConfirmPassword((currentValue) => !currentValue)
              }
            />

            <Text style={styles.helperText}>
              La nuova password deve avere da 8 a 16 caratteri, almeno una
              maiuscola, un numero e un carattere speciale.
            </Text>

            <AppButton
              title={isLoading ? 'Salvataggio...' : 'Salva password'}
              onPress={handleUpdatePassword}
            />
          </View>
        ) : null}

        <SettingRow
          title="Modifica username"
          onPress={() =>
            Alert.alert(
              'Modifica username',
              'Questa funzione la colleghiamo nel blocco successivo.'
            )
          }
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Notifiche</Text>

        <SwitchRow
          title="Nuove sfide"
          value={newChallenges}
          onValueChange={setNewChallenges}
        />

        <SwitchRow
          title="Progressi"
          value={progressNotifications}
          onValueChange={setProgressNotifications}
        />

        <SwitchRow
          title="Interazioni social"
          value={socialNotifications}
          onValueChange={setSocialNotifications}
        />

        <Text style={styles.noteText}>
          Nel prossimo blocco colleghiamo questi toggle alle preferenze salvate
          nel database.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Sicurezza</Text>

        <AppButton title="Logout" variant="danger" onPress={handleLogout} />
      </Card>
    </Screen>
  );
}

function SettingRow({
  title,
  onPress,
  isOpen = false,
}: {
  title: string;
  onPress: () => void;
  isOpen?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.rowText}>{title}</Text>
      <Text style={styles.arrow}>{isOpen ? '⌃' : '›'}</Text>
    </Pressable>
  );
}

function SwitchRow({
  title,
  value,
  onValueChange,
}: {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{title}</Text>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#D9DCE8',
          true: '#C9CDFF',
        }}
        thumbColor={value ? '#5B5FEF' : '#FFFFFF'}
        ios_backgroundColor="#D9DCE8"
      />
    </View>
  );
}

function PasswordInput({
  placeholder,
  value,
  showPassword,
  onChangeText,
  onToggleVisibility,
}: {
  placeholder: string;
  value: string;
  showPassword: boolean;
  onChangeText: (text: string) => void;
  onToggleVisibility: () => void;
}) {
  return (
    <View style={styles.passwordField}>
      <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#7A7F9A"
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="none"
          autoComplete="off"
          importantForAutofill="no"
        />

      <Pressable
        hitSlop={10}
        style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
        onPress={onToggleVisibility}
      >
        <Ionicons
          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color="#5B5FEF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backText: {
    color: '#5B5FEF',
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#17172F',
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#5B5FEF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  row: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginTop: 8,
    backgroundColor: '#F6F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {
    color: '#17172F',
    fontSize: 15,
    fontWeight: '800',
  },
  arrow: {
    color: '#7A7F9A',
    fontSize: 24,
    marginTop: -2,
  },
  formBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#FAFAFF',
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  input: {
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#17172F',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  passwordField: {
    minHeight: 53,
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    marginBottom: 10,
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
    textAlign: 'center',
    marginBottom: 4,
  },
  noteText: {
    color: '#7A7F9A',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: '#D64545',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.75,
  },
});