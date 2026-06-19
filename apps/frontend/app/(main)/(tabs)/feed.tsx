import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import Card from '../../../components/Card';
import Header from '../../../components/Header';
import Screen from '../../../components/Screen';
import { 
  FeedPost, 
  CommentoPost, 
  RispostaCommento,
  getGlobalFeedApi, 
  togglePostLikeApi, 
  addCommentToPostApi,
  addReplyToCommentApi 
} from '../../../lib/feed';

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
  if (value === 'media' || value === 'medio') return 'Media';
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

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed])
  );

  async function handleToggleLike(postId: number) {
    const previousPosts = posts;

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const alreadyLiked = post.interazioni.messoDaMe;

        return {
          ...post,
          interazioni: {
            ...post.interazioni,
            messoDaMe: !alreadyLiked,
            totaleLike: alreadyLiked
              ? Math.max(0, post.interazioni.totaleLike - 1)
              : post.interazioni.totaleLike + 1,
          },
        };
      })
    );

    try {
      const result = await togglePostLikeApi(postId);

      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          return {
            ...post,
            interazioni: {
              ...post.interazioni,
              messoDaMe: result.liked,
            },
          };
        })
      );
    } catch (error) {
      setPosts(previousPosts);

      Alert.alert(
        'Errore',
        error instanceof Error
          ? error.message
          : 'Impossibile aggiornare il like.'
      );
    }
  }

  async function handleAddComment(postId: number, text: string, commentoPadreId?: number) {
    try {
      if (commentoPadreId) {
        // Se c'è un commentoPadreId, salviamo una risposta di secondo livello
        const replyData = await addReplyToCommentApi(commentoPadreId, text);

        setPosts((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id !== postId) return post;

            return {
              ...post,
              interazioni: {
                ...post.interazioni,
                totaleCommenti: post.interazioni.totaleCommenti + 1,
              },
              commenti: (post.commenti || []).map((commento) => {
                if (commento.id !== commentoPadreId) return commento;

                const nuovaRisposta: RispostaCommento = {
                  id: replyData.id,
                  testo: replyData.testo,
                  commentoPadreId: commentoPadreId,
                  autore: {
                    id: replyData.utenteId,
                    username: 'Tu',
                    foto: null
                  },
                  totaleLike: 0,
                  messoDaMe: false
                };

                return {
                  ...commento,
                  totaleRisposte: commento.totaleRisposte + 1,
                  risposte: [...(commento.risposte || []), nuovaRisposta]
                };
              })
            };
          })
        );
      } else {
        // Altrimenti è un normale commento principale legato al Post
        const commentData = await addCommentToPostApi(postId, text);

        setPosts((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id !== postId) return post;

            const nuovoCommento: CommentoPost = {
              id: commentData.id,
              testo: commentData.testo,
              autore: {
                id: commentData.utenteId,
                username: 'Tu', 
                foto: null
              },
              totaleLike: 0,
              messoDaMe: false,
              totaleRisposte: 0,
              risposte: []
            };

            return {
              ...post,
              interazioni: {
                ...post.interazioni,
                totaleCommenti: post.interazioni.totaleCommenti + 1,
              },
              commenti: [nuovoCommento, ...(post.commenti || [])]
            };
          })
        );
      }
    } catch (commentError) {
      Alert.alert(
        'Errore',
        commentError instanceof Error
          ? commentError.message
          : 'Impossibile inviare il commento.'
      );
      throw commentError; 
    }
  }

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
        ? posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
            />
          ))
        : null}
    </Screen>
  );
}

type PostCardProps = {
  post: FeedPost;
  onToggleLike: (postId: number) => void;
  onAddComment: (postId: number, text: string, commentoPadreId?: number) => Promise<void>;
};

type SelectedMedia = {
  url: string;
  tipo: 'Immagine' | 'Video';
};

function PostCard({ post, onToggleLike, onAddComment }: PostCardProps) {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  // 1. Nuovo stato per gestire la visibilità dei commenti di questo specifico post
  const [showComments, setShowComments] = useState(false); 
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Traccia se stiamo rispondendo a un commento specifico
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null);

  const authorAvatarUrl = getMediaUrl(post.autore.foto);

  async function handleSendComment() {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      // Passiamo il replyTo.id se attivo, configurando automaticamente il commento padre
      await onAddComment(post.id, commentText.trim(), replyTo?.id);
      setCommentText('');
      setReplyTo(null);
      setShowCommentInput(false); 
      // Manteniamo i commenti visibili dopo l'invio così l'utente vede il suo nuovo commento
      setShowComments(true); 
    } catch (e) {
      // Gestito dal componente padre
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <View style={styles.authorRow}>
        <View style={styles.authorAvatar}>
          {authorAvatarUrl ? (
            <Image
              source={{ uri: authorAvatarUrl }}
              style={styles.authorAvatarImage}
            />
          ) : (
            <Text style={styles.authorAvatarText}>
              {post.autore.username?.[0]?.toUpperCase() ?? 'U'}
            </Text>
          )}
        </View>

        <Text style={styles.username}>@{post.autore.username}</Text>
      </View>
      
      <Text style={styles.postTitle}>{post.titoloSfida}</Text>

      {post.descrizione ? (
        <Text style={styles.description}>{post.descrizione}</Text>
      ) : null}

      {post.luogo ? (
        <Text style={styles.location}>📍 {post.luogo}</Text>
      ) : null}

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
                <VideoThumbnail uri={mediaUrl} />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {post.difficoltaAttesa || post.difficoltaPercepita ? (
        <View style={styles.difficultyRow}>
          {post.difficoltaAttesa ? (
            <Text style={styles.difficulty}>
              Aspettata: {formatDifficulty(post.difficoltaAttesa)}
            </Text>
          ) : null}

          {post.difficoltaPercepita ? (
            <Text style={styles.difficulty}>
              Percepita: {formatDifficulty(post.difficoltaPercepita)}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.likeButton,
            pressed && styles.pressed,
          ]}
          onPress={() => onToggleLike(post.id)}
        >
          <Text
            style={[
              styles.likeIcon,
              post.interazioni.messoDaMe && styles.likeIconActive,
            ]}
          >
            {post.interazioni.messoDaMe ? '♥' : '♡'}
          </Text>

          <Text
            style={[
              styles.action,
              post.interazioni.messoDaMe && styles.actionActive,
            ]}
          >
            {post.interazioni.totaleLike}
          </Text>
        </Pressable>

        {/* 2. Modificato il comportamento al click: inverte sia l'input che la lista commenti */}
        <Pressable 
          style={({ pressed }) => pressed && styles.pressed}
          onPress={() => {
            setReplyTo(null);
            const targetsState = !showCommentInput;
            setShowCommentInput(targetsState);
            setShowComments(targetsState);
          }}
        >
          <Text style={styles.action}>
            Commenta · {post.interazioni.totaleCommenti}
          </Text>
        </Pressable>
        
        <Text style={[styles.action, { opacity: 0 }]}>Segnala</Text>
      </View>
      
      {/* INPUT PER NUOVO COMMENTO PRINCIPALE */}
      {showCommentInput && !replyTo && (
        <View style={styles.commentInputWrapper}>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Scrivi un commento..."
              placeholderTextColor="#7A7F9A"
              value={commentText}
              onChangeText={setCommentText}
              editable={!submitting}
              multiline
            />
            <Pressable
              style={[
                styles.sendCommentButton,
                (!commentText.trim() || submitting) && styles.disabledButton
              ]}
              disabled={!commentText.trim() || submitting}
              onPress={handleSendComment}
            >
              <Text style={styles.sendCommentText}>
                {submitting ? '...' : 'Invia'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* 3. Albero dei Commenti condizionato dallo stato showComments */}
      {showComments && post.commenti && post.commenti.length > 0 && (
        <View style={styles.commentsSection}>
          {post.commenti.map((commento) => (
            <View key={commento.id} style={styles.commentContainer}>
              {/* Commento Principale */}
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthorAvatar}>
                  {commento.autore.foto ? (
                    <Image
                      source={{ uri: getMediaUrl(commento.autore.foto) ?? undefined }}
                      style={styles.commentAvatarImage}
                    />
                  ) : (
                    <Text style={styles.commentAvatarText}>
                      {commento.autore.username?.[0]?.toUpperCase() ?? 'U'}
                    </Text>
                  )}
                </View>
                <View style={styles.commentContentContainer}>
                  <Text style={styles.commentUsername}>@{commento.autore.username}</Text>
                  <Text style={styles.commentText}>{commento.testo}</Text>
                  
                  <Pressable 
                    style={({ pressed }) => [styles.replyActionButton, pressed && styles.pressed]}
                    onPress={() => {
                      setReplyTo({ id: commento.id, username: commento.autore.username });
                      setShowCommentInput(true);
                    }}
                  >
                    <Text style={styles.replyActionText}>Rispondi</Text>
                  </Pressable>
                </View>
              </View>

              {/* INPUT PER RISPOSTA DI SECONDO LIVELLO */}
              {showCommentInput && replyTo?.id === commento.id && (
                <View style={[styles.commentInputWrapper, { paddingLeft: 34, borderTopWidth: 0, paddingTop: 8 }]}>
                  <View style={styles.replyToHeader}>
                    <Text style={styles.replyToText}>Stai rispondendo a @{replyTo.username}</Text>
                    <Pressable onPress={() => { setReplyTo(null); setShowCommentInput(false); }}>
                      <Text style={styles.cancelReplyText}>Annulla</Text>
                    </Pressable>
                  </View>
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Scrivi una risposta..."
                      placeholderTextColor="#7A7F9A"
                      value={commentText}
                      onChangeText={setCommentText}
                      editable={!submitting}
                      multiline
                    />
                    <Pressable
                      style={[
                        styles.sendCommentButton,
                        (!commentText.trim() || submitting) && styles.disabledButton
                      ]}
                      disabled={!commentText.trim() || submitting}
                      onPress={handleSendComment}
                    >
                      <Text style={styles.sendCommentText}>
                        {submitting ? '...' : 'Invia'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Risposte di Secondo Livello (Annidate) */}
              {commento.risposte && commento.risposte.length > 0 && (
                <View style={styles.repliesContainer}>
                  {commento.risposte.map((risposta) => (
                    <View key={risposta.id} style={styles.replyItem}>
                      <View style={styles.commentAuthorAvatar}>
                        {risposta.autore.foto ? (
                          <Image
                            source={{ uri: getMediaUrl(risposta.autore.foto) ?? undefined }}
                            style={styles.commentAvatarImage}
                          />
                        ) : (
                          <Text style={styles.commentAvatarText}>
                            {risposta.autore.username?.[0]?.toUpperCase() ?? 'U'}
                          </Text>
                        )}
                      </View>
                      <View style={styles.commentContentContainer}>
                        <Text style={styles.commentUsername}>@{risposta.autore.username}</Text>
                        <Text style={styles.commentText}>{risposta.testo}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Modal Media */}
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
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  username: {
    color: '#5B5FEF',
    fontWeight: '800',
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
    overflow: 'hidden',
  },
  videoThumbnail: {
    ...StyleSheet.absoluteFillObject,
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
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeIcon: {
    color: '#5B5FEF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: -1,
  },
  likeIconActive: {
    color: '#5B5FEF',
  },
  actionActive: {
    color: '#5B5FEF',
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
    alignItems: 'center',
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ECEEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  authorAvatarImage: {
    width: '100%',
    height: '100%',
  },
  authorAvatarText: {
    color: '#5B5FEF',
    fontSize: 13,
    fontWeight: '900',
  },
  commentInputWrapper: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F6',
    paddingTop: 12,
  },
  replyToHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  replyToText: {
    fontSize: 13,
    color: '#5B5FEF',
    fontWeight: '700',
  },
  cancelReplyText: {
    fontSize: 13,
    color: '#D64545',
    fontWeight: '800',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#33364D',
    fontSize: 14,
    maxHeight: 80,
  },
  sendCommentButton: {
    backgroundColor: '#5B5FEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ECEEFF',
    opacity: 0.6,
  },
  sendCommentText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  /* Nuovi stili per la sezione albero dei commenti */
  commentsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F6',
    paddingTop: 12,
  },
  commentContainer: {
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAuthorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECEEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
    marginTop: 2,
  },
  commentAvatarImage: {
    width: '100%',
    height: '100%',
  },
  commentAvatarText: {
    color: '#5B5FEF',
    fontSize: 11,
    fontWeight: '900',
  },
  commentContentContainer: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentUsername: {
    color: '#5B5FEF',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    color: '#33364D',
    fontSize: 13,
    lineHeight: 18,
  },
  replyActionButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  replyActionText: {
    color: '#7A7F9A',
    fontSize: 11,
    fontWeight: '700',
  },
  repliesContainer: {
    paddingLeft: 34,
    marginTop: 8,
    gap: 8,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});