import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AppButton from '../../components/AppButton';
import Screen from '../../components/Screen';
import { getFirstValidationMessage } from '../../lib/auth';
import { RegisterStep1Schema } from '@outgrow/shared';

function formatBirthDate(date: Date) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
function formatBirthDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
export default function RegisterStep1() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  function handleNext() {
    if (!birthDate) {
      setError('È necessario inserire la data di nascita.');
      return;
    }

    const validation = RegisterStep1Schema.safeParse({
      name,
      surname,
      birthDate,
      email,
    });

    if (!validation.success) {
      setError(getFirstValidationMessage(validation.error));
      return;
    }

    setError('');

    router.push({
      pathname: '/(auth)/register-step2',
      params: {
        name: validation.data.name,
        surname: validation.data.surname,
        birthDate: formatBirthDateForApi(validation.data.birthDate),
        email: validation.data.email,
      },
    });
  }

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>OutGrow</Text>
          <Text style={styles.subtitle}>
            Crea il tuo profilo e inizia un percorso di crescita fatto di sfide
            reali.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#7A7F9A"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Cognome"
            placeholderTextColor="#7A7F9A"
            value={surname}
            onChangeText={(text) => {
              setSurname(text);
              setError('');
            }}
          />

          <Pressable
            style={({ pressed }) => [
              styles.input,
              styles.dateInput,
              pressed && styles.pressed,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={birthDate ? styles.dateText : styles.placeholderText}>
              {birthDate ? formatBirthDate(birthDate) : 'Data di nascita'}
            </Text>
          </Pressable>

          {showDatePicker ? (
            <DateTimePicker
              value={birthDate ?? new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              locale="it-IT"
              themeVariant="light"
              textColor="#5B5FEF"
              onChange={(event, selectedDate) => {
                if (Platform.OS !== 'ios') {
                  setShowDatePicker(false);
                }

                if (event.type === 'dismissed') {
                  return;
                }

                if (selectedDate) {
                  setBirthDate(selectedDate);
                  setError('');
                }
              }}
            />
          ) : null}

          {Platform.OS === 'ios' && showDatePicker ? (
            <Pressable
              style={({ pressed }) => [
                styles.confirmDateButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.confirmDateText}>Conferma data</Text>
            </Pressable>
          ) : null}

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

          <View style={styles.buttonContainer}>
            <AppButton title="Avanti" onPress={handleNext} />
          </View>
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
  dateInput: {
    minHeight: 53,
    justifyContent: 'center',
  },
  dateText: {
    color: '#17172F',
    fontSize: 15,
  },
  placeholderText: {
    color: '#7A7F9A',
    fontSize: 15,
  },
  confirmDateButton: {
    alignSelf: 'center',
    marginTop: -4,
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#ECEEFF',
  },
  confirmDateText: {
    color: '#5B5FEF',
    fontWeight: '800',
    fontSize: 13,
  },
  errorText: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  },
  pressed: {
    opacity: 0.75,
  },
});