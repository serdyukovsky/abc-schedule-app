import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

interface AppHeaderProps {
  onProfilePress?: () => void;
}

export function AppHeader({ onProfilePress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { getFullName, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fullName = getFullName();

  const handleProfileMenu = () => {
    setMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const handleOpenProfile = () => {
    setMenuVisible(false);
    const onOpenProfile = () => {
      if (onProfilePress) {
        onProfilePress();
        return;
      }
      navigation.navigate("Profile");
    };

    onOpenProfile();
  };

  const handleAbout = () => {
    setMenuVisible(false);
    Alert.alert(
      "О приложении",
      "ABC — Altai Business Camp\nРазработчик: @iamserdyuk",
      [
        {
          text: "Открыть Telegram",
          onPress: () => Linking.openURL("http://t.me/iamserdyuk"),
        },
        { text: "Закрыть", style: "cancel" },
      ],
    );
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.logo, { color: theme.text }]}>ABC</ThemedText>
      <Pressable
        onPress={handleProfileMenu}
        style={styles.nameContainer}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="user" size={16} color={theme.textSecondary} />
        <ThemedText
          style={[styles.name, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {fullName}
        </ThemedText>
      </Pressable>
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.menuOverlay} onPress={handleCloseMenu}>
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.separator,
                top: insets.top + 44,
              },
            ]}
          >
            <Pressable style={styles.menuItem} onPress={handleOpenProfile}>
              <View style={styles.menuItemRow}>
                <Feather name="user" size={18} color={theme.text} />
                <ThemedText style={[styles.menuText, { color: theme.text }]}>
                  Профиль
                </ThemedText>
              </View>
            </Pressable>
            <View style={[styles.menuDivider, { backgroundColor: theme.separator }]} />
            <Pressable style={styles.menuItem} onPress={handleAbout}>
              <View style={styles.menuItemRow}>
                <Feather name="info" size={18} color={theme.text} />
                <ThemedText style={[styles.menuText, { color: theme.text }]}>
                  О приложении
                </ThemedText>
              </View>
            </Pressable>
            <View style={[styles.menuDivider, { backgroundColor: theme.separator }]} />
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemRow}>
                <Feather name="log-out" size={18} color={theme.conflict} />
                <ThemedText style={[styles.menuText, { color: theme.conflict }]}>
                  Выйти
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: Spacing.md,
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
  },
  nameContainer: {
    maxWidth: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuOverlay: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
    right: Spacing.md,
    minWidth: 220,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
  },
});
