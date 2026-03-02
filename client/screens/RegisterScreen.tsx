import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  View, Text, Pressable, ScrollView, TextInput,
  KeyboardAvoidingView, StyleSheet,
} from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  let norm = digits.startsWith("8") ? `7${digits.slice(1)}` : digits.startsWith("7") ? digits : `7${digits}`;
  const local = norm.slice(1, 11);
  const p = [local.slice(0,3), local.slice(3,6), local.slice(6,8), local.slice(8,10)];
  let f = "+7";
  if (p[0]) f += ` (${p[0]}`;
  if (p[0]?.length === 3) f += ")";
  if (p[1]) f += ` ${p[1]}`;
  if (p[2]) f += `-${p[2]}`;
  if (p[3]) f += `-${p[3]}`;
  return f;
};

export default function RegisterScreen() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !loginId.trim() || !password.trim()) {
      setError("Заполните обязательные поля");
      return;
    }
    if (password.length < 10) {
      setError("Пароль должен содержать не менее 10 символов");
      return;
    }
    setIsLoading(true);
    const success = await register(
      { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), company: company.trim(), title: title.trim(), login: loginId.trim() },
      password
    );
    setIsLoading(false);
    if (!success) setError("Не удалось создать аккаунт");
  };

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.separator }];

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Регистрация</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: `${theme.conflict}18` }]}>
              <Text style={[styles.errorText, { color: theme.conflict }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Имя *</Text>
              <TextInput style={inputStyle} value={firstName} onChangeText={setFirstName} placeholder="Иван" autoCapitalize="words" testID="input-firstName" />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Фамилия *</Text>
              <TextInput style={inputStyle} value={lastName} onChangeText={setLastName} placeholder="Петров" autoCapitalize="words" testID="input-lastName" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Телефон *</Text>
            <TextInput style={inputStyle} value={phone} onChangeText={(v) => setPhone(formatPhone(v))} placeholder="+7 (999) 123-45-67" keyboardType="phone-pad" testID="input-phone" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Компания</Text>
            <TextInput style={inputStyle} value={company} onChangeText={setCompany} placeholder="Название компании" testID="input-company" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Должность</Text>
            <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholder="Ваша должность" testID="input-title" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Электронная почта *</Text>
            <TextInput style={inputStyle} value={loginId} onChangeText={setLoginId} placeholder="user@domain.ru" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} testID="input-login" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Пароль *</Text>
            <TextInput style={inputStyle} value={password} onChangeText={setPassword} placeholder="Придумайте пароль" secureTextEntry testID="input-password" />
          </View>

          <Pressable style={[styles.button, { backgroundColor: theme.link }, isLoading ? styles.buttonDisabled : undefined]} onPress={handleRegister} disabled={isLoading} testID="button-register">
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>{isLoading ? "Регистрация..." : "Зарегистрироваться"}</Text>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={() => navigate("/login")}>
            <Text style={[styles.linkText, { color: theme.link }]}>У меня уже есть аккаунт</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.xl },
  header: { marginBottom: Spacing["2xl"] },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "700" },
  form: { width: "100%", maxWidth: 400, alignSelf: "center" },
  errorBanner: { borderRadius: BorderRadius.xs, padding: Spacing.md, marginBottom: Spacing.lg },
  errorText: { fontSize: 14, fontWeight: "500" },
  row: { flexDirection: "row", gap: Spacing.md },
  halfWidth: { flex: 1 },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: "500", marginBottom: Spacing.sm },
  input: { height: Spacing.inputHeight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, fontSize: 16, borderWidth: 1 },
  button: { height: Spacing.buttonHeight, borderRadius: BorderRadius.sm, alignItems: "center", justifyContent: "center", marginTop: Spacing.lg },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 17, fontWeight: "600" },
  linkButton: { alignItems: "center", paddingVertical: Spacing.lg, marginTop: Spacing.sm },
  linkText: { fontSize: 16, fontWeight: "500" },
});
