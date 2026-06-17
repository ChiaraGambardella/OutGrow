import { Stack } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
