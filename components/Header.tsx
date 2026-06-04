import { Pressable, StyleSheet, Text, View } from 'react-native';

type HeaderProps = {
  title: string;

  showSettings?: boolean;
  onSettingsPress?: () => void;

  showMenu?: boolean;
  onMenuPress?: () => void;
};

export default function Header({
  title,
  showSettings = false,
  onSettingsPress,
  showMenu = false,
  onMenuPress,
}: HeaderProps) {
  const shouldShowMenu = showMenu || showSettings;
  const handleMenuPress = onMenuPress || onSettingsPress;

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logo} />
        <Text style={styles.title}>{title}</Text>
      </View>

      {shouldShowMenu && (
        <Pressable
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.pressed,
          ]}
          onPress={handleMenuPress}
          hitSlop={8}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
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
    flex: 1,
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
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  menuLine: {
    width: 24,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#5B5FEF',
  },
  pressed: {
    opacity: 0.75,
  },
});