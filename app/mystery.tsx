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

const PULL_OPTIONS = [
  {
    label: "Single pull",
    price: 50,
    description: "One surprise school-supplies pull",
    accent: "#5C55E6",
    button: "#5C55E6",
    buttonText: "#fff",
  },
  {
    label: "10x pull",
    price: 500,
    description: "Ten pulls for a bigger haul",
    accent: "#25A34A",
    button: "#25A34A",
    buttonText: "#fff",
  },
];

export default function MysteryScreen() {
  const { user } = useAuth();
  const [hasReward, setHasReward] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const [opening, setOpening] = useState(false);
  const [openingCount, setOpeningCount] = useState<number | null>(null);
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

  const handleOpen = async (count: number) => {
    if (opening) return;

    if (!user) {
      alert("You're not logged in");
      return;
    }

    try {
      setOpening(true);
      setOpeningCount(count);

      const rewards = await openBox(count);

      setTimeout(() => {
        setRewardText(
          count === 1
            ? rewards[0]?.name ?? "A surprise reward"
            : rewards.map((reward) => reward.name).join(", "),
        );
        setHasReward(true);
        setOpening(false);
        setOpeningCount(null);
      }, 900);
    } catch (error: any) {
      setOpening(false);
      setOpeningCount(null);
      alert(error?.message ?? "Couldn't open the pull");
    }
  };

  const balance = coins ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <Text style={styles.title}>School supplies pull</Text>
            <Text style={styles.subtitle}>
              Grab a surprise school haul with fresh rewards.
            </Text>
          </View>

          <View style={styles.balancePill}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>
              {loadingCoins ? "Loading..." : `${balance} coins`}
            </Text>
          </View>
        </View>

        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>School supplies</Text>
          </View>

          <Text style={styles.heroTitle}>Choose your pull style</Text>
          <Text style={styles.heroSubtitle}>
            Single pull for 50 coins or 10x for 500 coins.
          </Text>

          <View style={styles.optionStack}>
            {PULL_OPTIONS.map((option) => {
              const isBulk = option.price === 500;
              const canOpen = !opening && !loadingCoins && balance >= option.price;

              return (
                <Pressable
                  key={option.label}
                  style={[
                    styles.optionCard,
                    { borderColor: option.accent },
                    !canOpen && styles.optionCardDisabled,
                  ]}
                  disabled={!canOpen}
                  onPress={() => handleOpen(isBulk ? 10 : 1)}
                >
                  <View style={styles.optionRow}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionPrice}>{option.price} coins</Text>
                  </View>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                  <Text style={styles.optionAction}>
                    {opening && openingCount === (isBulk ? 10 : 1)
                      ? "Opening..."
                      : isBulk
                        ? "Open 10 pulls"
                        : "Open 1 pull"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {hasReward ? (
          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>Latest pull</Text>
            <Text style={styles.rewardText}>{rewardText}</Text>
          </View>
        ) : null}

        {opening ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Opening your pull...</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
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
  heroBanner: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#F8F7FF",
    borderWidth: 1,
    borderColor: "#EDECFD",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#5C55E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6F7287",
    fontWeight: "600",
    marginBottom: 14,
    lineHeight: 20,
  },
  optionStack: {
    gap: 10,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  optionCardDisabled: {
    opacity: 0.7,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  optionDescription: {
    fontSize: 13,
    color: "#8A8DA1",
    marginBottom: 6,
  },
  optionAction: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5C55E6",
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
