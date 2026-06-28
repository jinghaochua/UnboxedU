import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { useAuth } from "@/hooks/use-auth";
import { ensureUserProfile } from "@/lib/authService";
import { auth } from "@/lib/firebase";

export default function RegisterScreen() {
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user]);

  const formatAuthError = (error: unknown) => {
    if (typeof error === "object" && error && "code" in error) {
      const code = (error as { code?: string }).code;

      switch (code) {
        case "auth/invalid-email":
          return "Please enter a valid email address.";
        case "auth/email-already-in-use":
          return "An account with this email already exists.";
        case "auth/weak-password":
          return "Password should be at least 6 characters.";
        case "auth/too-many-requests":
          return "Too many attempts. Please try again later.";
        default:
          return "Something went wrong. Please try again.";
      }
    }

    return "Something went wrong. Please try again.";
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await ensureUserProfile(userCredential.user, fullName.trim());
      router.replace("/");
    } catch (error) {
      setErrorMessage(formatAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <View style={[styles.topBar, styles.registerBar]}>
          <Text style={styles.mascot}>🎁</Text>
          <Text style={styles.heading}>Join UnboxedU</Text>
          <Text style={styles.subheading}>Your first box is waiting</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            placeholder="Johnathan"
            placeholderTextColor="#7A7A7A"
            style={[styles.input, errorMessage ? styles.inputError : null]}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errorMessage) setErrorMessage(null);
            }}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@email.com"
            placeholderTextColor="#7A7A7A"
            style={[styles.input, errorMessage ? styles.inputError : null]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#7A7A7A"
            secureTextEntry
            style={[styles.input, errorMessage ? styles.inputError : null]}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage(null);
            }}
          />
          <Text style={styles.passwordHint}>Minimum 6 characters</Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.button,
              styles.registerButton,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </Pressable>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have one?</Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.bottomLink}>Log in</Text>
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
  registerBar: {
    backgroundColor: "#F59E0B",
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
    marginBottom: 12,
  },
  inputError: {
    borderColor: "#F87171",
  },
  errorBox: {
    backgroundColor: "rgba(248, 113, 113, 0.15)",
    borderWidth: 1,
    borderColor: "#F87171",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "#FECACA",
    fontSize: 13,
    fontWeight: "600",
  },
  passwordHint: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButton: {
    backgroundColor: "#F59E0B",
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
    color: "#F59E0B",
    fontWeight: "800",
  },
});
