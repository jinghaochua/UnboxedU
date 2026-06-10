import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text, useWindowDimensions, View
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
    title: "Earn rewards",
    body: "Complete tasks to build up coins for blind boxes.",
  },
  {
    label: "Boxes",
    title: "Open mystery boxes",
    body: "Spend coins and get a random study-themed reward.",
  },
  {
    label: "Gallery",
    title: "Save your items",
    body: "Store everything you unlock and review it later.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Create an account",
    body: "Sign up and set up your profile.",
  },
  {
    step: "2",
    title: "Complete tasks",
    body: "Finish study tasks to earn coins.",
  },
  {
    step: "3",
    title: "Open boxes",
    body: "Use your coins to unlock items.",
  },
  {
    step: "4",
    title: "Collect and repeat",
    body: "Keep going and build your collection over time.",
  },
];

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

const COLLECTION = ["Starter badge", "Study card", "Rare item"];

export function WebHomepage() {
  const { user, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 960;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.page}>
        <View style={styles.navWrap}>
          <View style={[styles.nav, isWide && styles.navWide]}>
            <Pressable style={styles.logoRow} onPress={() => {}}>
              <Image
                source={require("../assets/images/unboxedu-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Pressable>

            <View style={styles.navLinks}>
              <Text style={styles.navEmail} numberOfLines={1}>
                {user.email}
              </Text>

              <Pressable style={styles.navGhost} onPress={() => signOut(auth)}>
                <Text style={styles.navGhostText}>Log out</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.dashboardHero, isWide && styles.dashboardHeroWide]}>
            <View style={styles.dashboardCopy}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Signed in</Text>
              </View>

              <Text style={styles.dashboardTitle}>
                Welcome back.{`\n`}Continue your tasks.
              </Text>

              <Text style={styles.dashboardSubtitle}>
                Keep your study work, coins, and box opening in one place.
              </Text>

              <View style={styles.dashboardActions}>
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => router.push("/mystery")}
                >
                  <Text style={styles.primaryBtnText}>Open mystery box</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => signOut(auth)}
                >
                  <Text style={styles.secondaryBtnText}>Log out</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.dashboardPanel}>
              <View style={styles.dashboardPanelTop}>
                <Text style={styles.panelLabel}>Today</Text>
                <Text style={styles.panelValue}>120 coins</Text>
              </View>

              <View style={styles.miniTaskList}>
                <MiniTask title="Review lecture notes" coins={15} done />
                <MiniTask title="Practice quiz" coins={25} />
                <MiniTask title="Read one chapter" coins={20} />
              </View>

              <Pressable
                style={styles.boxCard}
                onPress={() => router.push("/mystery")}
              >
                <View style={styles.boxVisual}>
                  <View style={styles.boxLid} />
                  <View style={styles.boxBody} />
                </View>
                <Text style={styles.boxTitle}>Mystery box</Text>
                <Text style={styles.boxText}>
                  Tap to open the blind box screen.
                </Text>
                <Text style={styles.boxLink}>Open box</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick features</Text>
            <Text style={styles.sectionSubtitle}>
              Tap around and jump to the main parts of the app.
            </Text>

            <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
              {FEATURES.map((feature) => (
                <View key={feature.title} style={styles.featureCard}>
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureBody}>{feature.body}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks to do</Text>
            <Text style={styles.sectionSubtitle}>
              A simple list you can connect to Firestore later.
            </Text>

            <View style={styles.taskList}>
              {TASKS.map((task) => (
                <View key={task.title} style={styles.taskCard}>
                  <View style={styles.taskTopRow}>
                    <Text style={styles.taskStatus}>{task.status}</Text>
                    <Text style={styles.taskCoins}>+{task.coins} coins</Text>
                  </View>

                  <Text style={styles.taskName}>{task.title}</Text>
                  <Text style={styles.taskDetail}>{task.detail}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <Text style={styles.sectionSubtitle}>
              Items you unlock can live here later.
            </Text>

            <View style={styles.galleryCard}>
              {COLLECTION.map((item) => (
                <View key={item} style={styles.galleryRow}>
                  <View style={styles.galleryThumb} />
                  <Text style={styles.galleryText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.navWrap}>
        <View style={[styles.nav, isWide && styles.navWide]}>
          <Pressable style={styles.logoRow} onPress={() => {}}>
            <Image
              source={require("../assets/images/unboxedu-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable
            style={styles.navCta}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.navCtaText}>Try UnboxedU</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View style={[styles.heroCopy, isWide && styles.heroCopyWide]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NUS ORBITAL PROJECT</Text>
            </View>

            <Text style={[styles.heroTitle, isWide && styles.heroTitleWide]}>
              Study more.{`\n`}Earn rewards.{`\n`}Unbox surprises.
            </Text>

            <Text style={styles.heroSubtitle}>
              UnboxedU turns study tasks into a simple reward loop. Finish work,
              earn coins, and unlock things as you go.
            </Text>

            <View style={styles.heroActions}>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.primaryBtnText}>Get Started</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryBtn}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.secondaryBtnText}>Log in</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.heroVisual, isWide && styles.heroVisualWide]}>
            <View style={styles.heroArtCard}>
              <View style={styles.heroArtTopRow}>
                <View style={styles.heroOrb} />
                <View style={styles.heroOrbSmall} />
              </View>

              <View style={styles.heroChestWrap}>
                <View style={styles.heroChestGlow} />
                <View style={styles.heroChest} />
                <View style={styles.heroChestLid} />
              </View>

              <View style={styles.heroArtBottomRow}>
                <View style={styles.heroStack}>
                  <View style={styles.heroStackBook} />
                  <View style={styles.heroStackBook2} />
                  <View style={styles.heroStackBook3} />
                </View>

                <View style={styles.heroCup} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.featureStrip}>
          <View style={styles.stripCard}>
            <Text style={styles.stripTitle}>Task Manager</Text>
            <Text style={styles.stripText}>
              Organize and track your study tasks easily.
            </Text>
          </View>
          <View style={styles.stripCard}>
            <Text style={styles.stripTitle}>Earn Coins</Text>
            <Text style={styles.stripText}>
              Complete tasks and build up your balance.
            </Text>
          </View>
          <View style={styles.stripCard}>
            <Text style={styles.stripTitle}>Blind Boxes</Text>
            <Text style={styles.stripText}>
              Spend coins to open random rewards.
            </Text>
          </View>
          <View style={styles.stripCard}>
            <Text style={styles.stripTitle}>Collection</Text>
            <Text style={styles.stripText}>
              Save the items you unlock and show them off.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
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

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Start building your streak</Text>
          <Text style={styles.ctaSubtitle}>
            Keep your study tasks in one place and use your progress to unlock
            rewards.
          </Text>

          <Pressable
            style={styles.ctaBtn}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.ctaBtnText}>Create free account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function MiniTask({
  title,
  coins,
  done,
}: {
  title: string;
  coins: number;
  done?: boolean;
}) {
  return (
    <View style={styles.miniTask}>
      <Text style={[styles.miniTaskTitle, done && styles.miniTaskDone]}>
        {done ? "Done" : "Open"} · {title}
      </Text>
      <Text style={styles.miniTaskCoins}>+{coins}</Text>
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
  navWide: {
    paddingHorizontal: 32,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 180,
    height: 56,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    borderWidth: 1,
    borderColor: colors.border,
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
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 42,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  heroTitleWide: {
    fontSize: 46,
    lineHeight: 54,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted,
    marginBottom: 28,
    maxWidth: 540,
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
    flex: 1,
  },
  heroVisualWide: {
    minHeight: 360,
  },
  heroArtCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    minHeight: 320,
    justifyContent: "space-between",
  },
  heroArtTopRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  heroOrb: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#f8e18a",
    opacity: 0.95,
  },
  heroOrbSmall: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#d9cbff",
    marginTop: 16,
  },
  heroChestWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
  },
  heroChestGlow: {
    position: "absolute",
    width: 180,
    height: 80,
    borderRadius: 999,
    backgroundColor: "#f6d88f",
    opacity: 0.35,
    bottom: 14,
  },
  heroChest: {
    width: 170,
    height: 110,
    borderRadius: 16,
    backgroundColor: "#b57a30",
    borderWidth: 6,
    borderColor: "#e4b04e",
  },
  heroChestLid: {
    position: "absolute",
    width: 180,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#d3942f",
    top: -14,
    borderWidth: 6,
    borderColor: "#e4b04e",
  },
  heroArtBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
  },
  heroStack: {
    width: 120,
    height: 96,
    justifyContent: "flex-end",
  },
  heroStackBook: {
    width: 100,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#8aa7d4",
    marginBottom: 6,
  },
  heroStackBook2: {
    width: 108,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#c1b6a6",
    marginBottom: 6,
  },
  heroStackBook3: {
    width: 116,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#6b8ac9",
  },
  heroCup: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#c5c5c5",
    backgroundColor: "#f7f7f7",
    marginBottom: 2,
  },
  featureStrip: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  stripCard: {
    flex: 1,
    minWidth: 210,
    padding: 14,
    borderRadius: 18,
  },
  stripTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  stripText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 44,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 22,
    lineHeight: 23,
    maxWidth: 720,
  },
  featureGrid: {
    gap: 16,
  },
  featureGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
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
  steps: {
    gap: 16,
  },
  stepsWide: {
    flexDirection: "row",
    gap: 18,
  },
  stepCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
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
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 36,
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
  dashboardHero: {
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 26,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  dashboardHeroWide: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 18,
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  dashboardCopy: {
    flex: 1,
    marginBottom: 18,
  },
  dashboardTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 42,
    marginBottom: 14,
    letterSpacing: -0.4,
  },
  dashboardSubtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: colors.textMuted,
    marginBottom: 24,
    maxWidth: 560,
  },
  dashboardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dashboardPanel: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    minWidth: 280,
  },
  dashboardPanelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  panelValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.coin,
  },
  miniTaskList: {
    marginBottom: 14,
  },
  miniTask: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  miniTaskTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  miniTaskDone: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  miniTaskCoins: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.coin,
  },
  boxCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
  },
  boxVisual: {
    width: 68,
    height: 68,
    marginBottom: 14,
    position: "relative",
  },
  boxLid: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
  },
  boxBody: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    opacity: 0.85,
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
    marginBottom: 10,
  },
  boxLink: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
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
  taskName: {
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
  galleryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    gap: 12,
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
});