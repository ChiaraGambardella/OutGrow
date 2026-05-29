import { router } from "expo-router";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AppButton from "../../components/AppButton";
import Screen from "../../components/Screen";

export default function RegisterStep2() {
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
        <View style={styles.photoUploadContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>📷</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.photoLink}>Modifica foto</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#7A7F9A"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7A7F9A"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Ripeti password"
          placeholderTextColor="#7A7F9A"
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <AppButton
            title="Registrati"
            onPress={() => router.replace("/feed")}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 20,
    marginBottom: 24,
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
  photoUploadContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ECEEFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarIcon: {
    fontSize: 30,
  },
  photoLink: {
    color: "#5B5FEF",
    fontWeight: "800",
    fontSize: 14,
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
