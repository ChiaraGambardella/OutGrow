import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';

import Card from '../../../components/Card';
import Header from '../../../components/Header';
import Screen from '../../../components/Screen';
import {
  getMyProfile,
  MyProfile,
  updateProfileMediaApi,
} from '../../../lib/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function getMediaUrl(path?: string | null) {
  if (!path || !API_BASE_URL) {
    return null;
  }

  if (path.startsWith('http')) {
    return path;
  }

  const cleanBaseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBaseUrl}${cleanPath}`;
}

function getInitials(profile: MyProfile | null) {
  if (!profile) {
    return 'U';
  }

  if (profile.initials) {
    return profile.initials;
  }

  const nome = profile.nome ?? profile.name ?? '';
  const cognome = profile.cognome ?? profile.surname ?? '';

  const first = nome.trim()[0] ?? profile.username?.[0] ?? 'U';
  const second = cognome.trim()[0] ?? '';

  return `${first}${second}`.toUpperCase();
}

function getFullName(profile: MyProfile) {
  const nome = profile.nome ?? profile.name ?? '';
  const cognome = profile.cognome ?? profile.surname ?? '';
  const fullName = [nome, cognome].filter(Boolean).join(' ').trim();

  return fullName || profile.username;
}

function formatDifficulty(value?: string | null) {
  if (value === 'facile') return 'Bassa';
  if (value === 'medio') return 'Media';
  if (value === 'difficile') return 'Alta';

  return 'Non indicata';
}

type ProfileMedia = {
  id: number | string;
  tipo: 'Immagine' | 'Video';
  url: string;
};

type SelectedMedia = {
  url: string;
  tipo: 'Immagine' | 'Video';
};

export default function Profile() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<string | null>(
  null
);

  async function loadProfile() {
    try {
      setIsLoading(true);
      setError('');

      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossibile caricare il profilo.';

      setError(message);

      if (message.toLowerCase().includes('sessione')) {
        router.replace('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const coverUrl = getMediaUrl(profile?.copertina ?? profile?.coverPictureUrl);
  const avatarUrl = getMediaUrl(profile?.foto ?? profile?.profilePictureUrl);

  function getUploadFileName(uri: string) {
    const fileName = uri.split('/').pop();

    if (fileName) {
      return fileName;
    }

    return `profile-${Date.now()}.jpg`;
  }

  async function pickProfilePhoto(source: 'galleria' | 'fotocamera') {
    if (isUpdatingPhoto) {
      return;
    }

    try {
      setIsUpdatingPhoto(true);

      const permission =
        source === 'galleria'
          ? await ImagePicker.requestMediaLibraryPermissionsAsync()
          : await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permesso necessario',
          source === 'galleria'
            ? 'Per scegliere una foto serve il permesso di accesso alla galleria.'
            : 'Per scattare una foto serve il permesso di accesso alla fotocamera.'
        );
        return;
      }

      const result =
        source === 'galleria'
          ? await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.85,
            })
          : await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.85,
            });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      await updateProfileMediaApi({
        foto: {
          uri: asset.uri,
          name: asset.fileName ?? getUploadFileName(asset.uri),
          type: asset.mimeType ?? 'image/jpeg',
        },
        sorgenteMediaFoto: source,
      });

      await loadProfile();

      Alert.alert('Foto aggiornata', 'La foto profilo è stata aggiornata.');
    } catch (error) {
      Alert.alert(
        'Errore',
        error instanceof Error
          ? error.message
          : 'Impossibile aggiornare la foto profilo.'
      );
    } finally {
      setIsUpdatingPhoto(false);
    }
  }

  async function pickCoverPhoto(source: 'galleria' | 'fotocamera') {
    if (isUpdatingCover) {
      return;
    }

    try {
      setIsUpdatingCover(true);

      const permission =
        source === 'galleria'
          ? await ImagePicker.requestMediaLibraryPermissionsAsync()
          : await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permesso necessario',
          source === 'galleria'
            ? 'Per scegliere una copertina serve il permesso di accesso alla galleria.'
            : 'Per scattare una copertina serve il permesso di accesso alla fotocamera.'
        );
        return;
      }

      const result =
        source === 'galleria'
          ? await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.85,
            })
          : await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.85,
            });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      await updateProfileMediaApi({
        copertina: {
          uri: asset.uri,
          name: asset.fileName ?? getUploadFileName(asset.uri),
          type: asset.mimeType ?? 'image/jpeg',
        },
        sorgenteMediaCopertina: source,
      });

      await loadProfile();

      Alert.alert(
        'Copertina aggiornata',
        'La foto copertina è stata aggiornata.'
      );
    } catch (error) {
      Alert.alert(
        'Errore',
        error instanceof Error
          ? error.message
          : 'Impossibile aggiornare la foto copertina.'
      );
    } finally {
      setIsUpdatingCover(false);
    }
  }

  function openProfilePhotoMenu() {
    Alert.alert('Modifica foto profilo', 'Scegli da dove prendere la foto.', [
      {
        text: 'Fotocamera',
        onPress: () => pickProfilePhoto('fotocamera'),
      },
      {
        text: 'Galleria',
        onPress: () => pickProfilePhoto('galleria'),
      },
      {
        text: 'Annulla',
        style: 'cancel',
      },
    ]);
  }

  function openCoverPhotoMenu() {
    Alert.alert('Modifica copertina', 'Scegli da dove prendere la copertina.', [
      {
        text: 'Fotocamera',
        onPress: () => pickCoverPhoto('fotocamera'),
      },
      {
        text: 'Galleria',
        onPress: () => pickCoverPhoto('galleria'),
      },
      {
        text: 'Annulla',
        style: 'cancel',
      },
    ]);
  }

  return (
    <Screen>
      <Header
        title="OutGrow"
        showMenu
        onSettingsPress={() => router.push('/settings')}
      />

      {isLoading ? (
        <Card>
          <ActivityIndicator color="#5B5FEF" />
          <Text style={styles.loadingText}>Caricamento profilo...</Text>
        </Card>
      ) : null}

      {!isLoading && error ? (
        <Card>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
            onPress={loadProfile}
          >
            <Text style={styles.retryText}>Riprova</Text>
          </Pressable>
        </Card>
      ) : null}

      {!isLoading && profile ? (
        <>
          <View style={styles.profileCard}>
            <View style={styles.cover}>
              {coverUrl ? (
                <Pressable
                  style={styles.coverImageButton}
                  onPress={() => setSelectedProfileImage(coverUrl)}
                >
                  <Image source={{ uri: coverUrl }} style={styles.coverImage} />
                </Pressable>
              ) : (
                <View style={styles.coverFallback}>
                  <View style={styles.coverCircleLarge} />
                  <View style={styles.coverCircleSmall} />
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.coverEditButton,
                  pressed && styles.pressed,
                ]}
                onPress={openCoverPhotoMenu}
              >
                <Text style={styles.coverEditButtonText}>
                  {isUpdatingCover ? '...' : '✎'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                {avatarUrl ? (
                  <Pressable
                    style={styles.avatarImageButton}
                    onPress={() => setSelectedProfileImage(avatarUrl)}
                  >
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.avatarImage}
                    />
                  </Pressable>
                ) : (
                  <Text style={styles.avatarText}>{getInitials(profile)}</Text>
                )}
              </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.photoButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={openProfilePhotoMenu}
                >
                  <Text style={styles.photoButtonText}>
                    {isUpdatingPhoto ? '...' : '✎'}
                  </Text>
                </Pressable>

                <Text style={styles.name}>{getFullName(profile)}</Text>
                <Text style={styles.username}>@{profile.username}</Text>
                              
            </View>
          </View>
          <Modal
            visible={!!selectedProfileImage}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedProfileImage(null)}
          >
            <View style={styles.profileImageModalBackdrop}>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setSelectedProfileImage(null)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </Pressable>

              {selectedProfileImage ? (
                <Image
                  source={{ uri: selectedProfileImage }}
                  style={styles.profileImageModal}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          </Modal>
          <Pressable
            style={({ pressed }) => [
              styles.progressButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              Alert.alert(
                'Progressi',
                'Nel prossimo blocco creeremo la schermata progressi.'
              )
            }
          >
            <View>
              <Text style={styles.progressTitle}>Progressi</Text>
              <Text style={styles.progressSubtitle}>
                {profile.progress?.completedChallenges ??
                  profile.posts?.length ??
                  0}{' '}
                sfide completate
              </Text>
            </View>

            <Text style={styles.progressArrow}>›</Text>
          </Pressable>

          <Card>
            <View style={styles.badgeSectionHeader}>
              <Text style={styles.badgeSectionTitle}>Badge ottenuti</Text>

              <Pressable
                hitSlop={10}
                onPress={() =>
                  Alert.alert(
                    'Badge ottenuti',
                    'Qui mostreremo tutti i badge ottenuti.'
                  )
                }
              >
                <Text style={styles.linkSmall}>Vedi tutti</Text>
              </Pressable>
            </View>

            {profile.badges && profile.badges.length > 0 ? (
              <View style={styles.badgeRow}>
                {profile.badges.slice(0, 4).map((badge) => (
                  <Badge
                    key={String(badge.id)}
                    icon={badge.icon ?? '🎖️'}
                    title={badge.title ?? badge.titolo ?? 'Badge'}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Non hai ancora ottenuto badge. Completa una sfida per iniziare.
              </Text>
            )}
          </Card>

          <View style={styles.postsHeader}>
            <Text style={styles.postsTitle}>Post pubblicati</Text>
          </View>

          {profile.posts && profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <PostPreview
                key={String(post.id)}
                title={post.title ?? post.titoloSfida ?? 'Sfida completata'}
                location={post.location ?? post.luogo ?? null}
                description={
                  post.description ??
                  post.descrizione ??
                  'Nessuna descrizione inserita.'
                }
                expectedDifficulty={
                  post.expectedDifficulty ?? post.difficoltaAttesa
                }
                perceivedDifficulty={
                  post.perceivedDifficulty ?? post.difficoltaPercepita
                }
                media={post.media ?? []}
              />
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText}>
                Non hai ancora pubblicato post. Completa la sfida settimanale
                per condividere la tua esperienza.
              </Text>
            </Card>
          )}
        </>
      ) : null}
    </Screen>
  );
}

type BadgeProps = {
  icon: string;
  title: string;
};

function Badge({ icon, title }: BadgeProps) {
  return (
    <View style={styles.badge}>
      <View style={styles.badgeCircle}>
        <Text style={styles.badgeIcon}>{icon}</Text>
      </View>

      <Text style={styles.badgeTitle}>{title}</Text>
    </View>
  );
}

type PostPreviewProps = {
  title: string;
  location?: string | null;
  description: string;
  expectedDifficulty?: string | null;
  perceivedDifficulty?: string | null;
  media: ProfileMedia[];
};

function PostPreview({
  title,
  location,
  description,
  expectedDifficulty,
  perceivedDifficulty,
  media,
}: PostPreviewProps) {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);

  return (
    <Card>
      <Text style={styles.postTitle}>{title}</Text>

      {location ? <Text style={styles.postLocation}>📍 {location}</Text> : null}

      {media.length > 0 ? (
        <View style={styles.mediaGrid}>
          {media.map((mediaItem) => {
            const mediaUrl = getMediaUrl(mediaItem.url);

            if (!mediaUrl) return null;

            if (mediaItem.tipo === 'Immagine') {
              return (
                <Pressable
                  key={String(mediaItem.id)}
                  style={styles.mediaGridItem}
                  onPress={() =>
                    setSelectedMedia({
                      url: mediaUrl,
                      tipo: 'Immagine',
                    })
                  }
                >
                  <Image
                    source={{ uri: mediaUrl }}
                    style={styles.mediaGridImage}
                    resizeMode="cover"
                  />
                </Pressable>
              );
            }

            return (
              <Pressable
                key={String(mediaItem.id)}
                style={styles.mediaGridItem}
                onPress={() =>
                  setSelectedMedia({
                    url: mediaUrl,
                    tipo: 'Video',
                  })
                }
              >
                <VideoThumbnail uri={mediaUrl} />
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.mediaPlaceholder}>
          <Text style={styles.mediaText}>Foto / video esperienza</Text>
        </View>
      )}

      <Text style={styles.postDescription}>{description}</Text>

      <View style={styles.difficultyRow}>
        <DifficultyPill
          label={`Aspettata: ${formatDifficulty(expectedDifficulty)}`}
        />
        <DifficultyPill
          label={`Percepita: ${formatDifficulty(perceivedDifficulty)}`}
        />
      </View>

      <Modal
        visible={!!selectedMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View style={styles.mediaModalBackdrop}>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setSelectedMedia(null)}
          >
            <Text style={styles.modalCloseText}>×</Text>
          </Pressable>

          {selectedMedia?.tipo === 'Immagine' ? (
            <Image
              source={{ uri: selectedMedia.url }}
              style={styles.imageModal}
              resizeMode="contain"
            />
          ) : null}

          {selectedMedia?.tipo === 'Video' ? (
            <VideoModalPlayer uri={selectedMedia.url} />
          ) : null}
        </View>
      </Modal>
    </Card>
  );
}

function VideoThumbnail({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.muted = true;
    player.pause();
  });

  return (
    <View style={styles.videoTile}>
      <VideoView
        player={player}
        style={styles.videoThumbnail}
        nativeControls={false}
        contentFit="cover"
      />

      <View style={styles.videoOverlay}>
        <Text style={styles.videoIcon}>▶</Text>
      </View>
    </View>
  );
}

function VideoModalPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.videoModal}
      nativeControls
      allowsFullscreen
      contentFit="contain"
    />
  );
}

function DifficultyPill({ label }: { label: string }) {
  return (
    <View style={styles.difficultyPill}>
      <Text style={styles.difficultyText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coverImageButton: {
  width: '100%',
  height: '100%',
},

avatarImageButton: {
  width: '100%',
  height: '100%',
},

profileImageModalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.92)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

profileImageModal: {
  width: '100%',
  height: '80%',
},
  loadingText: {
    marginTop: 10,
    color: '#5E6278',
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: '#D64545',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#ECEEFF',
  },
  retryText: {
    color: '#5B5FEF',
    fontWeight: '900',
  },
  coverFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ECEEFF',
    position: 'relative',
  },
  coverCircleLarge: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#D9DCFF',
    right: -38,
    top: -42,
    opacity: 0.75,
  },
  coverCircleSmall: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#C9CDFF',
    left: 24,
    bottom: -34,
    opacity: 0.65,
  },
  coverEditButton: {
    position: 'absolute',
    right: 18,
    top: 18,
    width: 25,
    height: 25,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  coverEditButtonText: {
    color: '#5B5FEF',
    fontSize: 18,
    fontWeight: '900',
  },
  
  
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 27,
    fontWeight: '900',
    color: '#5B5FEF',
  },
  profileCard: {
  marginHorizontal: -20,
  marginTop: 0,
  marginBottom: 22,
  backgroundColor: '#FFFFFF',
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 4,
},

cover: {
  height: 150,
  width: '100%',
  backgroundColor: '#ECEEFF',
  position: 'relative',
  overflow: 'hidden',
},

coverImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
},

profileInfo: {
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingBottom: 10,
  borderBottomLeftRadius: 34,
  borderBottomRightRadius: 34,
  position: 'relative',
},

avatar: {
  width: 92,
  height: 92,
  borderRadius: 46,
  backgroundColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 3,
  borderColor: '#FFFFFF',
  marginTop: -46,
  marginBottom: 10,
  shadowColor: '#17172F',
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 7 },
  elevation: 4,
  overflow: 'hidden',
},
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#17172F',
    textAlign: 'center',
    marginTop: 2,
  },
  username: {
    color: '#8B8FA8',
    marginTop: 2,
    marginBottom: 12,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 14,
  },
  photoButton: {
  position: 'absolute',
  right: 115,
  top: 10,
  width: 30,
  height: 30,
  borderRadius: 21,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F0F1FF',
  zIndex: 5,
},

photoButtonText: {
  color: '#5B5FEF',
  fontWeight: '900',
  fontSize: 18,
},

  progressButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#5B5FEF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#17172F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  progressSubtitle: {
    color: '#E3E5FF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  progressArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },

  badgeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17172F',
  },
  linkSmall: {
    color: '#5B5FEF',
    fontWeight: '800',
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  badge: {
    width: '23%',
    alignItems: 'center',
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F1F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeIcon: {
    fontSize: 21,
  },
  badgeTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#17172F',
    textAlign: 'center',
  },
  emptyText: {
    color: '#5E6278',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 14,
  },

  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingLeft: 12,
    paddingRight: 2,
  },
  postsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17172F',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#17172F',
    marginBottom: 4,
  },
  postLocation: {
    color: '#5E6278',
    fontSize: 13,
    marginBottom: 12,
  },
  postDescription: {
    fontSize: 14,
    color: '#33364D',
    lineHeight: 20,
    marginBottom: 12,
  },

  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  mediaGridItem: {
    width: '48%',
    height: 140,
    borderRadius: 18,
    backgroundColor: '#F0F1F7',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaGridImage: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    height: 120,
    backgroundColor: '#ECEEFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaText: {
    color: '#5B5FEF',
    fontWeight: '800',
  },

  videoTile: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECEEFF',
    overflow: 'hidden',
  },
  videoThumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  videoIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },

  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  difficultyPill: {
    backgroundColor: '#F6F7FB',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  difficultyText: {
    color: '#5E6278',
    fontSize: 12,
    fontWeight: '800',
  },

  mediaModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 52,
    right: 24,
    zIndex: 2,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
  },
  imageModal: {
    width: '100%',
    height: '80%',
  },
  videoModal: {
    width: '100%',
    height: '70%',
  },

  pressed: {
    opacity: 0.75,
  },
});