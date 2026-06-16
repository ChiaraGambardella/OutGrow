import * as ImagePicker from 'expo-image-picker';
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
  { label: 'Media', value: 'medio' },
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
      setError('Devi consentire l’accesso alla galleria per aggiungere media.');
      return;
    }

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
      setError('Devi consentire l’accesso alla fotocamera per scattare una foto.');
      return;
    }

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

  const handleSave = async () => {
    if (!sfidaId) {
      setError('Sfida non valida.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await completeChallengeApi({
        sfidaId,
        description,
        difficoltaAttesa,
        difficoltaPercepita,
        media,
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
                  <View style={styles.videoPreview}>
                    <Text style={styles.videoPreviewText}>Video</Text>
                  </View>
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

        <Pressable style={styles.locationButton}>
          <Text style={styles.locationButtonText}>Aggiungi posizione</Text>
        </Pressable>

        <Text style={styles.label}>Difficoltà aspettata</Text>
        <View style={styles.optionsRow}>
          {DIFFICULTIES.map((difficulty) => (
            <Pressable
              key={`attesa-${difficulty.value}`}
              style={[
                styles.option,
                difficoltaAttesa === difficulty.value && styles.optionSelected,
              ]}
              onPress={() => setDifficoltaAttesa(difficulty.value)}
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
              key={`percepita-${difficulty.value}`}
              style={[
                styles.option,
                difficoltaPercepita === difficulty.value &&
                  styles.optionSelected,
              ]}
              onPress={() => setDifficoltaPercepita(difficulty.value)}
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

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Annulla</Text>
          </Pressable>

          <View style={styles.saveButton}>
            <AppButton
              title={saving ? 'Salvataggio...' : 'Salva'}
              onPress={handleSave}
            />
          </View>
        </View>
      </Card>
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
    fontSize: 23,
    fontWeight: '800',
    color: '#17172F',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17172F',
    marginBottom: 8,
    marginTop: 14,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 18,
    backgroundColor: '#F5F6FF',
    padding: 14,
    fontSize: 15,
    color: '#17172F',
    textAlignVertical: 'top',
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#ECEEFF',
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
    gap: 10,
    marginTop: 12,
  },
  previewItem: {
    width: 86,
    height: 86,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F1F7',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    color: '#5B5FEF',
    fontWeight: '800',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#17172F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  locationButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DCFF',
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  locationButtonText: {
    color: '#5B5FEF',
    fontWeight: '800',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#F5F6FF',
    paddingVertical: 11,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#5B5FEF',
  },
  optionText: {
    color: '#5E6278',
    fontWeight: '800',
    fontSize: 13,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#D64545',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F1F1F6',
  },
  cancelButtonText: {
    color: '#5E6278',
    fontWeight: '800',
  },
  saveButton: {
    flex: 1,
  },
});