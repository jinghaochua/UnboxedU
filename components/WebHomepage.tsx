import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";

const FEATURES = [
  {
    emoji: "✅",
    title: "Study task manager",
    description:
      "Plan lectures, quizzes, and reading sessions. Check them off as you go.",
  },
  {
    emoji: "🪙",
    title: "Coin rewards",
    description:
      "Every completed task earns coins. Stay consistent and watch your balance grow.",
  },
  {
    emoji: "🎁",
    title: "Blind box unboxing",
    description:
      "Spend coins on mystery boxes and discover rare study-themed collectibles.",
  },
  {
    emoji: "🖼️",
    title: "Collection gallery",
    description:
      "Show off your pulls in a personal gallery. Collect them all.",
  },
];

const STEPS = [
  { step: "01", title: "Create your account", body: "Sign up free and set your study goals." },
  { step: "02", title: "Complete study tasks", body: "Earn coins every time you finish a task." },
  { step: "03", title: "Unbox & collect", body: "Open blind boxes and grow your gallery." },
];

export function WebHomepage() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isWide = width >= 900;

  return (
    <View style={styles.page}>
      <View style={styles.navWrap}>
        <View style={[styles.nav, isWide && styles.navWide]}>
          <Pressable onPress={() => {}} style={styles.logoRow}>
            <Text style={styles.logoEmoji}>📦</Text>
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
                <Pressable
                  style={styles.navGhost}
                  onPress={() => signOut(auth)}
                >
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
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View style={[styles.heroCopy, isWide && styles.heroCopyWide]}>
            {user ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Signed in</Text>
              </View>
            ) : (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Gamified studying</Text>
              </View>
            )}

            <Text style={[styles.heroTitle, isWide && styles.heroTitleWide]}>
              {user
                ? "Welcome back,\nready to study?"
                : "Turn studying into\nsomething you unbox"}
            </Text>

            <Text style={styles.heroSubtitle}>
              UnboxedU combines a task manager, coin rewards, blind box openings,
              and a collectible gallery — so every study session feels like a win.
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
                    <Text style={styles.primaryBtnText}>Start for free</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => router.push("/login")}
                  >
                    <Text style={styles.secondaryBtnText}>I have an account</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          <View style={[styles.heroVisual, isWide && styles.heroVisualWide]}>
            <View style={styles.mockCard}>
              <Text style={styles.mockLabel}>Today's tasks</Text>
              <MockTask title="Review lecture notes" coins={15} done />
              <MockTask title="Practice quiz" coins={25} />
              <View style={styles.mockCoins}>
                <Text style={styles.mockCoinsEmoji}>🪙</Text>
                <Text style={styles.mockCoinsText}>120 coins</Text>
              </View>
            </View>
            <View style={[styles.mockBox, isWide && styles.mockBoxFloat]}>
              <Text style={styles.mockBoxEmoji}>🎁</Text>
              <Text style={styles.mockBoxLabel}>Mystery box</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, isWide && styles.sectionWide]}>
          <Text style={styles.sectionTitle}>Everything in one place</Text>
          <Text style={styles.sectionSubtitle}>
            Built for students who want structure, motivation, and a little surprise.
          </Text>
          <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
            {FEATURES.map((feature) => (
              <View key={feature.title} style={styles.featureCard}>
                <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureBody}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.sectionTint, isWide && styles.sectionWide]}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={[styles.steps, isWide && styles.stepsWide]}>
            {STEPS.map((item) => (
              <View key={item.step} style={styles.stepCard}>
                <Text style={styles.stepNumber}>{item.step}</Text>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepBody}>{item.body}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.cta, isWide && styles.ctaWide]}>
          <Text style={styles.ctaTitle}>Ready to unbox your study streak?</Text>
          <Text style={styles.ctaSubtitle}>
            Join UnboxedU and make every completed task count.
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

        <View style={[styles.footer, isWide && styles.sectionWide]}>
          <Text style={styles.footerLogo}>📦 UnboxedU</Text>
          <Text style={styles.footerCopy}>
            Gamified study app — tasks, coins, blind boxes, and collections.
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
        {done ? "✓ " : "○ "}
        {title}
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
  navWide: {
    paddingHorizontal: 32,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoEmoji: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
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
  heroWide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 48,
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  heroCopy: {
    marginBottom: 32,
  },
  heroCopyWide: {
    flex: 1,
    marginBottom: 0,
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
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 44,
    marginBottom: 16,
  },
  heroTitleWide: {
    fontSize: 48,
    lineHeight: 56,
  },
  heroSubtitle: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.textMuted,
    marginBottom: 28,
    maxWidth: 520,
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
  heroVisualWide: {
    flex: 1,
    minHeight: 320,
  },
  mockCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  mockLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  mockCoinsEmoji: {
    fontSize: 16,
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
  mockBoxFloat: {
    right: -12,
    bottom: 24,
  },
  mockBoxEmoji: {
    fontSize: 36,
    marginBottom: 4,
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
  sectionWide: {
    paddingHorizontal: 32,
  },
  sectionTint: {
    backgroundColor: colors.primaryLight,
    maxWidth: "100%",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  featureGrid: {
    gap: 16,
  },
  featureGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minWidth: 240,
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 12,
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
  steps: {
    gap: 16,
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  stepsWide: {
    flexDirection: "row",
    gap: 20,
  },
  stepCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    minWidth: 200,
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
  ctaWide: {
    marginHorizontal: 32,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#C7D2FE",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
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
  footerLogo: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  footerCopy: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
});
