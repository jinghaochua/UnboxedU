import { useRef } from "react";

import { router } from "expo-router";
import { signOut } from "firebase/auth";
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
import { auth } from "@/lib/firebase";

const TASKS = [
  {
    title: "Review lecture notes",
    detail: "Finish before dinner",
    coins: 15,
    status: "Today",
  },
  {
    title: "Complete quiz practice",
    detail: "Try to score above 80%",
    coins: 25,
    status: "Urgent",
  },
  {
    title: "Read one chapter",
    detail: "Focus on the key concepts",
    coins: 20,
    status: "This week",
  },
];

const GALLERY_ITEMS = ["Unlocked badge", "Study card", "Rare item"];

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const coins = 0; // replace with the real Firestore value later

  const scrollToSection = (section: "coins" | "boxes" | "gallery") => {
    const y = sectionOffsets.current[section];
    if (typeof y === "number") {
      scrollRef.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.page}>
        <View style={styles.centerCard}>
          <Text style={styles.brand}>UnboxedU</Text>
          <Text style={styles.heroTitle}>Study work, tracked in one place</Text>
          <Text style={styles.heroSubtitle}>
            Log in to see your tasks, coins, boxes, and collection.
          </Text>

          <Pressable style={styles.primaryButton} onPress={() => router.push("/login")}>
            <Text style={styles.primaryButtonText}>Log in</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, { marginTop: 12 }]}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.secondaryButtonText}>Create account</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>UnboxedU</Text>

        <View style={styles.userRow}>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>

          <View style={styles.coinBadge}>
            <Text style={styles.coinBadgeText}>{coins} coins</Text>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={() => signOut(auth)}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Dashboard</Text>
          <Text style={styles.heroTitle}>Your study tasks for today</Text>
          <Text style={styles.heroSubtitle}>
            Finish tasks, earn coins, open boxes, and keep your collection in one place.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick features</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a card to jump to that part of the page.
          </Text>

          <View style={styles.featureGrid}>
            <Pressable
              style={styles.featureCard}
              onPress={() => scrollToSection("coins")}
            >
              <Text style={styles.featureLabel}>Coins</Text>
              <Text style={styles.featureTitleSmall}>Track rewards</Text>
              <Text style={styles.featureText}>
                See how many coins you have and how much you earn per task.
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => scrollToSection("boxes")}
            >
              <Text style={styles.featureLabel}>Boxes</Text>
              <Text style={styles.featureTitleSmall}>Open mystery boxes</Text>
              <Text style={styles.featureText}>
                Go to the blind box section and open rewards when you are ready.
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => scrollToSection("gallery")}
            >
              <Text style={styles.featureLabel}>Gallery</Text>
              <Text style={styles.featureTitleSmall}>View collection</Text>
              <Text style={styles.featureText}>
                Keep the items you unlock in one place.
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={styles.section}
          onLayout={(event) => {
            sectionOffsets.current.coins = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionTitle}>Coin summary</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{coins}</Text>
            <Text style={styles.summaryLabel}>coins available</Text>
            <Text style={styles.summaryText}>
              Use coins to open mystery boxes after you complete your study tasks.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks to do</Text>
          <Text style={styles.sectionSubtitle}>
            Complete these to keep your streak going.
          </Text>

          <View style={styles.taskList}>
            {TASKS.map((task) => (
              <View key={task.title} style={styles.taskCard}>
                <View style={styles.taskTopRow}>
                  <Text style={styles.taskStatus}>{task.status}</Text>
                  <Text style={styles.taskCoins}>+{task.coins} coins</Text>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDetail}>{task.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={styles.section}
          onLayout={(event) => {
            sectionOffsets.current.boxes = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionTitle}>Mystery box</Text>

          <View style={styles.boxCard}>
            <View style={styles.boxVisual} />
            <Text style={styles.boxTitle}>Blind box opening</Text>
            <Text style={styles.boxText}>
              Tap below to open your mystery box screen.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/mystery")}
            >
              <Text style={styles.primaryButtonText}>Open mystery box</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={styles.section}
          onLayout={(event) => {
            sectionOffsets.current.gallery = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionTitle}>Gallery</Text>

          <View style={styles.galleryCard}>
            {GALLERY_ITEMS.map((item) => (
              <View key={item} style={styles.galleryItem}>
                <View style={styles.galleryThumb} />
                <Text style={styles.galleryText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Study tasks, coins, boxes, and collection</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    maxWidth: 220,
  },
  coinBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  coinBadgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroKicker: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 40,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
    maxWidth: 640,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 16,
  },
  featureGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  featureTitleSmall: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
  },
  taskTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  taskCoins: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.coin,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  taskDetail: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  boxCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    alignItems: "flex-start",
  },
  boxVisual: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    marginBottom: 14,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  boxText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  galleryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  galleryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  galleryThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },
  galleryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  footer: {
    paddingTop: 10,
    paddingBottom: 4,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  centerCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});