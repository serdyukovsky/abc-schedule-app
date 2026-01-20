import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile, getFullName, logout, updateProfile, changePassword } = useAuth();
  const navigation = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [company, setCompany] = useState(profile?.company ?? "");
  const [title, setTitle] = useState(profile?.title ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fullName = useMemo(() => getFullName(), [getFullName, profile?.firstName, profile?.lastName]);

  const items = [
    { label: "Электронная почта", value: profile?.login ?? "—" },
    { label: "Телефон", value: profile?.phone ?? "—" },
  ];

  const handleSaveProfile = async () => {
    const success = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim(),
      title: title.trim(),
    });
    if (!success) {
      Alert.alert("Ошибка", "Не удалось сохранить профиль");
      return;
    }
    setIsEditing(false);
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают");
      return;
    }
    const success = await changePassword(currentPassword, newPassword);
    if (!success) {
      Alert.alert("Ошибка", "Старый пароль неверен");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Alert.alert("Готово", "Пароль обновлен");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="profile-back"
          >
            <Feather name="chevron-left" size={22} color={theme.text} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText style={[styles.name, { color: theme.text }]}>
              {fullName || "Профиль"}
            </ThemedText>
            {profile?.company ? (
              <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                {profile.company}
              </ThemedText>
            ) : null}
          </View>
        </View>

      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        {items.map((item, index) => (
          <View key={item.label}>
            <View style={styles.row}>
              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                {item.label}
              </ThemedText>
              <ThemedText style={[styles.value, { color: theme.text }]}>
                {item.value}
              </ThemedText>
            </View>
            {index < items.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: theme.separator }]} />
            ) : null}
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Данные профиля
          </ThemedText>
          <Pressable onPress={() => setIsEditing((prev) => !prev)} testID="profile-edit">
            <Feather
              name={isEditing ? "x" : "edit-2"}
              size={18}
              color={isEditing ? theme.textSecondary : theme.link}
            />
          </Pressable>
        </View>

        <View style={styles.formRow}>
          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Имя
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.separator,
                },
              ]}
              value={firstName}
              onChangeText={setFirstName}
              editable={isEditing}
              placeholder="Имя"
              placeholderTextColor={theme.textMuted}
            />
          </View>
          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Фамилия
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.separator,
                },
              ]}
              value={lastName}
              onChangeText={setLastName}
              editable={isEditing}
              placeholder="Фамилия"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Компания
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.separator,
              },
            ]}
            value={company}
            onChangeText={setCompany}
            editable={isEditing}
            placeholder="Компания"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Должность
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.separator,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            editable={isEditing}
            placeholder="Должность"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {isEditing ? (
          <Pressable
            onPress={handleSaveProfile}
            style={[styles.primaryButton, { backgroundColor: theme.link }]}
            testID="profile-save"
          >
            <ThemedText style={[styles.primaryButtonText, { color: theme.buttonText }]}>
              Сохранить
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Смена пароля
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Старый пароль
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.separator,
              },
            ]}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Введите старый пароль"
            placeholderTextColor={theme.textMuted}
          />
        </View>
        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Новый пароль
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.separator,
              },
            ]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Придумайте пароль"
            placeholderTextColor={theme.textMuted}
          />
        </View>
        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Повторите пароль
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.separator,
              },
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Повторите пароль"
            placeholderTextColor={theme.textMuted}
          />
        </View>
        <Pressable
          onPress={handleSavePassword}
          style={[styles.primaryButton, { backgroundColor: theme.link }]}
          testID="password-save"
        >
          <ThemedText style={[styles.primaryButtonText, { color: theme.buttonText }]}>
            Сохранить
          </ThemedText>
        </Pressable>
      </View>

        <Pressable
          onPress={logout}
          style={[styles.logoutButton, { backgroundColor: theme.backgroundSecondary }]}
          testID="profile-logout"
        >
          <Feather name="log-out" size={18} color={theme.conflict} />
          <ThemedText style={[styles.logoutText, { color: theme.conflict }]}>
            Выйти
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  row: {
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionAction: {
    fontSize: 15,
    fontWeight: "600",
  },
  formRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  field: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  primaryButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.full,
    height: Spacing.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
