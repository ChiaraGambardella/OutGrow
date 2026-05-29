import { Pressable, StyleSheet, Text, View } from 'react-native';

type HeaderProps = {
  title: string;
  showSettings?: boolean;
  onSettingsPress?: () => void;
};

export default function Header({
  title,
  showSettings = false,
  onSettingsPress,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logo} />
        <Text style={styles.title}>{title}</Text>
      </View>

      {showSettings && (
        <Pressable style={styles.settingsButton} onPress={onSettingsPress}>
          <Text style={styles.settingsText}>⚙️</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ECEEFF',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#17172F',
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 20,
  },
});