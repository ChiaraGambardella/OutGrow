import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import AppButton from '../../../components/AppButton';
import Card from '../../../components/Card';
import Header from '../../../components/Header';
import Screen from '../../../components/Screen';
import {
  getWeeklyChallengeApi,
  WeeklyChallenge,
} from '../../../lib/challenges';

function getImageUrl(imagePath?: string | null) {
  if (!imagePath) return null;

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) return null;

  return `${baseUrl.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
}

export default function Challenge() {
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadChallenge = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getWeeklyChallengeApi();
      setChallenge(data);
    } catch (challengeError) {
      setError(
        challengeError instanceof Error
          ? challengeError.message
          : 'Impossibile caricare la sfida settimanale.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);
  const imageUrl = getImageUrl(challenge?.immagineSfida);
  return (
    <Screen>
      <Header title="OutGrow"
        showMenu
        onMenuPress={() => router.push('/settings')}
      />

      <Text style={styles.sectionLabel}>QUESTA SETTIMANA</Text>
      {loading ? (
  <Card>
    <Text style={styles.messageText}>Caricamento sfida...</Text>
  </Card>
) : null}

{error ? (
  <Card>
    <Text style={styles.errorText}>{error}</Text>

    <AppButton title="Riprova" onPress={loadChallenge} />
  </Card>
) : null}

      {challenge && !loading && !error ? (
  <Card>
    <Text style={styles.title}>{challenge.titolo}</Text>

    {imageUrl ? (
  <Image
    source={{ uri: imageUrl }}
    style={styles.challengeImage}
    resizeMode="cover"
  />
) : (
  <View style={styles.imagePlaceholder}>
    <Text style={styles.imageText}>Foto sfida</Text>
  </View>
)}

    <Text style={styles.description}>{challenge.descrizione}</Text>

    {challenge.completata ? (
      <View style={styles.completedBox}>
        <Text style={styles.completedText}>
          Hai già completato la sfida di questa settimana 🎉
        </Text>
      </View>
    ) : (
      <AppButton
        title="Completa la sfida"
        onPress={() =>
          router.push({
            pathname: '/complete-challenge',
            params: {
              sfidaId: String(challenge.id),
              titolo: challenge.titolo,
            },
          })
        }
      />
    )}
  </Card>
) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5B5FEF',
    marginBottom: 10,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#17172F',
    marginBottom: 14,
  },
  imagePlaceholder: {
    height: 170,
    borderRadius: 18,
    backgroundColor: '#ECEEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeImage: {
  height: 170,
  borderRadius: 18,
  marginBottom: 16,
  width: '100%',
  },
  imageText: {
    color: '#5B5FEF',
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5E6278',
  },
  messageText: {
  color: '#5E6278',
  fontSize: 15,
  fontWeight: '700',
  textAlign: 'center',
},
errorText: {
  color: '#D64545',
  fontSize: 14,
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: 12,
},
completedBox: {
  backgroundColor: '#F0FFF4',
  borderRadius: 16,
  padding: 14,
  marginTop: 18,
},
completedText: {
  color: '#247A3D',
  fontSize: 14,
  fontWeight: '800',
  textAlign: 'center',
},
});