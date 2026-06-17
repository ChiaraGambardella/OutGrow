import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import Header from '../../components/Header';
import Screen from '../../components/Screen';
import {
  completeChallengeApi,
  type ChallengeMedia,
} from '../../lib/challenges';

const DIFFICULTIES = [
  { label: 'Bassa', value: 'facile' },
  { label: 'Media', value: 'media' },
  { label: 'Alta', value: 'difficile' },
];

export default function CompleteChallenge() {
  const { sfidaId, titolo } = useLocalSearchParams<{
    sfidaId?: string;
    titolo?: string;
  }>();

  const [description, setDescription] = useState('');
  const [difficoltaAttesa, setDifficoltaAttesa] = useState('');
  const [difficoltaPercepita, setDifficoltaPercepita] = useState('');
  const [media, setMedia] = useState<ChallengeMedia[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [consensi, setConsensi] = useState<{
    Fotocamera?: boolean;
    Galleria?: boolean;
    GNSS?: boolean;
  }>({});

  const getFileNameFromUri = (uri: string) => {
    const parts = uri.split('/');
    return parts[parts.length - 1] || `media-${Date.now()}.jpg`;
  };

  const getMimeTypeFromUri = (uri: string, assetType?: string | null) => {
    const lowerUri = uri.toLowerCase();

    if (assetType === 'video') {
      if (lowerUri.endsWith('.mov')) return 'video/quicktime';
      return 'video/mp4';
    }

    if (lowerUri.endsWith('.png')) return 'image/png';
    return 'image/jpeg';
  };

  const mapAssetToMedia = (
    asset: ImagePicker.ImagePickerAsset
  ): ChallengeMedia => ({
    uri: asset.uri,
    name: asset.fileName || getFileNameFromUri(asset.uri),
    type: getMimeTypeFromUri(asset.uri, asset.type),
  });

  const pickFromGallery = async () => {
    setError('');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setConsensi((current) => ({ ...current, Galleria: false }));
      setError('Devi consentire l’accesso alla galleria per aggiungere media.');
      return;
    }

    setConsensi((current) => ({ ...current, Galleria: true }));

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (result.canceled) return;

    const selectedMedia = result.assets.map(mapAssetToMedia);

    setMedia((currentMedia) => {
      const nextMedia = [...currentMedia, ...selectedMedia];
      return nextMedia.slice(0, 5);
    });
  };

  const takeFromCamera = async () => {
    setError('');

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setConsensi((current) => ({ ...current, Fotocamera: false }));
      setError('Devi consentire l’accesso alla fotocamera per scattare una foto.');
      return;
    }

    setConsensi((current) => ({ ...current, Fotocamera: true }));

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    });

    if (result.canceled) return;

    const selectedMedia = result.assets.map(mapAssetToMedia);

    setMedia((currentMedia) => {
      const nextMedia = [...currentMedia, ...selectedMedia];
      return nextMedia.slice(0, 5);
    });
  };

  const handleLocationAcquisition = async () => {
    setError('');
    setLocationLoading(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setConsensi((current) => ({ ...current, GNSS: false }));
        setError(
          'Permesso di geolocalizzazione negato. Puoi completare la sfida anche senza posizione.'
        );
        return;
      }

      setConsensi((current) => ({ ...current, GNSS: true }));

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];

        const placeParts = [
          place.city || place.subregion,
          place.region,
        ].filter(Boolean);

        setLocationName(placeParts.join(', ') || 'Posizione rilevata');
      } else {
        setLocationName('Posizione rilevata');
      }
    } catch {
      setError('Impossibile recuperare la posizione attuale. Riprova.');
    } finally {
      setLocationLoading(false);
    }
  };

  const removeLocation = () => {
    setLocationName(null);
    setCoordinates(null);

    setConsensi((current) => {
      const nextConsensi = { ...current };
      delete nextConsensi.GNSS;
      return nextConsensi;
    });
  };

  const handleSave = async () => {
    if (!sfidaId) {
      setError('Sfida non valida.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const hasConsensi = Object.keys(consensi).length > 0;

      await completeChallengeApi({
        sfidaId,
        description,
        difficoltaAttesa,
        difficoltaPercepita,
        media,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        locationName,
        consensi: hasConsensi ? consensi : undefined,
      });

      router.push('/feed');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Impossibile completare la sfida.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="OutGrow" />

      <Text style={styles.sectionLabel}>COMPLETA SFIDA</Text>

      <Card>
        <Text style={styles.title}>{titolo || 'Sfida settimanale'}</Text>

        <Text style={styles.label}>Descrivi la tua esperienza</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Racconta cosa hai fatto, cosa hai provato e cosa hai imparato..."
          placeholderTextColor="#9A9AA8"
          multiline
          style={styles.textArea}
        />

        <Text style={styles.label}>Media</Text>

        <View style={styles.mediaActions}>
          <Pressable style={styles.secondaryButton} onPress={takeFromCamera}>
            <Text style={styles.secondaryButtonText}>Camera</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={pickFromGallery}>
            <Text style={styles.secondaryButtonText}>Galleria</Text>
          </Pressable>
        </View>

        {media.length > 0 ? (
          <View style={styles.previewGrid}>
            {media.map((item, index) => (
              <View key={`${item.uri}-${index}`} style={styles.previewItem}>
                {item.type.startsWith('image/') ? (
                  <Image source={{ uri: item.uri }} style={styles.previewImage} />
                ) : (
                  <VideoPreview uri={item.uri} />
                )}

                <Pressable
                  style={styles.removeMediaButton}
                  onPress={() =>
                    setMedia((currentMedia) =>
                      currentMedia.filter(
                        (_, mediaIndex) => mediaIndex !== index
                      )
                    )
                  }
                >
                  <Text style={styles.removeMediaText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.label}>Posizione</Text>

        {locationLoading ? (
          <View style={[styles.locationCard, styles.locationLoadingCard]}>
            <View style={styles.locationIconBox}>
              <Text style={styles.locationIcon}>⌖</Text>
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.locationTitle}>Rilevamento in corso...</Text>
              <Text style={styles.locationSubtitle}>
                Stiamo recuperando la tua posizione.
              </Text>
            </View>
          </View>
        ) : locationName ? (
          <View style={styles.locationCard}>
            <View style={styles.locationIconBox}>
              <Text style={styles.locationIcon}>📍</Text>
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.locationTitle}>{locationName}</Text>
              <Text style={styles.locationSubtitle}>
                La posizione verrà allegata alla tua esperienza.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.removeLocationButton,
                pressed && styles.pressed,
              ]}
              onPress={removeLocation}
            >
              <Text style={styles.removeLocationText}>Rimuovi</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.locationButton,
              pressed && styles.pressed,
            ]}
            onPress={handleLocationAcquisition}
          >
            <View style={styles.locationButtonIconBox}>
              <Text style={styles.locationButtonIcon}>📍</Text>
            </View>

            <View style={styles.locationButtonContent}>
              <Text style={styles.locationButtonTitle}>Aggiungi posizione</Text>
              <Text style={styles.locationButtonSubtitle}>
                Mostra dove hai completato la sfida
              </Text>
            </View>

            <Text style={styles.locationArrow}>›</Text>
          </Pressable>
        )}

        <Text style={styles.label}>Difficoltà aspettata</Text>
        <View style={styles.optionsRow}>
          {DIFFICULTIES.map((difficulty) => (
            <Pressable
              key={difficulty.value}
              style={[
                styles.option,
                difficoltaAttesa === difficulty.value && styles.optionSelected,
              ]}
              onPress={() =>
                setDifficoltaAttesa((currentValue) =>
                  currentValue === difficulty.value ? '' : difficulty.value
                )
              }
            >
              <Text
                style={[
                  styles.optionText,
                  difficoltaAttesa === difficulty.value &&
                    styles.optionTextSelected,
                ]}
              >
                {difficulty.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Difficoltà percepita</Text>
        <View style={styles.optionsRow}>
          {DIFFICULTIES.map((difficulty) => (
            <Pressable
              key={difficulty.value}
              style={[
                styles.option,
                difficoltaPercepita === difficulty.value &&
                  styles.optionSelected,
              ]}
              onPress={() =>
                setDifficoltaPercepita((currentValue) =>
                  currentValue === difficulty.value ? '' : difficulty.value
                )
              }
            >
              <Text
                style={[
                  styles.optionText,
                  difficoltaPercepita === difficulty.value &&
                    styles.optionTextSelected,
                ]}
              >
                {difficulty.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AppButton
          title={saving ? 'Salvataggio...' : 'Salva esperienza'}
          onPress={handleSave}
        />
      </Card>
    </Screen>
  );
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.muted = true;
    player.pause();
  });

  return (
    <View style={styles.videoPreview}>
      <VideoView
        player={player}
        style={styles.videoPreviewPlayer}
        nativeControls={false}
        contentFit="cover"
      />

      <View style={styles.videoOverlay}>
        <Text style={styles.videoIcon}>▶</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: '#7A7F9A',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#17172F',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17172F',
    marginTop: 16,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 130,
    backgroundColor: '#F6F7FB',
    borderRadius: 18,
    padding: 14,
    color: '#17172F',
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 21,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ECEEFF',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#5B5FEF',
    fontWeight: '800',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  previewItem: {
    width: '48%',
    height: 130,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F0F1F7',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(23, 23, 47, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '800',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ECEEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewPlayer: {
    ...StyleSheet.absoluteFillObject,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    color: '#5B5FEF',
    fontSize: 28,
    fontWeight: '900',
  },
  locationButton: {
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: '#F5F6FF',
    borderWidth: 1,
    borderColor: '#E2E5FF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButtonIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECEEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationButtonIcon: {
    fontSize: 20,
  },
  locationButtonContent: {
    flex: 1,
  },
  locationButtonTitle: {
    color: '#17172F',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },
  locationButtonSubtitle: {
    color: '#7A7F9A',
    fontSize: 12,
    fontWeight: '600',
  },
  locationArrow: {
    color: '#5B5FEF',
    fontSize: 28,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationCard: {
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: '#F5F6FF',
    borderWidth: 1,
    borderColor: '#E2E5FF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLoadingCard: {
    opacity: 0.78,
  },
  locationIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECEEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationIcon: {
    fontSize: 20,
  },
  locationContent: {
    flex: 1,
  },
  locationTitle: {
    color: '#17172F',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },
  locationSubtitle: {
    color: '#7A7F9A',
    fontSize: 12,
    fontWeight: '600',
  },
  removeLocationButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  removeLocationText: {
    color: '#D64545',
    fontSize: 12,
    fontWeight: '900',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
  },
  optionSelected: {
    backgroundColor: '#5B5FEF',
  },
  optionText: {
    color: '#5E6278',
    fontWeight: '800',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#D64545',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 4,
  },
  pressed: {
    opacity: 0.75,
  },
});