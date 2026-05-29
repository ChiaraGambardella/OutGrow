import { router } from 'expo-router';
import { Button, Text, TextInput, View } from 'react-native';

export default function Register() {
  return (
    <View>
      <Text>Registrazione</Text>

      <TextInput placeholder="Nome" />
      <TextInput placeholder="Cognome" />
      <TextInput placeholder="Data di nascita" />
      <TextInput placeholder="Email" />

      <TextInput placeholder="Username" />
      <TextInput placeholder="Password" secureTextEntry />
      <TextInput placeholder="Ripeti password" secureTextEntry />

      <Button title="Registrati" onPress={() => router.replace('/challenge')} />
    </View>
  );
}