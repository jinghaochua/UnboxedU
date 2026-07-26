import { Redirect, router } from "expo-router";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";

type LeaderboardUser = {
  id: string;
  username?: string;
  email?: string;
  coins?: number;
};

export default function LeaderboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("coins", "desc"),
      limit(20),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<LeaderboardUser, "id">),
        }));

        setLeaderboard(users);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (authLoading || loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>
            Top students ranked by earned coins.
          </Text>
        </View>

        <View style={styles.badgePill}>
          <Text style={styles.badgeLabel}>Top Rank</Text>
          <Text style={styles.badgeValue}>
            {leaderboard.length > 0 ? `#1 ${leaderboard[0].coins ?? 0} coins` : "—"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        {leaderboard.length > 0 ? (
          leaderboard.map((item, index) => {
            const rank = index + 1;
            const isCurrentUser = item.id === user.uid;
            const displayName =
              item.username || item.email?.split("@")[0] || "Student";

            return (
              <View
                key={item.id}
                style={[styles.row, isCurrentUser && styles.currentUserRow]}
              >
                <View
                  style={[
                    styles.rankBadge,
                    rank === 1 && styles.rankOne,
                    rank === 2 && styles.rankTwo,
                    rank === 3 && styles.rankThree,
                  ]}
                >
                  <Text
                    style={[
                      styles.rankText,
                      rank <= 3 && styles.topRankText,
                    ]}
                  >
                    #{rank}
                  </Text>
                </View>

                <View style={styles.content}>
                  <Text style={styles.userName}>
                    {displayName} {isCurrentUser ? "(You)" : ""}
                  </Text>
                  <Text style={styles.userCoins}>
                    {item.coins ?? 0} coins
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            No students found on the leaderboard yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentUserRow: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  rankOne: {
    backgroundColor: "#FEF08A",
  },
  rankTwo: {
    backgroundColor: "#E2E8F0",
  },
  rankThree: {
    backgroundColor: "#FFEDD5",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textMuted,
  },
  topRankText: {
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  userCoins: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
