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
  if (value === 'facile') return 'facile';
  if (value === 'medio') return 'media';
  if (value === 'difficile') return 'difficile';
  return 'non indicata';
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

function PostCard({ post }: PostCardProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

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
                  onPress={() => setSelectedImageUrl(mediaUrl)}
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
              <View key={mediaItem.id} style={styles.mediaGridItem}>
                <Text style={styles.mediaText}>Video</Text>
              </View>
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
        visible={!!selectedImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImageUrl(null)}
      >
        <Pressable
          style={styles.imageModalBackdrop}
          onPress={() => setSelectedImageUrl(null)}
        >
          {selectedImageUrl ? (
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.imageModal}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </Card>
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
  postImage: {
    height: 180,
    width: '100%',
    borderRadius: 18,
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