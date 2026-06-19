import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";

import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";

export default function LoginScreen() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      Alert.alert("Login error", message);
    }
  };

  if (loading || user) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <View style={styles.topBar}>
          <Text style={styles.mascot}>🦉</Text>
          <Text style={styles.heading}>Welcome back!</Text>
          <Text style={styles.subheading}>Your streak missed you</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@email.com"
            placeholderTextColor="#7A7A7A"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#7A7A7A"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={() =>
              Alert.alert("Forgot password", "Hook this up to your reset flow.")
            }
          >
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>New here?</Text>
            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.bottomLink}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    padding: 20,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    backgroundColor: "#2A2A2A",
  },
  topBar: {
    backgroundColor: "#5B4BEB",
    paddingVertical: 28,
    alignItems: "center",
  },
  mascot: {
    fontSize: 34,
    marginBottom: 10,
  },
  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  subheading: {
    color: "rgba(255,255,255,0.86)",
    marginTop: 4,
    fontSize: 13,
  },
  body: {
    padding: 20,
  },
  label: {
    color: "#B8B8B8",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#fff",
    fontSize: 15,
    marginBottom: 16,
  },
  forgot: {
    textAlign: "right",
    color: "#6C5CE7",
    fontWeight: "700",
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 4,
  },
  bottomText: {
    color: "#B8B8B8",
  },
  bottomLink: {
    color: "#6C5CE7",
    fontWeight: "800",
  },
});
