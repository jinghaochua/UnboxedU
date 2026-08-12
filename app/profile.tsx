import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  fullName: string;
  email: string;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  createdAt: any;
}

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading || profileLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Not logged in</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login" as never)}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/" as never)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>

      {profile && (
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => router.push("/profile/edit" as never)}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.fullName
                  ? profile.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "?"}
              </Text>
            </View>
            <Text style={styles.avatarHint}>Tap to edit photo</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{profile.fullName || "Not set"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile.email}</Text>
            </View>
          </View>

          <View style={[styles.section, styles.statsSection]}>
            <Text style={styles.sectionTitle}>Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile.level}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.coin }]}>
                  {profile.coins}
                </Text>
                <Text style={styles.statLabel}>Coins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.primaryDark }]}>
                  {profile.xp}
                </Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {profile.streak}
                </Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => router.push("/profile/edit" as never)}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={() => {
                signOut(auth);
                router.push("/login" as never);
              }}
            >
              <Text style={[styles.buttonText, styles.logoutButtonText]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 24,
    marginTop: Platform.OS === "web" ? 8 : 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    gap: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
    gap: 8,
    padding: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.card,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  section: {
    gap: 12,
  },
  statsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
  },
  logoutButtonText: {
    color: "#DC2626",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.card,
  },
});
