import React from "react";
import { useNavigate } from "react-router-dom";
import { View, Text, Pressable, Modal, StyleSheet, useSafeAreaInsets } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing } from "@/constants/theme";
import { Linking } from "@/components/primitives";

interface AppMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function AppMenu({ visible, onClose }: AppMenuProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { getFullName, logout } = useAuth();
  const navigate = useNavigate();
  const fullName = getFullName();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { paddingBottom: 80 + insets.bottom }]} onPress={onClose}>
        <View style={[styles.menu, { backgroundColor: theme.backgroundDefault }]}>
          {/* User info */}
          <View style={[styles.userSection, { borderBottomColor: theme.separator }]}>
            <View style={[styles.userAvatar, { backgroundColor: theme.link }]}>
              <Feather name="user" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.userName, { color: theme.text }]}>{fullName}</Text>
          </View>

          <Pressable style={styles.menuItem} onPress={() => { onClose(); navigate("/profile"); }}>
            <Feather name="user" size={18} color={theme.textSecondary} />
            <Text style={[styles.menuText, { color: theme.text }]}>Профиль</Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <Pressable style={styles.menuItem} onPress={() => { toggleTheme(); }}>
            <Feather name={isDark ? "sun" : "moon"} size={18} color={theme.textSecondary} />
            <Text style={[styles.menuText, { color: theme.text }]}>{isDark ? "Светлая тема" : "Тёмная тема"}</Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <Pressable style={styles.menuItem} onPress={() => { onClose(); Linking.openURL("https://altaybusinesscamp.ru/"); }}>
            <Feather name="external-link" size={18} color={theme.textSecondary} />
            <Text style={[styles.menuText, { color: theme.text }]}>Сайт мероприятия</Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <Pressable style={styles.menuItem} onPress={() => { onClose(); Linking.openURL("http://t.me/iamserdyuk"); }}>
            <Feather name="info" size={18} color={theme.textSecondary} />
            <Text style={[styles.menuText, { color: theme.text }]}>О приложении</Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <Pressable style={styles.menuItem} onPress={async () => { onClose(); await logout(); }}>
            <Feather name="log-out" size={18} color={theme.conflict} />
            <Text style={[styles.menuText, { color: theme.conflict }]}>Выйти</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end", alignItems: "flex-end", paddingRight: Spacing.lg },
  menu: { width: 260, borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.18)" },
  userSection: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, flexDirection: "row", alignItems: "center", gap: Spacing.md, borderBottomWidth: 1 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 16, fontWeight: "600", flex: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  menuText: { fontSize: 15 },
  divider: { height: 1, marginLeft: 52 },
});
