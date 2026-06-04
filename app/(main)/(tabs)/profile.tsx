import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import Card from '../../../components/Card';
import Header from '../../../components/Header';
import Screen from '../../../components/Screen';

const user = {
  name: 'Chiara Gambardella',
  username: 'chiara_01',
  initials: 'CG',
};

const badges = [
  {
    icon: '🔥',
    title: 'Coraggio',
  },
  {
    icon: '🤝',
    title: 'Social',
  },
  {
    icon: '🌱',
    title: 'Costanza',
  },
  {
    icon: '🎯',
    title: 'Focus',
  },
];

const posts = [
  {
    id: '1',
    title: 'Ho parlato con una nuova compagna',
    location: 'Università',
    description:
      'All’inizio ero un po’ in ansia, ma poi la conversazione è andata meglio del previsto.',
    expectedDifficulty: 'Media',
    perceivedDifficulty: 'Facile',
  },
  {
    id: '2',
    title: 'Passeggiata senza telefono',
    location: 'Centro città',
    description:
      'Mi sono concentrata di più su quello che avevo intorno e mi sono sentita più presente.',
    expectedDifficulty: 'Facile',
    perceivedDifficulty: 'Media',
  },
];

export default function Profile() {
  return (
    <Screen>
      <Header
        title="OutGrow"
        showMenu
        onSettingsPress={() => router.push('/settings')}
      />

      <Card style={styles.profileCard}>
        <View style={styles.cover}>
          <View style={styles.coverCircleLarge} />
          <View style={styles.coverCircleSmall} />
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.photoButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              Alert.alert(
                'Modifica foto',
                'Qui potrai collegare fotocamera o galleria.'
              )
            }
          >
            <Text style={styles.photoButtonText}>Modifica foto</Text>
          </Pressable>
        </View>
      </Card>

      <Pressable
        style={({ pressed }) => [
          styles.progressButton,
          pressed && styles.pressed,
        ]}
        onPress={() =>
          Alert.alert(
            'Progressi',
            'Qui potrai aprire la schermata dei progressi.'
          )
        }
      >
        <Text style={styles.progressTitle}>Progressi</Text>
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
                'Qui aprirai la schermata con tutti i badge.'
              )
            }
          >
            <Text style={styles.linkSmall}>Vedi tutti</Text>
          </Pressable>
        </View>

        <View style={styles.badgeRow}>
          {badges.map((badge) => (
            <Badge key={badge.title} icon={badge.icon} title={badge.title} />
          ))}
        </View>
      </Card>

      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>Post pubblicati</Text>
        <Text style={styles.postCounter}>{posts.length}</Text>
      </View>

      {posts.map((post) => (
        <PostPreview
          key={post.id}
          title={post.title}
          location={post.location}
          description={post.description}
          expectedDifficulty={post.expectedDifficulty}
          perceivedDifficulty={post.perceivedDifficulty}
        />
      ))}
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
  location: string;
  description: string;
  expectedDifficulty: string;
  perceivedDifficulty: string;
};

function PostPreview({
  title,
  location,
  description,
  expectedDifficulty,
  perceivedDifficulty,
}: PostPreviewProps) {
  return (
    <Card>
      <Text style={styles.postTitle}>{title}</Text>
      <Text style={styles.postLocation}>📍 {location}</Text>

      <View style={styles.mediaPlaceholder}>
        <Text style={styles.mediaText}>Foto / video esperienza</Text>
      </View>

      <Text style={styles.postDescription}>{description}</Text>

      <View style={styles.difficultyRow}>
        <DifficultyPill label={`Aspettata: ${expectedDifficulty}`} />
        <DifficultyPill label={`Percepita: ${perceivedDifficulty}`} />
      </View>
    </Card>
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
  profileCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cover: {
    height: 112,
    backgroundColor: '#ECEEFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    position: 'relative',
    overflow: 'hidden',
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
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -42,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#17172F',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#5B5FEF',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#17172F',
    textAlign: 'center',
  },
  username: {
    color: '#7A7F9A',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  photoButton: {
    minHeight: 38,
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F3F4FF',
  },
  photoButtonText: {
    color: '#5B5FEF',
    fontWeight: '800',
    fontSize: 12,
  },
  progressButton: {
    minHeight: 52,
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
  postCounter: {
    color: '#5B5FEF',
    fontWeight: '900',
    backgroundColor: '#ECEEFF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
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
  postDescription: {
    fontSize: 14,
    color: '#33364D',
    lineHeight: 20,
    marginBottom: 12,
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
  pressed: {
    opacity: 0.75,
  },
});