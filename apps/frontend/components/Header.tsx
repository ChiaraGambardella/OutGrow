import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  cancelWeeklyChallengeNotification,
  scheduleWeeklyChallengeNotification,
} from '../lib/notifications';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  getFirstValidationMessage,
  getPreferencesApi,
  logoutUser,
  updateEmailApi,
  updatePasswordApi,
  updatePreferencesApi,
} from '../lib/auth';
import { UpdateEmailSchema, UpdatePasswordSchema } from '../lib/schemas';

type HeaderProps = {
  title: string;
  showSettings?: boolean;
  onSettingsPress?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
};

export default function Header({
  title,
  showSettings = false,
  showMenu = false,
}: HeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const [newChallenges, setNewChallenges] = useState(true);
  const [progressNotifications, setProgressNotifications] = useState(true);
  const [socialNotifications, setSocialNotifications] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

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

  const shouldShowMenu = showMenu || showSettings;

  useEffect(() => {
  if (!menuVisible || preferencesLoaded) {
    return;
  }

  async function loadPreferences() {
    try {
      const preferences = await getPreferencesApi();

      setNewChallenges(preferences.sfide);
      setProgressNotifications(preferences.progressi);
      setSocialNotifications(preferences.social);
      setPreferencesLoaded(true);
    } catch {
      setPreferencesLoaded(true);
    }
  }

  loadPreferences();
}, [menuVisible, preferencesLoaded]);

  function openMenu() {
    setMenuVisible(true);
  }

  function closeMenu() {
    setMenuVisible(false);
    setError('');
    setEmailFormVisible(false);
    setPasswordFormVisible(false);
  }

  function openEmailForm() {
    setError('');
    setEmailFormVisible((currentValue) => !currentValue);
    setPasswordFormVisible(false);
  }

  function openPasswordForm() {
    setError('');
    setPasswordFormVisible((currentValue) => !currentValue);
    setEmailFormVisible(false);
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
        closeMenu();
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

  async function savePreferences(nextPreferences: {
  sfide: boolean;
  progressi: boolean;
  social: boolean;
}) {
  try {
    await updatePreferencesApi(nextPreferences);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Impossibile salvare le preferenze.'
    );
  }
} 


async function handleNewChallengesChange(value: boolean) {
  const previousValue = newChallenges;

  setNewChallenges(value);
  setError('');

  try {
    if (value) {
      await scheduleWeeklyChallengeNotification();
    } else {
      await cancelWeeklyChallengeNotification();
    }

    await savePreferences({
      sfide: value,
      progressi: progressNotifications,
      social: socialNotifications,
    });
  } catch (error) {
    setNewChallenges(previousValue);

    setError(
      error instanceof Error
        ? error.message
        : 'Impossibile aggiornare le notifiche.'
    );
  }
}

function handleProgressNotificationsChange(value: boolean) {
  setProgressNotifications(value);
  setError('');

  savePreferences({
    sfide: newChallenges,
    progressi: value,
    social: socialNotifications,
  });
}

function handleSocialNotificationsChange(value: boolean) {
  setSocialNotifications(value);
  setError('');

  savePreferences({
    sfide: newChallenges,
    progressi: progressNotifications,
    social: value,
  });
}

  async function logout() {
    closeMenu();
    await logoutUser();
    router.replace('/login');
  }

  return (
    <>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={styles.logo} />
          <Text style={styles.title}>{title}</Text>
        </View>

        {shouldShowMenu && (
          <Pressable
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.pressed,
            ]}
            onPress={openMenu}
            hitSlop={8}
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </Pressable>
        )}
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.overlay} onPress={closeMenu} />

          <View style={styles.drawer}>
            <View>
              <View style={styles.drawerHeader}>
                <View style={styles.drawerLogo} />

                <View>
                  <Text style={styles.drawerTitle}>OutGrow</Text>
                  <Text style={styles.drawerSubtitle}>Impostazioni</Text>
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.drawerSection}>
                <Text style={styles.sectionTitle}>Account</Text>

                <MenuItem
                  title="Modifica email"
                  onPress={openEmailForm}
                  isOpen={emailFormVisible}
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

                    <Pressable
                      style={({ pressed }) => [
                        styles.saveButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={handleUpdateEmail}
                    >
                      <Text style={styles.saveButtonText}>
                        {isLoading ? 'Salvataggio...' : 'Salva email'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                <MenuItem
                  title="Modifica password"
                  onPress={openPasswordForm}
                  isOpen={passwordFormVisible}
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
                        setShowConfirmPassword(
                          (currentValue) => !currentValue
                        )
                      }
                    />

                    <Text style={styles.helperText}>
                      Da 8 a 16 caratteri, almeno una maiuscola, un numero e un
                      carattere speciale.
                    </Text>

                    <Pressable
                      style={({ pressed }) => [
                        styles.saveButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={handleUpdatePassword}
                    >
                      <Text style={styles.saveButtonText}>
                        {isLoading ? 'Salvataggio...' : 'Salva password'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>

              <View style={styles.drawerSection}>
                <Text style={styles.sectionTitle}>Notifiche</Text>

                <SwitchItem
  title="Nuove sfide"
  value={newChallenges}
  onValueChange={handleNewChallengesChange}
/>

<SwitchItem
  title="Progressi"
  value={progressNotifications}
  onValueChange={handleProgressNotificationsChange}
/>

<SwitchItem
  title="Interazioni social"
  value={socialNotifications}
  onValueChange={handleSocialNotificationsChange}
/>
              </View>
            </View>

            <View style={styles.bottomSection}>
              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.pressed,
                ]}
                onPress={logout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type MenuItemProps = {
  title: string;
  onPress: () => void;
  isOpen?: boolean;
};

function MenuItem({ title, onPress, isOpen = false }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.menuItemText}>{title}</Text>
      <Text style={styles.menuItemArrow}>{isOpen ? '⌃' : '›'}</Text>
    </Pressable>
  );
}

type SwitchItemProps = {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SwitchItem({ title, value, onValueChange }: SwitchItemProps) {
  return (
    <View style={styles.switchItem}>
      <Text style={styles.switchItemText}>{title}</Text>

      <View style={styles.switchWrapper}>
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
      />

      <Pressable
        hitSlop={10}
        style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
        onPress={onToggleVisibility}
      >
        <Ionicons
          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color="#5B5FEF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ECEEFF',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#17172F',
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  menuLine: {
    width: 24,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#5B5FEF',
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 47, 0.35)',
  },
  drawer: {
    width: 300,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: -6, height: 0 },
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  drawerLogo: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#ECEEFF',
    marginRight: 12,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#17172F',
  },
  drawerSubtitle: {
    fontSize: 13,
    color: '#7A7F9A',
    fontWeight: '700',
    marginTop: 2,
  },
  drawerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#5B5FEF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  menuItem: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 7,
    backgroundColor: '#F6F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17172F',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#7A7F9A',
    marginTop: -2,
  },
  formBox: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#FAFAFF',
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  input: {
    minHeight: 48,
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#17172F',
    borderWidth: 1,
    borderColor: '#EEF0F6',
    marginBottom: 8,
  },
  passwordField: {
    minHeight: 48,
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F6',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 6,
    fontSize: 14,
    color: '#17172F',
  },
  eyeButton: {
    width: 42,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    color: '#7A7F9A',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  saveButton: {
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: '#5B5FEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  errorText: {
    color: '#D64545',
    fontWeight: '800',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 12,
  },
  switchItem: {
    height: 48,
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 16,
    marginBottom: 7,
    backgroundColor: '#F6F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#17172F',
    marginRight: 10,
    includeFontPadding: false,
  },
  switchWrapper: {
    width: 54,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 0.86 }],
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#EEF0F6',
    paddingTop: 16,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#FFF1F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#E5484D',
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
  },
});