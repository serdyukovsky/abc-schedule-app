import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  View, Text, Pressable, ScrollView, TextInput,
  KeyboardAvoidingView, StyleSheet,
} from "@/components/primitives";
import { Feather } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function LoginScreen() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!loginId.trim() || !password.trim()) {
      setError("Заполните все поля");
      return;
    }
    setIsLoading(true);
    const success = await login(loginId.trim(), password);
    setIsLoading(false);
    if (!success) setError("Неверный логин или пароль");
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.text }]}>ABC</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Altai Business Camp</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: `${theme.conflict}18` }]}>
              <Text style={[styles.errorText, { color: theme.conflict }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Электронная почта</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.separator }]}
              value={loginId}
              onChangeText={setLoginId}
              placeholder="user@domain.ru"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              testID="input-login"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Пароль</Text>
            <View style={[styles.passwordRow, { borderColor: theme.separator }]}>
              <TextInput
                style={[styles.input, styles.passwordInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
                secureTextEntry={!isPasswordVisible}
                testID="input-password"
              />
              <Pressable
                onPress={() => setIsPasswordVisible((p) => !p)}
                style={[styles.passwordToggle, { backgroundColor: theme.backgroundDefault }]}
                testID="toggle-password-visibility"
              >
                <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.button, { backgroundColor: theme.link }, isLoading ? styles.buttonDisabled : undefined]}
            onPress={handleLogin}
            disabled={isLoading}
            testID="button-login"
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              {isLoading ? "Вход..." : "Войти"}
            </Text>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={() => navigate("/register")}>
            <Text style={[styles.linkText, { color: theme.link }]}>Создать аккаунт</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 80, paddingBottom: Spacing.xl },
  header: { alignItems: "center", marginBottom: Spacing["4xl"] },
  logo: { fontSize: 48, lineHeight: 56, fontWeight: "700", letterSpacing: 4 },
  subtitle: { fontSize: 16, marginTop: Spacing.sm },
  form: { width: "100%", maxWidth: 400, alignSelf: "center" },
  errorBanner: { borderRadius: BorderRadius.xs, padding: Spacing.md, marginBottom: Spacing.lg },
  errorText: { fontSize: 14, fontWeight: "500" },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: "500", marginBottom: Spacing.sm },
  input: { height: Spacing.inputHeight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, fontSize: 16, borderWidth: 1 },
  passwordRow: { flexDirection: "row", alignItems: "center", borderRadius: BorderRadius.sm, borderWidth: 1 },
  passwordInput: { flex: 1, borderWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  passwordToggle: { paddingHorizontal: Spacing.md, height: Spacing.inputHeight, justifyContent: "center", borderTopRightRadius: BorderRadius.sm, borderBottomRightRadius: BorderRadius.sm },
  button: { height: Spacing.buttonHeight, borderRadius: BorderRadius.sm, alignItems: "center", justifyContent: "center", marginTop: Spacing.lg },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 17, fontWeight: "600" },
  linkButton: { alignItems: "center", paddingVertical: Spacing.lg, marginTop: Spacing.sm },
  linkText: { fontSize: 16, fontWeight: "500" },
});
