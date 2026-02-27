import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { View, Text, Pressable, Modal, StyleSheet } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Linking } from "@/components/primitives";

export function AppHeader() {
  const { theme } = useTheme();
  const { getFullName, logout } = useAuth();
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const fullName = getFullName();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, borderBottomColor: theme.separator }]}>
      <Text style={[styles.logo, { color: theme.text }]}>ABC</Text>
      <Pressable onPress={() => setMenuVisible(true)} style={styles.menuButton}>
        <Feather name="menu" size={22} color={theme.text} />
      </Pressable>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { backgroundColor: theme.backgroundDefault }]}>
            {/* User info */}
            <View style={[styles.userSection, { borderBottomColor: theme.separator }]}>
              <View style={[styles.userAvatar, { backgroundColor: theme.link }]}>
                <Feather name="user" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.userName, { color: theme.text }]}>{fullName}</Text>
            </View>

            {/* Menu items */}
            <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); navigate("/profile"); }}>
              <Feather name="user" size={18} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>Профиль</Text>
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: theme.separator }]} />

            <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); Linking.openURL("https://altaybusinesscamp.ru/"); }}>
              <Feather name="external-link" size={18} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>Сайт мероприятия</Text>
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: theme.separator }]} />

            <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); Linking.openURL("http://t.me/iamserdyuk"); }}>
              <Feather name="info" size={18} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>О приложении</Text>
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: theme.separator }]} />

            <Pressable style={styles.menuItem} onPress={async () => { setMenuVisible(false); await logout(); }}>
              <Feather name="log-out" size={18} color={theme.conflict} />
              <Text style={[styles.menuText, { color: theme.conflict }]}>Выйти</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderBottomWidth: 1, paddingTop: 16 },
  logo: { fontSize: 20, fontWeight: "700", letterSpacing: 2 },
  menuButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: BorderRadius.xs },
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  menuContainer: { position: "absolute", top: 52, right: Spacing.lg, width: 240, borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
  userSection: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, flexDirection: "row", alignItems: "center", gap: Spacing.md, borderBottomWidth: 1 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 16, fontWeight: "600", flex: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  menuText: { fontSize: 15 },
  menuDivider: { height: 1, marginLeft: 52 },
});
