import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthNavigator";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();
  const topPadding = insets.top + Spacing["5xl"];

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    const success = await login(loginId.trim(), password);

    setIsLoading(false);

    if (!success) {
      Alert.alert("Ошибка", "Неверный логин или пароль");
    }
  };

  const handleRegister = () => {
    Haptics.selectionAsync();
    navigation.navigate("Register");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={[styles.logo, { color: theme.text }]}>ABC</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Altai Business Camp
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Электронная почта
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.separator,
                },
              ]}
              value={loginId}
              onChangeText={setLoginId}
              placeholder="user@domain.ru"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              testID="input-login"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Пароль
            </ThemedText>
            <View style={[styles.passwordRow, { borderColor: theme.separator }]}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!isPasswordVisible}
                testID="input-password"
              />
              <Pressable
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                style={[styles.passwordToggle, { backgroundColor: theme.backgroundDefault }]}
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
                testID="toggle-password-visibility"
              >
                <Feather
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={18}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.link },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            testID="button-login"
          >
            <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
              {isLoading ? "Вход..." : "Войти"}
            </ThemedText>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={handleRegister}>
            <ThemedText style={[styles.linkText, { color: theme.link }]}>
              Создать аккаунт
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing["2xl"],
    marginBottom: Spacing["4xl"],
  },
  logo: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "700",
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    marginTop: Spacing.sm,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  passwordToggle: {
    paddingHorizontal: Spacing.md,
    height: Spacing.inputHeight,
    justifyContent: "center",
    borderTopRightRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
