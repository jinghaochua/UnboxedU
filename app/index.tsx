import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
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
import { auth, db } from "@/lib/firebase";

const XP_PER_LEVEL = 30;

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<{ xp: number; level: number } | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      setProfile({
        xp: data?.xp ?? 0,
        level: data?.level ?? 1,
      });
    });

    return () => unsubscribe();
  }, [user]);

  if (Platform.OS === "web") {
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
    const currentLevel = profile?.level ?? 1;
    const currentXP = profile?.xp ?? 0;
    const xpProgress = Math.min((currentXP / XP_PER_LEVEL) * 100, 100);
    const xpToNextLevel = Math.max(XP_PER_LEVEL - currentXP, 0);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>{user.email}</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>Level {currentLevel}</Text>
            <Text style={styles.progressValue}>{currentXP}/{XP_PER_LEVEL} XP</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${xpProgress}%` }]}
            />
          </View>

          <Text style={styles.progressHint}>
            {xpToNextLevel > 0
              ? `${xpToNextLevel} XP to level ${currentLevel + 1}`
              : `Level ${currentLevel + 1} unlocked!`}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.tasksButton]}
          onPress={() => router.push("/tasks" as never)}
        >
          <Text style={styles.buttonText}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/profile" as never)}
        >
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => signOut(auth)}>
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UnboxedU</Text>
      <Text style={styles.tagline}>
        Study smarter. Earn coins. Unbox collectibles.
      </Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressLabel}>Level 1</Text>
          <Text style={styles.progressValue}>0/30 XP</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "0%" }]} />
        </View>

        <Text style={styles.progressHint}>Sign in to start leveling up</Text>
      </View>

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
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  progressHint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: colors.primaryLight,
  },
  tasksButton: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
