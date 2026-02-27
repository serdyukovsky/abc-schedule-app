import React from "react";
import { View, Text, StyleSheet } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SpeakerRowProps { name: string; photoUrl?: string; size?: number }

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function SpeakerRow({ name, photoUrl, size = 22 }: SpeakerRowProps) {
  const { theme } = useTheme();
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.42);
  return (
    <View style={styles.container}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover" }}
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary, width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={{ fontSize, lineHeight: size, color: theme.textSecondary, fontWeight: "600" }}>{initials}</Text>
        </View>
      )}
      <Text style={[styles.name, { color: theme.textSecondary }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  avatar: { alignItems: "center", justifyContent: "center" },
  name: { fontSize: 13, fontWeight: "500" },
});
