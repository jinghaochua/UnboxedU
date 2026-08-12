import { Redirect, router } from "expo-router";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";

type LeaderboardUser = {
  id: string;
  username?: string;
  email?: string;
  boxesOpened?: number;
  level?: number;
  coins?: number;
};

export default function LeaderboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 800;
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<"boxes" | "level">("boxes");

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy(sortMode === "boxes" ? "boxesOpened" : "level", "desc"),
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
  }, [sortMode]);

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

  const topThree = leaderboard.slice(0, 3);
  const currentUserRank = leaderboard.findIndex((item) => item.id === user.uid);
  const currentUser = currentUserRank >= 0 ? leaderboard[currentUserRank] : null;

  const getDisplayName = (item: LeaderboardUser) =>
    item.username || item.email?.split("@")[0] || "Student";

  const leaderboardLabel =
    sortMode === "boxes" ? "boxes opened" : "level";
  const currentUserMetric =
    sortMode === "boxes" ? currentUser?.boxesOpened ?? 0 : currentUser?.level ?? 1;

  return (
    <View style={styles.page}>
      <View style={styles.navWrap}>
        <View style={[styles.nav, isWide && styles.navWide]}>
          <Pressable style={styles.logoRow} onPress={() => router.replace("/")}>
            <Image
              source={require("../assets/images/unboxedu-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Pressable>

          {isWide ? (
            <View style={styles.navLinks}>
              <Pressable onPress={() => router.push("/tasks" as never)}>
                <Text style={styles.navLink}>Tasks</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/mystery" as never)}>
                <Text style={styles.navLink}>Mystery Boxes</Text>
              </Pressable>
              <View style={styles.activeNavLink}>
                <Text style={styles.activeNavLinkText}>Leaderboard</Text>
              </View>
            </View>
          ) : null}

          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.homeButtonText}>Back to home</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.screen}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isWide && styles.headerWide]}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Hall of fame</Text>
            <Text style={styles.title}>Top Unboxers</Text>
            <Text style={styles.subtitle}>
              See who has opened the most mystery boxes or reached the highest
              level in the rankings.
            </Text>
          </View>

          <View style={styles.yourRankCard}>
            <Text style={styles.yourRankLabel}>Your rank</Text>
            <Text style={styles.yourRankValue}>
              {currentUserRank >= 0 ? `#${currentUserRank + 1}` : "Not ranked"}
            </Text>
            <Text style={styles.yourRankBoxes}>
              {sortMode === "boxes"
                ? `${currentUserMetric} boxes opened`
                : `Level ${currentUserMetric}`}
            </Text>
          </View>
        </View>

        <View style={styles.sortToggleWrap}>
          <Pressable
            style={[
              styles.sortButton,
              sortMode === "boxes" && styles.sortButtonActive,
            ]}
            onPress={() => setSortMode("boxes")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortMode === "boxes" && styles.sortButtonTextActive,
              ]}
            >
              By boxes
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.sortButton,
              sortMode === "level" && styles.sortButtonActive,
            ]}
            onPress={() => setSortMode("level")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortMode === "level" && styles.sortButtonTextActive,
              ]}
            >
              By level
            </Text>
          </Pressable>
        </View>

        {topThree.length > 0 ? (
          <View style={styles.topSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Leading the board</Text>
              <Text style={styles.sectionCaption}>This month&apos;s top students</Text>
            </View>

            <View style={[styles.podium, isWide && styles.podiumWide]}>
              {topThree.map((item, index) => {
                const rank = index + 1;
                const isCurrentUser = item.id === user.uid;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.podiumCard,
                      rank === 1 && styles.firstPlaceCard,
                    ]}
                  >
                    <View
                      style={[
                        styles.podiumRank,
                        rank === 1 && styles.firstPlaceRank,
                        rank === 2 && styles.secondPlaceRank,
                        rank === 3 && styles.thirdPlaceRank,
                      ]}
                    >
                      <Text style={styles.podiumRankText}>#{rank}</Text>
                    </View>

                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getDisplayName(item).charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <Text style={styles.podiumName} numberOfLines={1}>
                      {getDisplayName(item)}
                    </Text>
                    {isCurrentUser ? (
                      <Text style={styles.youLabel}>YOU</Text>
                    ) : null}
                    <Text style={styles.podiumBoxes}>
                      {sortMode === "boxes"
                        ? `${item.boxesOpened ?? 0} boxes opened`
                        : `Level ${item.level ?? 1}`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.tableHeader}>
            <View>
              <Text style={styles.sectionTitle}>Full rankings</Text>
              <Text style={styles.sectionCaption}>Top 20 students</Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {leaderboard.length > 0 ? (
            leaderboard.map((item, index) => {
              const rank = index + 1;
              const isCurrentUser = item.id === user.uid;
              const boxes = item.boxesOpened ?? 0;
              const level = item.level ?? 1;
              const metricValue = sortMode === "boxes" ? boxes : level;
              const metricLabel = sortMode === "boxes" ? "boxes" : "lvl";

              return (
                <View
                  key={item.id}
                  style={[
                    styles.row,
                    isCurrentUser && styles.currentUserRow,
                  ]}
                >
                  <Text style={styles.rowRank}>#{rank}</Text>

                  <View style={styles.smallAvatar}>
                    <Text style={styles.smallAvatarText}>
                      {getDisplayName(item).charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.content}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {getDisplayName(item)}
                      </Text>
                      {isCurrentUser ? (
                        <View style={styles.youPill}>
                          <Text style={styles.youPillText}>You</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.userMeta}>
                      UnboxedU student
                    </Text>
                  </View>

                  <View style={styles.boxCount}>
                    <Text style={styles.boxCountValue}>{metricValue}</Text>
                    <Text style={styles.boxCountLabel}>
                      {sortMode === "boxes"
                        ? boxes === 1
                          ? "box"
                          : "boxes"
                        : "level"}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>The board is empty</Text>
              <Text style={styles.emptyText}>
                Open a mystery box to become the first ranked student.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FAFAFE",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFE",
  },
  navWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8F0",
  },
  nav: {
    width: "100%",
    maxWidth: 1680,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  navWide: {
    paddingHorizontal: 28,
  },
  logoRow: {
    flexShrink: 0,
  },
  logo: {
    width: 138,
    height: 38,
  },
  navLinks: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },
  navLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A8AA3",
  },
  activeNavLink: {
    backgroundColor: "#EEF0FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  activeNavLinkText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#5B4FE8",
  },
  homeButton: {
    backgroundColor: "#F6F6FB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  homeButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#14142B",
  },
  screen: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    backgroundColor: "#F0EEFF",
    borderRadius: 24,
    padding: 24,
    gap: 22,
  },
  headerWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 28,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#5B4FE8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#14142B",
    lineHeight: 43,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: 570,
    fontSize: 15,
    lineHeight: 23,
    color: "#7C7C91",
  },
  yourRankCard: {
    minWidth: 180,
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E4E0FF",
  },
  yourRankLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8A8AA3",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  yourRankValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#5B4FE8",
    marginVertical: 3,
  },
  yourRankBoxes: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C7C91",
  },
  sortToggleWrap: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#EEF0FF",
    borderRadius: 999,
    padding: 4,
    gap: 4,
    width: "100%",
    maxWidth: 420,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  sortButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7C7C91",
  },
  sortButtonTextActive: {
    color: "#5B4FE8",
  },
  topSection: {
    gap: 14,
  },
  sectionHeading: {
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#14142B",
  },
  sectionCaption: {
    fontSize: 13,
    color: "#8A8AA3",
    marginTop: 4,
  },
  podium: {
    gap: 12,
  },
  podiumWide: {
    flexDirection: "row",
  },
  podiumCard: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8F0",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  firstPlaceCard: {
    backgroundColor: "#FFFBEE",
    borderColor: "#F6DF9A",
  },
  podiumRank: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 4,
  },
  firstPlaceRank: {
    backgroundColor: "#FFE7A3",
  },
  secondPlaceRank: {
    backgroundColor: "#ECECF3",
  },
  thirdPlaceRank: {
    backgroundColor: "#FFE4D4",
  },
  podiumRankText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#14142B",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#5B4FE8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
  },
  podiumName: {
    maxWidth: "100%",
    fontSize: 17,
    fontWeight: "900",
    color: "#14142B",
  },
  youLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#5B4FE8",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  podiumBoxes: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A8AA3",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8F0",
    padding: 20,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EAF8EF",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16A34A",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#16803A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    borderRadius: 14,
  },
  currentUserRow: {
    backgroundColor: "#F0EEFF",
    borderBottomColor: "#E4E0FF",
  },
  rowRank: {
    width: 30,
    fontSize: 13,
    fontWeight: "900",
    color: "#8A8AA3",
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  smallAvatarText: {
    color: "#5B4FE8",
    fontSize: 14,
    fontWeight: "900",
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    maxWidth: "75%",
    fontSize: 15,
    fontWeight: "800",
    color: "#14142B",
  },
  userMeta: {
    fontSize: 12,
    color: "#A2A2AF",
    marginTop: 3,
  },
  youPill: {
    backgroundColor: "#5B4FE8",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  youPillText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  boxCount: {
    minWidth: 56,
    alignItems: "flex-end",
  },
  boxCountValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#14142B",
  },
  boxCountLabel: {
    fontSize: 11,
    color: "#8A8AA3",
    marginTop: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 44,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#14142B",
    marginBottom: 6,
  },
  emptyText: {
    maxWidth: 360,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#8A8AA3",
  },
});
