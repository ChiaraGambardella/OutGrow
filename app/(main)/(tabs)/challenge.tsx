import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import AppButton from '../../../components/AppButton';
import Card from '../../../components/Card';
import Header from '../../../components/Header';
import Screen from '../../../components/Screen';

export default function Challenge() {
  return (
    <Screen>
      <Header title="OutGrow" />

      <Text style={styles.sectionLabel}>QUESTA SETTIMANA</Text>

      <Card>
        <Text style={styles.title}>Titolo sfida</Text>

        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>Foto sfida</Text>
        </View>

        <Text style={styles.description}>
          Descrizione della sfida settimanale...
        </Text>

        <AppButton
          title="Completa la sfida"
          onPress={() => router.push('/complete-challenge')}
        />
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
  imageText: {
    color: '#5B5FEF',
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5E6278',
  },
});