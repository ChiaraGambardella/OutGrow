import { StyleSheet, Text, View } from 'react-native';

import Card from '../../../components/Card';
import Header from '../../../components/Header';
import Screen from '../../../components/Screen';

export default function Feed() {
  return (
    <Screen>
      <Header title="OutGrow" />

      <Card style={styles.banner}>
        <Text style={styles.bannerTitle}>Completa la sfida settimanale!</Text>
        <Text style={styles.bannerText}>
          Racconta la tua esperienza e condividila con la community.
        </Text>
      </Card>

      <PostCard
        username="chiara_01"
        title="Ho parlato con una nuova compagna"
        location="Università"
        description="All’inizio ero un po’ in ansia, ma poi la conversazione è andata meglio del previsto."
      />

      <PostCard
        username="marco.g"
        title="Prima sfida completata"
        location="Parco cittadino"
        description="Mi sono messo alla prova e ho scoperto che era meno difficile di quanto pensassi."
      />
    </Screen>
  );
}

type PostCardProps = {
  username: string;
  title: string;
  location: string;
  description: string;
};

function PostCard({ username, title, location, description }: PostCardProps) {
  return (
    <Card>
      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.postTitle}>{title}</Text>

      <View style={styles.mediaBox}>
        <Text style={styles.mediaText}>Foto / video esperienza</Text>
      </View>

      <Text style={styles.location}>📍 {location}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.difficultyRow}>
        <Text style={styles.difficulty}>Aspettata: media</Text>
        <Text style={styles.difficulty}>Percepita: facile</Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.action}>Like</Text>
        <Text style={styles.action}>Commenta</Text>
        <Text style={styles.action}>Segnala</Text>
      </View>
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
});