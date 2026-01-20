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

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
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
          { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl },
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
              Логин
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
              placeholder="Введите логин"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              testID="input-login"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Пароль
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
              value={password}
              onChangeText={setPassword}
              placeholder="Введите пароль"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              testID="input-password"
            />
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
            <ThemedText style={styles.buttonText}>
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
    marginBottom: Spacing["4xl"],
  },
  logo: {
    fontSize: 48,
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
    color: "#FFFFFF",
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
