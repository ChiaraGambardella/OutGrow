import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Screen from '../../components/Screen';
import { TERMS_OF_SERVICE_TEXT } from '../../lib/legalTexts';

export default function TermsOfService() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Indietro</Text>
          </Pressable>

          <Text style={styles.title}>Termini di Servizio</Text>
        </View>

        <LegalText text={TERMS_OF_SERVICE_TEXT} />
      </ScrollView>
    </Screen>
  );
}

function LegalText({ text }: { text: string }) {
  return (
    <View>
      {text.split('\n').map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return <View key={index} style={styles.emptyLine} />;
        }

        const isTitle =
          index === 0 ||
          /^\d+\./.test(trimmedLine) ||
          trimmedLine === 'Ultimo aggiornamento: 08/06/2026';

        return (
          <Text
            key={index}
            style={isTitle ? styles.sectionTitle : styles.paragraph}
          >
            {trimmedLine}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 18,
    marginBottom: 18,
  },
  backText: {
    color: '#5B5FEF',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#17172F',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#17172F',
    marginTop: 14,
    marginBottom: 6,
    lineHeight: 24,
  },
  paragraph: {
    color: '#33364D',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  emptyLine: {
    height: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});