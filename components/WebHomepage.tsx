import { useMemo } from "react";

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

const FEATURES = [
  {
    label: "Tasks",
    title: "Track study work",
    body: "Keep lectures, quizzes, and revision in one place.",
  },
  {
    label: "Coins",
    title: "See your balance",
    body: "Check how many coins you have before opening a box.",
  },
  {
    label: "Boxes",
    title: "Open mystery boxes",
    body: "Spend coins and unlock a random reward.",
  },
  {
    label: "Gallery",
    title: "View collection",
    body: "Store the items you unlock and review them anytime.",
  },
] as const;

const TASKS = [
  {
    title: "Review lecture notes",
    detail: "Finish before dinner",
    coins: 15,
  },
  {
    title: "Complete quiz practice",
    detail: "Try to score above 80%",
    coins: 25,
  },
  {
    title: "Read one chapter",
    detail: "Focus on the key concepts",
    coins: 20,
  },
];

const COLLECTION = ["Starter badge", "Study card", "Rare item"];

export function WebHomepage() {
  const { user, loading } = useAuth();

  const headline = useMemo(() => {
    if (user) return "Welcome back.\nContinue your tasks.";
    return "Study work,\nwith a simple reward system";
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.navWrap}>
        <View style={styles.nav}>
          <Pressable style={styles.logoRow} onPress={() => {}}>
            <View style={styles.logoMark} />
            <Text style={styles.logoText}>UnboxedU</Text>
          </Pressable>

          <View style={styles.navLinks}>
            <Pressable onPress={() => {}}>
              <Text style={styles.navLink}>Features</Text>
            </Pressable>

            {user ? (
              <>
                <Text style={styles.navEmail} numberOfLines={1}>
                  {user.email}
                </Text>
                <Pressable style={styles.navGhost} onPress={() => signOut(auth)}>
                  <Text style={styles.navGhostText}>Log out</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={styles.navGhost}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.navGhostText}>Log in</Text>
                </Pressable>
                <Pressable
                  style={styles.navCta}
                  onPress={() => router.push("/register")}
                >
                  <Text style={styles.navCtaText}>Get started</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {user ? "Signed in" : "Study rewards app"}
              </Text>
            </View>

            <Text style={styles.heroTitle}>{headline}</Text>

            <Text style={styles.heroSubtitle}>
              UnboxedU keeps your tasks, coins, boxes, and collection in one
              place. Finish work, earn coins, and unlock items as you go.
            </Text>

            <View style={styles.heroActions}>
              {user ? (
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => signOut(auth)}
                >
                  <Text style={styles.primaryBtnText}>Log out</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={() => router.push("/register")}
                  >
                    <Text style={styles.primaryBtnText}>Create account</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => router.push("/login")}
                  >
                    <Text style={styles.secondaryBtnText}>Log in</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          <View style={styles.heroVisual}>
            <View style={styles.mockCard}>
              <Text style={styles.mockLabel}>Today</Text>
              <MockTask title="Review lecture notes" coins={15} done />
              <MockTask title="Practice quiz" coins={25} />
              <MockTask title="Read one chapter" coins={20} />
              <View style={styles.mockCoins}>
                <View style={styles.coinDot} />
                <Text style={styles.mockCoinsText}>120 coins</Text>
              </View>
            </View>

            {user ? (
              <View style={styles.mockBox}>
                <View style={styles.boxTop} />
                <Text style={styles.mockBoxLabel}>Mystery box</Text>
              </View>
            ) : null}
          </View>
        </View>

      {!user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What the app does</Text>
          <Text style={styles.sectionSubtitle}>
            Built for students who want a simple way to keep track of study
            tasks and rewards.
          </Text>

          <View style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <View key={feature.title} style={styles.featureCard}>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureBody}>{feature.body}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

        {user ? (
          <>
            <View style={[styles.section, styles.sectionTint]}>
              <Text style={styles.sectionTitle}>Your dashboard</Text>
              <Text style={styles.sectionSubtitle}>
                This is the logged-in view. From here you can jump to the blind
                box screen.
              </Text>

              <View style={styles.dashboardGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Tasks</Text>
                  {TASKS.map((task) => (
                    <View key={task.title} style={styles.taskRow}>
                      <View style={styles.taskTextWrap}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <Text style={styles.taskDetail}>{task.detail}</Text>
                      </View>
                      <Text style={styles.taskCoins}>+{task.coins}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={styles.boxCard}
                  onPress={() => router.push("/mystery")}
                >
                  <View style={styles.boxVisual} />
                  <Text style={styles.boxTitle}>Mystery box</Text>
                  <Text style={styles.boxText}>
                    Tap to open the blind box screen.
                  </Text>
                  <Text style={styles.boxLink}>Open box</Text>
                </Pressable>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Gallery</Text>
                  {COLLECTION.map((item) => (
                    <View key={item} style={styles.galleryRow}>
                      <View style={styles.galleryThumb} />
                      <Text style={styles.galleryText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>

          <View style={styles.steps}>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>01</Text>
              <Text style={styles.stepTitle}>Create an account</Text>
              <Text style={styles.stepBody}>Sign up and set up your profile.</Text>
            </View>

            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>02</Text>
              <Text style={styles.stepTitle}>Complete tasks</Text>
              <Text style={styles.stepBody}>Finish study tasks to earn coins.</Text>
            </View>

            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>03</Text>
              <Text style={styles.stepTitle}>Open boxes</Text>
              <Text style={styles.stepBody}>Use your coins to unlock items.</Text>
            </View>
          </View>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Start building your streak</Text>
          <Text style={styles.ctaSubtitle}>
            Keep your study tasks in one place and use your progress to unlock
            rewards.
          </Text>

          {!user ? (
            <Pressable
              style={styles.ctaBtn}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.ctaBtnText}>Create free account</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerMark} />
          <Text style={styles.footerLogo}>UnboxedU</Text>
          <Text style={styles.footerCopy}>
            Study tasks, coins, boxes, and collections.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MockTask({
  title,
  coins,
  done,
}: {
  title: string;
  coins: number;
  done?: boolean;
}) {
  return (
    <View style={styles.mockTask}>
      <Text style={[styles.mockTaskTitle, done && styles.mockTaskDone]}>
        {done ? "Done" : "Open"} · {title}
      </Text>
      <Text style={styles.mockTaskCoins}>+{coins}</Text>
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
  navWrap: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navLink: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: "500",
    marginRight: 8,
  },
  navEmail: {
    fontSize: 14,
    color: colors.textMuted,
    maxWidth: 180,
  },
  navGhost: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navGhostText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  navCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  navCtaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 56,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  heroCopy: {
    marginBottom: 32,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 42,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted,
    marginBottom: 28,
    maxWidth: 540,
    fontWeight: "400",
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  heroVisual: {
    position: "relative",
    minHeight: 280,
  },
  mockCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  mockLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  mockTask: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mockTaskTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  mockTaskDone: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  mockTaskCoins: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.coin,
  },
  mockCoins: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    backgroundColor: "#FEF3C7",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.coin,
  },
  mockCoinsText: {
    fontWeight: "700",
    color: colors.coin,
    fontSize: 15,
  },
  mockBox: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    minWidth: 120,
  },
  boxTop: {
    width: 30,
    height: 18,
    borderRadius: 5,
    backgroundColor: colors.primaryLight,
    marginBottom: 10,
  },
  mockBoxLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  sectionTint: {
    backgroundColor: colors.primaryLight,
    maxWidth: "100%",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 23,
    maxWidth: 720,
    alignSelf: "center",
  },
  featureGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  featureBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  dashboardGrid: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 3,
  },
  taskDetail: {
    fontSize: 13,
    color: colors.textMuted,
  },
  taskCoins: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.coin,
  },
  boxCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
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
    marginBottom: 12,
  },
  boxLink: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  galleryRow: {
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
  steps: {
    gap: 16,
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  stepCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  cta: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  ctaTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#C7D2FE",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 700,
  },
  ctaBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaBtnText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 48,
    alignItems: "center",
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  footerMark: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginBottom: 10,
  },
  footerLogo: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  footerCopy: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
});