import { useEffect, useMemo, useState } from "react";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { openBox } from "@/lib/openBox";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { Pressable, StyleSheet, Text, View } from "react-native";

/*const REWARDS = [
  "Study sticker",
  "Focus badge",
  "Rare card",
  "Extra coin boost",
  "Mini avatar frame",
  "Secret note",
]; */

export default function MysteryScreen() {
  const { user } = useAuth();
  const [hasReward, setHasReward] = useState(false);
  const [reward, setReward] = useState("");
  const [opening, setOpening] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);
  const loadingCoins = Boolean(user && coins === null);

  useEffect(() => {
    if (!user) {
      return;
    }

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

  const boxLabel = useMemo(() => {
    if (opening) return "Opening...";
    return "Tap to open";
  }, [opening]);

  const handleOpen = async () => {
    if (opening) return;

    try {
      setOpening(true);

      const reward = await openBox();

      setTimeout(() => {
        setReward(reward.name);
        setHasReward(true);
        setOpening(false);
      }, 900);
    } catch (error: any) {
      setOpening(false);
      alert(error.message);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/")} hitSlop={10}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mystery Box</Text>
          <Text style={styles.balanceText}>
            {loadingCoins ? "Loading coins..." : `${coins ?? 0} coins`}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.box}>
          <View style={styles.boxTop} />
          <View style={styles.boxBody}>
            <Text style={styles.boxText}>{boxLabel}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Spend coins and open a random reward.
        </Text>

        <Pressable
          style={[styles.button, opening && styles.buttonDisabled]}
          onPress={handleOpen}
        >
          <Text style={styles.buttonText}>
            {opening ? "Opening" : "Open box"}
          </Text>
        </Pressable>

        {hasReward ? (
          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>You got</Text>
            <Text style={styles.rewardText}>{reward}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>How it works</Text>
        <Text style={styles.noteText}>
          Later you can connect this screen to your coins system, so opening a
          box deducts coins and saves the reward to the gallery.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  balanceText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: colors.coin,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  box: {
    width: 180,
    height: 180,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  boxTop: {
    width: 52,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginBottom: 12,
  },
  boxBody: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 999,
  },
  boxText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    minWidth: 140,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  rewardCard: {
    marginTop: 18,
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
  noteCard: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
});
