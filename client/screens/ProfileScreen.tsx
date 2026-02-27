import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { profile, getFullName, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [company, setCompany] = useState(profile?.company ?? "");
  const [title, setTitle] = useState(profile?.title ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fullName = useMemo(() => getFullName(), [getFullName, profile]);

  const handleSaveProfile = async () => {
    const success = await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), company: company.trim(), title: title.trim() });
    if (!success) { setProfileError("Не удалось сохранить профиль"); return; }
    setProfileError("");
    setIsEditing(false);
  };

  const handleSavePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError("Заполните все поля"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Пароли не совпадают"); return; }
    const success = await changePassword(currentPassword, newPassword);
    if (!success) { setPasswordError("Старый пароль неверен"); return; }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setPasswordSuccess(true);
  };

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.separator }];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.topBar, { borderBottomColor: theme.separator }]}>
        <Pressable onPress={() => navigate(-1 as any)} style={styles.backButton} testID="profile-back">
          <Feather name="chevron-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Профиль</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.name, { color: theme.text }]}>{fullName || "Профиль"}</Text>
            {profile?.company ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{profile.company}</Text> : null}
          </View>
        </View>

        {/* Read-only info */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          {[{ label: "Электронная почта", value: profile?.login ?? "—" }, { label: "Телефон", value: profile?.phone ?? "—" }].map((item, i, arr) => (
            <View key={item.label}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.value, { color: theme.text }]}>{item.value}</Text>
              </View>
              {i < arr.length - 1 ? <View style={[styles.divider, { backgroundColor: theme.separator }]} /> : null}
            </View>
          ))}
        </View>

        {/* Editable profile */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Данные профиля</Text>
            <Pressable onPress={() => setIsEditing((p) => !p)} testID="profile-edit">
              <Feather name={isEditing ? "x" : "edit-2"} size={18} color={isEditing ? theme.textSecondary : theme.link} />
            </Pressable>
          </View>
          {profileError ? <Text style={[styles.errorText, { color: theme.conflict }]}>{profileError}</Text> : null}
          <View style={styles.formRow}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Имя</Text>
              <TextInput style={inputStyle} value={firstName} onChangeText={setFirstName} editable={isEditing} placeholder="Имя" />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Фамилия</Text>
              <TextInput style={inputStyle} value={lastName} onChangeText={setLastName} editable={isEditing} placeholder="Фамилия" />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Компания</Text>
            <TextInput style={inputStyle} value={company} onChangeText={setCompany} editable={isEditing} placeholder="Компания" />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Должность</Text>
            <TextInput style={inputStyle} value={title} onChangeText={setTitle} editable={isEditing} placeholder="Должность" />
          </View>
          {isEditing ? (
            <Pressable onPress={handleSaveProfile} style={[styles.primaryButton, { backgroundColor: theme.link }]} testID="profile-save">
              <Text style={[styles.primaryButtonText, { color: theme.buttonText }]}>Сохранить</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Change password */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }, { marginBottom: Spacing.md }]}>Смена пароля</Text>
          {passwordError ? <Text style={[styles.errorText, { color: theme.conflict }]}>{passwordError}</Text> : null}
          {passwordSuccess ? <Text style={[styles.errorText, { color: theme.nowIndicator }]}>Пароль обновлён</Text> : null}
          {[
            { label: "Старый пароль", value: currentPassword, setter: setCurrentPassword, placeholder: "Введите старый пароль" },
            { label: "Новый пароль", value: newPassword, setter: setNewPassword, placeholder: "Придумайте пароль" },
            { label: "Повторите пароль", value: confirmPassword, setter: setConfirmPassword, placeholder: "Повторите пароль" },
          ].map(({ label, value, setter, placeholder }) => (
            <View key={label} style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
              <TextInput style={inputStyle} value={value} onChangeText={setter} secureTextEntry placeholder={placeholder} />
            </View>
          ))}
          <Pressable onPress={handleSavePassword} style={[styles.primaryButton, { backgroundColor: theme.link }]} testID="password-save">
            <Text style={[styles.primaryButtonText, { color: theme.buttonText }]}>Сохранить</Text>
          </Pressable>
        </View>

        <Pressable onPress={logout} style={[styles.logoutButton, { backgroundColor: theme.backgroundSecondary }]} testID="profile-logout">
          <Feather name="log-out" size={18} color={theme.conflict} />
          <Text style={[styles.logoutText, { color: theme.conflict }]}>Выйти</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, paddingTop: 16 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topBarTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600" },
  content: { paddingTop: Spacing.xl, gap: Spacing.lg, paddingHorizontal: Spacing.lg, paddingBottom: Spacing["3xl"] },
  header: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
  name: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  row: { paddingVertical: Spacing.sm },
  label: { fontSize: 13, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: "500" },
  divider: { height: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  formRow: { flexDirection: "row", gap: Spacing.md },
  field: { flex: 1, marginBottom: Spacing.md },
  input: { height: Spacing.inputHeight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, fontSize: 16, borderWidth: 1 },
  primaryButton: { height: Spacing.buttonHeight, borderRadius: BorderRadius.full, alignItems: "center", justifyContent: "center", marginTop: Spacing.sm },
  primaryButtonText: { fontSize: 16, fontWeight: "600" },
  errorText: { fontSize: 14, marginBottom: Spacing.sm },
  logoutButton: { marginTop: Spacing.xl, borderRadius: BorderRadius.full, height: Spacing.buttonHeight, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: Spacing.sm },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
