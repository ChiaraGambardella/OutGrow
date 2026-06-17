import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import Card from '../../../components/Card';
import Header from '../../../components/Header';
import Screen from '../../../components/Screen';
import { FeedPost, getGlobalFeedApi } from '../../../lib/feed';

function getMediaUrl(mediaPath?: string | null) {
  if (!mediaPath) return null;

  if (mediaPath.startsWith('http')) {
    return mediaPath;
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) return null;

  return `${baseUrl.replace(/\/$/, '')}/${mediaPath.replace(/^\//, '')}`;
}

function formatDifficulty(value?: string | null) {
  if (value === 'facile') return 'Bassa';
  if (value === 'medio') return 'Media';
  if (value === 'difficile') return 'Alta';
  return 'Non indicata';
}

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getGlobalFeedApi();
      setPosts(data);
    } catch (feedError) {
      setError(
        feedError instanceof Error
          ? feedError.message
          : 'Impossibile caricare il feed.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <Screen>
      <Header
        title="OutGrow"
        showMenu
        onMenuPress={() => router.push('/settings')}
      />

      <Pressable
        style={({ pressed }) => pressed && styles.pressed}
        onPress={() => router.push('/challenge')}
      >
        <Card style={styles.banner}>
          <Text style={styles.bannerTitle}>Completa la sfida settimanale!</Text>
          <Text style={styles.bannerText}>
            Racconta la tua esperienza e condividila con la community.
          </Text>
        </Card>
      </Pressable>

      {loading ? (
        <Card>
          <Text style={styles.messageText}>Caricamento feed...</Text>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={loadFeed}>
            <Text style={styles.retryButtonText}>Riprova</Text>
          </Pressable>
        </Card>
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <Card>
          <Text style={styles.messageText}>
            Ancora nessun post. Completa la prima sfida e comparirà qui.
          </Text>
        </Card>
      ) : null}

      {!loading && !error
        ? posts.map((post) => <PostCard key={post.id} post={post} />)
        : null}
    </Screen>
  );
}

type PostCardProps = {
  post: FeedPost;
};

type SelectedMedia = {
  url: string;
  tipo: 'Immagine' | 'Video';
};

function PostCard({ post }: PostCardProps) {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);

  return (
    <Card>
      <Text style={styles.username}>@{post.autore.username}</Text>
      <Text style={styles.postTitle}>{post.titoloSfida}</Text>

      {post.media.length > 0 ? (
        <View style={styles.mediaGrid}>
          {post.media.map((mediaItem) => {
            const mediaUrl = getMediaUrl(mediaItem.url);

            if (!mediaUrl) return null;

            if (mediaItem.tipo === 'Immagine') {
              return (
                <Pressable
                  key={mediaItem.id}
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
                key={mediaItem.id}
                style={styles.mediaGridItem}
                onPress={() =>
                  setSelectedMedia({
                    url: mediaUrl,
                    tipo: 'Video',
                  })
                }
              >
                <View style={styles.videoTile}>
                  <Text style={styles.videoIcon}>▶</Text>
                  <Text style={styles.mediaText}>Video</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.mediaBox}>
          <Text style={styles.mediaText}>Foto / video esperienza</Text>
        </View>
      )}

      {post.luogo ? (
        <Text style={styles.location}>📍 {post.luogo}</Text>
      ) : null}

      {post.descrizione ? (
        <Text style={styles.description}>{post.descrizione}</Text>
      ) : null}

      <View style={styles.difficultyRow}>
        <Text style={styles.difficulty}>
          Aspettata: {formatDifficulty(post.difficoltaAttesa)}
        </Text>
        <Text style={styles.difficulty}>
          Percepita: {formatDifficulty(post.difficoltaPercepita)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.action}>
          {post.interazioni.messoDaMe ? 'Ti piace' : 'Like'} ·{' '}
          {post.interazioni.totaleLike}
        </Text>
        <Text style={styles.action}>
          Commenta · {post.interazioni.totaleCommenti}
        </Text>
        <Text style={styles.action}>Segnala</Text>
      </View>

      <Modal
        visible={!!selectedMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View style={styles.imageModalBackdrop}>
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

function VideoModalPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'idle') {
        player.currentTime = 0;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

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

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ECEEFF',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17172F',
    marginBottom: 6,
  },
  bannerText: {
    color: '#5E6278',
    lineHeight: 20,
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
  retryButton: {
    backgroundColor: '#ECEEFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#5B5FEF',
    fontWeight: '800',
  },
  username: {
    color: '#5B5FEF',
    fontWeight: '800',
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17172F',
    marginBottom: 12,
  },
  mediaGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 12,
},
videoTile: {
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#ECEEFF',
},
videoIcon: {
  color: '#5B5FEF',
  fontSize: 30,
  fontWeight: '900',
  marginBottom: 6,
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
videoModal: {
  width: '100%',
  height: '70%',
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
imageModalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
imageModal: {
  width: '100%',
  height: '80%',
},
  mediaBox: {
    height: 150,
    backgroundColor: '#F0F1F7',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaText: {
    color: '#7A7F9A',
    fontWeight: '700',
  },
  location: {
    fontSize: 14,
    color: '#5E6278',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#33364D',
    lineHeight: 21,
    marginBottom: 12,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  difficulty: {
    backgroundColor: '#F6F7FB',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    color: '#5E6278',
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F6',
    paddingTop: 12,
  },
  action: {
    color: '#5B5FEF',
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});