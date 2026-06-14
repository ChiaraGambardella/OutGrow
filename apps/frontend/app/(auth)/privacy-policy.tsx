import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Screen from '../../components/Screen';

export default function PrivacyPolicy() {
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

          <Text style={styles.title}>Informativa sulla Privacy</Text>
          <Text style={styles.updated}>Ultimo aggiornamento: 08/06/2026</Text>
        </View>

        <Text style={styles.paragraph}>
          Benvenuto su Outgrow. La tua privacy e la sicurezza dei tuoi dati sono
          di fondamentale importanza per noi. Questa Informativa sulla Privacy
          descrive come raccogliamo, utilizziamo, conserviamo e proteggiamo le
          tue informazioni personali quando utilizzi la nostra applicazione.
        </Text>

        <Section title="1. Dati che raccogliamo">
          Per offrirti un'esperienza completa, raccogliamo dati forniti
          direttamente da te, contenuti generati dall'utente, dati di utilizzo e
          gamification, informazioni tecniche sul dispositivo e log di sistema.
        </Section>

        <Section title="2. Come utilizziamo i tuoi dati">
          I dati raccolti vengono usati per creare e gestire l'account,
          permettere il funzionamento dell'app, gestire post, like, commenti,
          badge, sicurezza della piattaforma e consenso degli utenti.
        </Section>

        <Section title="3. Base giuridica del trattamento">
          Trattiamo i tuoi dati sulla base del consenso esplicito rilasciato al
          momento della registrazione e per l'esecuzione dei termini di servizio.
        </Section>

        <Section title="4. Condivisione dei dati">
          Username, badge ottenuti, sfide completate e contenuti pubblicati
          saranno visibili agli altri utenti. Non vendiamo i tuoi dati personali
          a terze parti.
        </Section>

        <Section title="5. Conservazione e sicurezza dei dati">
          I tuoi dati personali e i media caricati sono conservati in server
          sicuri. Adottiamo misure tecniche e organizzative adeguate per
          proteggerli da accessi non autorizzati, perdita o distruzione.
        </Section>

        <Section title="6. I tuoi diritti">
          Puoi accedere ai tuoi dati, richiederne modifica o aggiornamento,
          chiedere la cancellazione dell'account e revocare il consenso in
          qualsiasi momento. Per esercitare questi diritti puoi contattarci a:
          sonic.96@hotmail.it.
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.paragraph}>{children}</Text>
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
    marginBottom: 6,
  },
  updated: {
    color: '#7A7F9A',
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#17172F',
    marginBottom: 6,
  },
  paragraph: {
    color: '#33364D',
    fontSize: 14,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.7,
  },
});
