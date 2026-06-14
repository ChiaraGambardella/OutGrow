import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="complete-challenge" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}