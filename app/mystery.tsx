import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
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
import { openBox } from "@/lib/openBox";

const BOXES = [
  {
    name: "Common",
    coins: 100,
    accent: "#5C55E6",
    soft: "#ECEAFE",
    border: "#E7E7F5",
    button: "#5C55E6",
    buttonText: "#fff",
  },
  {
    name: "Rare",
    coins: 250,
    accent: "#2D8F2F",
    soft: "#EAF4D7",
    border: "#E7E7F5",
    button: "#25A34A",
    buttonText: "#fff",
  },
  {
    name: "Epic",
    coins: 500,
    accent: "#B56B00",
    soft: "#FBEED7",
    border: "#5D57F2",
    button: "#F6A313",
    buttonText: "#fff",
    badge: "Almost there",
  },
  {
    name: "Legendary",
    coins: 1000,
    accent: "#D6A08B",
    soft: "#F9EFED",
    border: "#E7E7F5",
    button: "#F3F3F6",
    buttonText: "#C8C8D4",
    locked: true,
  },
];

export default function MysteryScreen() {
  const { user } = useAuth();
  const [hasReward, setHasReward] = useState(false);
  const [reward, setReward] = useState("");
  const [opening, setOpening] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);

  const loadingCoins = Boolean(user && coins === null);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        setCoins(snapshot.exists() ? (snapshot.data()?.coins ?? 0) : 0);
      },
      () => {},
    );

    return unsubscribe;
  }, [user]);

  const selectedIndex = useMemo(() => {
    const balance = coins ?? 0;

    if (balance >= 1000) return 3;
    if (balance >= 500) return 2;
    if (balance >= 250) return 1;
    return 0;
  }, [coins]);

  const handleOpen = async () => {
    if (opening) return;

    if (!user) {
      alert("You're not logged in");
      return;
    }

    try {
      setOpening(true);

      const boxReward = await openBox();

      setTimeout(() => {
        setReward(boxReward.name);
        setHasReward(true);
        setOpening(false);
      }, 900);
    } catch (error: any) {
      setOpening(false);
      alert(error?.message ?? "Couldn't open the box");
    }
  };

  const balance = coins ?? 0;

  return (
    <ScrollView>
      <View style={styles.page}>
        <View style={styles.header}>
          <View>
            <Pressable
              style={styles.backButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <Text style={styles.title}>Rewards shop</Text>
            <Text style={styles.subtitle}>
              Spend coins to unlock a mystery box.
            </Text>
          </View>

          <View style={styles.balancePill}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>
              {loadingCoins ? "Loading..." : `${balance} coins`}
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {BOXES.map((box, index) => {
            const locked = Boolean(box.locked);
            const selected = index === selectedIndex;
            const canOpen = !locked && !opening && !loadingCoins;

            return (
              <View
                key={box.name}
                style={[
                  styles.card,
                  {
                    borderColor: selected ? box.border : colors.border,
                  },
                  selected && styles.cardSelected,
                ]}
              >
                {box.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{box.badge}</Text>
                  </View>
                ) : null}

                <View style={[styles.iconWrap, { backgroundColor: box.soft }]}>
                  <View style={[styles.cube, { borderColor: box.accent }]}>
                    <View
                      style={[styles.cubeTop, { borderColor: box.accent }]}
                    />
                    <View
                      style={[styles.cubeRight, { borderColor: box.accent }]}
                    />
                  </View>
                </View>

                <Text style={[styles.name, locked && styles.nameLocked]}>
                  {box.name}
                </Text>

                <Text style={[styles.cost, locked && styles.costLocked]}>
                  {box.coins} coins
                </Text>

                <Pressable
                  style={[
                    styles.button,
                    { backgroundColor: box.button },
                    locked && styles.buttonLocked,
                    !canOpen && !locked && styles.buttonDisabled,
                  ]}
                  disabled={locked || !canOpen}
                  onPress={handleOpen}
                >
                  <Text style={[styles.buttonText, { color: box.buttonText }]}>
                    {locked ? "Locked" : opening ? "Opening..." : "Open"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {hasReward ? (
          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>You got</Text>
            <Text style={styles.rewardText}>{reward}</Text>
          </View>
        ) : null}

        {opening ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Opening your box...</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 34,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#9A9AA8",
    fontWeight: "600",
  },
  balancePill: {
    minWidth: 110,
    alignItems: "flex-end",
    backgroundColor: "#F7F7FC",
    borderWidth: 1,
    borderColor: "#ECECF4",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9A9AA8",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  grid: {
    flexDirection: "column",
    gap: 12,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8F2",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: "center",
    position: "relative",
  },
  cardSelected: {
    borderWidth: 2,
    shadowColor: "#5D57F2",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    backgroundColor: "#5D57F2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cube: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 3,
    position: "relative",
    backgroundColor: "transparent",
  },
  cubeTop: {
    position: "absolute",
    top: -6,
    left: 2,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 0,
    transform: [{ skewX: "-30deg" }],
    backgroundColor: "transparent",
  },
  cubeRight: {
    position: "absolute",
    top: 4,
    left: 10,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    transform: [{ skewY: "-30deg" }],
    backgroundColor: "transparent",
  },
  name: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 2,
  },
  nameLocked: {
    color: "#9E9EAE",
  },
  cost: {
    fontSize: 13,
    color: "#8B8B98",
    marginBottom: 14,
    fontWeight: "500",
  },
  costLocked: {
    color: "#C5C5D0",
  },
  button: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  buttonLocked: {
    backgroundColor: "#F5F5F8",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  rewardCard: {
    marginTop: 16,
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 16,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.primary,
    marginBottom: 6,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  backButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  loadingRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
});
