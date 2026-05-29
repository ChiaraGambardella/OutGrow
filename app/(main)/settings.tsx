import { router } from 'expo-router';
import { Button, Switch, Text, View } from 'react-native';

export default function Settings() {
  return (
    <View>
      <Button title="Indietro" onPress={() => router.back()} />

      <Text>Impostazioni</Text>

      <Text>Dati account</Text>
      <Text>Modifica email</Text>
      <Text>Modifica password</Text>
      <Text>Modifica username</Text>

      <Text>Notifiche</Text>
      <Text>Nuove sfide</Text>
      <Switch />
      <Text>Progressi</Text>
      <Switch />
      <Text>Interazioni social</Text>
      <Switch />

      <Text>Sicurezza</Text>
      <Button title="Logout" onPress={() => router.replace('/login')} />
    </View>
  );
}