import { Redirect, router } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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

type GalleryItem = {
  id: string;
  name: string;
  rarity?: string;
  count?: number;
  unlocked: boolean;
};

export default function GalleryScreen() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "collected" | "locked">("all");

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    let userItemsMap: Record<string, { name: string; rarity?: string; count?: number }> = {};
    let rewardsList: { id: string; name: string; rarity?: string }[] = [];

    const combineRewards = () => {
      const map = new Map<string, GalleryItem>();

      rewardsList.forEach((reward) => {
        const userItem = userItemsMap[reward.id];
        const count = userItem?.count ?? 0;

        map.set(reward.id, {
          id: reward.id,
          name: reward.name,
          rarity: reward.rarity ?? userItem?.rarity ?? "Reward",
          count,
          unlocked: count > 0,
        });
      });

      Object.keys(userItemsMap).forEach((id) => {
        if (!map.has(id)) {
          const userItem = userItemsMap[id];
          const count = userItem.count ?? 1;

          map.set(id, {
            id,
            name: userItem.name ?? "Reward",
            rarity: userItem.rarity ?? "Reward",
            count,
            unlocked: count > 0,
          });
        }
      });

      setItems(Array.from(map.values()));
    };

    const unsubUser = onSnapshot(
      query(
        collection(db, "users", user.uid, "collections"),
        orderBy("lastObtained", "desc"),
      ),
      (snapshot) => {
        const userMap: Record<string, { name: string; rarity?: string; count?: number }> = {};
        snapshot.docs.forEach((doc) => {
          userMap[doc.id] = doc.data() as any;
        });
        userItemsMap = userMap;
        combineRewards();
      },
    );

    const unsubRewards = onSnapshot(
      collection(db, "rewards"),
      (snapshot) => {
        rewardsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        combineRewards();
      },
    );

    return () => {
      unsubUser();
      unsubRewards();
    };
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const collectedCount = items.filter((item) => item.unlocked).length;
  const lockedCount = items.filter((item) => !item.unlocked).length;

  const filteredItems = items.filter((item) => {
    if (filter === "collected") return item.unlocked;
    if (filter === "locked") return !item.unlocked;
    return true;
  });

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Gallery</Text>
          <Text style={styles.subtitle}>
            All of the items you’ve unlocked from tasks and mystery boxes.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.countBadge}>
            <Text style={styles.countLabel}>Collected</Text>
            <Text style={styles.countValue}>{collectedCount}</Text>
          </View>

          <View style={[styles.countBadge, styles.lockedBadge]}>
            <Text style={styles.countLabel}>Locked</Text>
            <Text style={[styles.countValue, styles.lockedValue]}>
              {lockedCount}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {(["all", "collected", "locked"] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            <Text
              style={[
                styles.tabText,
                filter === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <View
              key={item.id}
              style={[styles.row, !item.unlocked && styles.lockedRow]}
            >
              <View
                style={[styles.thumb, !item.unlocked && styles.lockedThumb]}
              />
              <View style={styles.content}>
                <Text
                  style={[
                    styles.itemTitle,
                    !item.unlocked && styles.lockedTitle,
                  ]}
                >
                  {item.unlocked ? item.name : item.name || "Locked Reward"}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.rarity ?? "Reward"}
                  {item.unlocked ? ` • x${item.count ?? 1}` : " • Locked"}
                </Text>
              </View>

              <View
                style={[
                  styles.statusPill,
                  item.unlocked ? styles.unlockedPill : styles.lockedPill,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.unlocked ? styles.unlockedText : styles.lockedText,
                  ]}
                >
                  {item.unlocked ? `x${item.count ?? 1}` : "Locked"}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            {filter === "collected"
              ? "You haven’t unlocked any rewards yet."
              : filter === "locked"
                ? "You’ve unlocked all available rewards!"
                : "No rewards found."}
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
    gap: 16,
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
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  countBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F2FF",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  lockedBadge: {
    backgroundColor: "#F1F5F9",
  },
  countLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  countValue: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
  },
  lockedValue: {
    color: colors.textMuted,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
  activeTabText: {
    color: "#fff",
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lockedRow: {
    opacity: 0.65,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  lockedThumb: {
    backgroundColor: "#E2E8F0",
  },
  content: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  lockedTitle: {
    color: colors.textMuted,
  },
  itemMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  unlockedPill: {
    backgroundColor: "#F5F2FF",
  },
  lockedPill: {
    backgroundColor: "#F1F5F9",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800",
  },
  unlockedText: {
    color: colors.primary,
  },
  lockedText: {
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
