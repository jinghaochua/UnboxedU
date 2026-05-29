import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { WebHomepage } from "@/components/WebHomepage";
import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";

export default function HomeScreen() {
  const { user, loading } = useAuth();

  if (Platform.OS === "web") {
    if (loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return <WebHomepage />;
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>📦</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => signOut(auth)}
        >
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📦</Text>
      <Text style={styles.title}>UnboxedU</Text>
      <Text style={styles.tagline}>
        Study smarter. Earn coins. Unbox collectibles.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  emoji: {
    fontSize: 56,
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textMuted,
    marginBottom: 36,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textMuted,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
