import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Card from '../../../components/Card';
import Header from '../../../components/Header';
import Screen from '../../../components/Screen';

export default function Profile() {
  return (
    <Screen>
      <Header
        title="OutGrow"
        showSettings
        onSettingsPress={() => router.push('/settings')}
      />

      <Card>
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>C</Text>
          </View>

          <View>
            <Text style={styles.name}>Chiara G</Text>
            <Text style={styles.username}>@chiara_01</Text>
          </View>
        </View>
      </Card>


      <Card>
        <View style={styles.badgeHeader}>
          <Text style={styles.cardTitle}>Badge ottenuti</Text>
          <Text style={styles.link}>Vedi tutti</Text>
        </View>

        <View style={styles.badgeRow}>
          <Badge label="Coraggio" />
          <Badge label="Social" />
          <Badge label="Costanza" />
        </View>
      </Card>
    </Screen>
  );
}

type StatCardProps = {
  number: string;
  label: string;
};

function StatCard({ number, label }: StatCardProps) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeIcon}>★</Text>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECEEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#5B5FEF',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#17172F',
  },
  username: {
    color: '#7A7F9A',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5B5FEF',
  },
  statLabel: {
    fontSize: 12,
    color: '#7A7F9A',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17172F',
    marginBottom: 8,
  },
  bio: {
    color: '#5E6278',
    lineHeight: 21,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    color: '#5B5FEF',
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  badge: {
    backgroundColor: '#F6F7FB',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    minWidth: 86,
  },
  badgeIcon: {
    fontSize: 22,
    color: '#5B5FEF',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E6278',
  },
});