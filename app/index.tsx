import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";

export default function HomeScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>{user.email}</Text>

        <TouchableOpacity style={styles.button} onPress={() => signOut(auth)}>
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UnboxedU</Text>

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
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
    marginTop: -30,
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  registerButton: {
    backgroundColor: "#10B981",
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
