import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

import AppButton from "../../components/AppButton";
import Screen from "../../components/Screen";

export default function RegisterStep1() {
  return (
    <Screen>
      <View style={styles.headerContainer}>
        <Text style={styles.appTitle}>OutGrow</Text>
        <Text style={styles.subtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          nec erat nunc.
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#7A7F9A"
        />
        <TextInput
          style={styles.input}
          placeholder="Cognome"
          placeholderTextColor="#7A7F9A"
        />
        <TextInput
          style={styles.input}
          placeholder="Data di nascita (GG/MM/AAAA)"
          placeholderTextColor="#7A7F9A"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7A7F9A"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.buttonContainer}>
          <AppButton
            title="Avanti"
            onPress={() => router.push("/(auth)/register-step2")}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: "center",
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#5B5FEF",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#5E6278",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: {
    flex: 1,
  },
  input: {
    backgroundColor: "#F6F7FB",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: "#17172F",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF0F6",
  },
  buttonContainer: {
    marginTop: 10,
  },
});
