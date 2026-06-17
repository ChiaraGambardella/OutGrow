import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const WEEKLY_CHALLENGE_NOTIFICATION_ID = 'outgrow_weekly_challenge';

export async function requestNotificationPermissions() {
  try {
    const currentPermissions = await Notifications.getPermissionsAsync();

    if (
      currentPermissions.granted ||
      currentPermissions.ios?.status ===
        Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return true;
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync();

    return (
      requestedPermissions.granted ||
      requestedPermissions.ios?.status ===
        Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    if (isExpoGo) {
      console.warn(
        'Expo Go rilevato: impossibile verificare i permessi notifiche, continuo solo per test locali.'
      );
      return true;
    }

    throw error;
  }
}

export async function scheduleWeeklyChallengeNotification() {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    throw new Error('Permesso notifiche non concesso.');
  }

  await cancelWeeklyChallengeNotification();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('weekly-challenge', {
      name: 'Sfide settimanali',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_CHALLENGE_NOTIFICATION_ID,
    content: {
      title: 'Nuova sfida OutGrow 🌱',
      body: 'La sfida settimanale è pronta. Apri l’app e mettiti alla prova!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 2,
      hour: 10,
      minute: 0,
      channelId: Platform.OS === 'android' ? 'weekly-challenge' : undefined,
    },
  });

  console.log('📅 Notifica settimanale OutGrow pianificata.');
}

export async function cancelWeeklyChallengeNotification() {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      WEEKLY_CHALLENGE_NOTIFICATION_ID
    );
  } catch {
    // Se non esiste ancora una notifica pianificata, non blocchiamo l'app.
  }
}