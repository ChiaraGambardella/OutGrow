import { router } from 'expo-router';
import { Button, Text, TextInput, View } from 'react-native';

export default function CompleteChallenge() {
  return (
    <View>
      <Text>OutGrow</Text>
      <Text>Titolo sfida</Text>

      <Text>Descrizione esperienza</Text>
      <TextInput placeholder="Scrivi cosa hai fatto..." />

      <Text>Media</Text>
      <Button title="Camera" onPress={() => {}} />
      <Button title="Galleria" onPress={() => {}} />

      <Button title="Aggiungi posizione" onPress={() => {}} />

      <Text>Difficoltà aspettata</Text>
      <Text>Difficoltà percepita</Text>

      <Button title="Annulla" onPress={() => router.back()} />
      <Button title="Salva" onPress={() => router.push('/feed')} />
    </View>
  );
}