import { router } from 'expo-router';
import { Button, Text, TextInput, View } from 'react-native';

export default function Login() {
  return (
    <View>
      <Text>OutGrow</Text>
      <Text>Email</Text>
      <TextInput placeholder="Email" />

      <Text>Password</Text>
      <TextInput placeholder="Password" secureTextEntry />

      <Button title="Accedi" onPress={() => router.replace('/challenge')} />
      <Button title="Registrati" onPress={() => router.push('/register')} />
    </View>
  );
}