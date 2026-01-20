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
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !loginId.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Заполните обязательные поля");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    const success = await register(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        company: company.trim(),
        title: title.trim(),
        login: loginId.trim(),
      },
      password
    );

    setIsLoading(false);

    if (!success) {
      Alert.alert("Ошибка", "Не удалось создать аккаунт");
    }
  };

  const handleGoToLogin = () => {
    Haptics.selectionAsync();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["2xl"], paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Регистрация
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                Имя *
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
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Иван"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="words"
                testID="input-firstName"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                Фамилия *
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
                value={lastName}
                onChangeText={setLastName}
                placeholder="Петров"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="words"
                testID="input-lastName"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Компания
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
              value={company}
              onChangeText={setCompany}
              placeholder="Название компании"
              placeholderTextColor={theme.textMuted}
              testID="input-company"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Должность
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
              value={title}
              onChangeText={setTitle}
              placeholder="Ваша должность"
              placeholderTextColor={theme.textMuted}
              testID="input-title"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Логин *
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
              placeholder="Придумайте логин"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              testID="input-login"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Пароль *
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
              placeholder="Придумайте пароль"
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
            onPress={handleRegister}
            disabled={isLoading}
            testID="button-register"
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </ThemedText>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={handleGoToLogin}>
            <ThemedText style={[styles.linkText, { color: theme.link }]}>
              У меня уже есть аккаунт
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
    marginBottom: Spacing["2xl"],
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
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
