import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
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
import { auth, db } from "@/lib/firebase";

const seaturtle = require("../assets/images/seaturtle.png");
const mantaray = require("../assets/images/mantaray.png");
const seaotter = require("../assets/images/seaotter.png");
const mascotgirl = require("../assets/images/mascotgirl.png");
const PUFFERFISH_OPEN = require("../assets/images/pufferfish-open.png");
const PUFFERFISH_CLOSED = require("../assets/images/pufferfish-closed.png");

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

const STATS = [
  { value: "12k+", label: "students" },
  { value: "840k", label: "tasks done" },
  { value: "200+", label: "rewards" },
  { value: "14", label: "avg streak" },
];

type GalleryItem = {
  id: string;
  name: string;
  rarity?: string;
  count?: number;
};

export function WebHomepage() {
  const { user, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const floatAnim = useMemo(() => new Animated.Value(0), []);
  const blinkAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  useEffect(() => {
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(3800),
      ]),
    );

    blinkLoop.start();
    return () => blinkLoop.stop();
  }, [blinkAnim]);

  useEffect(() => {
    if (!user) {
      setGalleryItems([]);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "collections"),
      orderBy("lastObtained", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<GalleryItem, "id">),
      }));

      setGalleryItems(items);
    });

    return () => unsubscribe();
  }, [user]);

  const openOpacity = blinkAnim.interpolate({
    inputRange: [0, 0.45, 0.55, 1],
    outputRange: [1, 1, 0, 0],
  });

  const closedOpacity = blinkAnim.interpolate({
    inputRange: [0, 0.45, 0.55, 1],
    outputRange: [0, 0, 1, 1],
  });

  const cockatielMotionStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        }),
      },
      {
        rotate: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["-1deg", "1deg"],
        }),
      },
    ],
  };

  const pufferfishMotionStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        rotate: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["-4deg", "4deg"],
        }),
      },
    ],
  };

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
          <View
            style={[styles.dashboardHero, isWide && styles.dashboardHeroWide]}
          >
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
                  <Text style={styles.primaryBtnText}>Open Mystery Box</Text>
                </Pressable>

                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => router.push("/tasks" as never)}
                >
                  <Text style={styles.primaryBtnText}>Open Tasks</Text>
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

          <SectionBlock
            title="Quick features"
            subtitle="Tap around and jump to the main parts of the app."
          >
            <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
              {FEATURES.map((feature) => (
                <View key={feature.title} style={styles.featureCard}>
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureBody}>{feature.body}</Text>
                </View>
              ))}
            </View>
          </SectionBlock>

          <SectionBlock
            title="Tasks to do"
            subtitle="A simple list you can connect to Firestore later."
            alt
          >
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
          </SectionBlock>

          <SectionBlock
            title="Gallery"
            subtitle="Items you unlock can live here later."
          >
            <View style={styles.galleryCard}>
              {galleryItems.length > 0 ? (
                galleryItems.map((item) => (
                  <View key={item.id} style={styles.galleryRow}>
                    <View style={styles.galleryThumb} />
                    <View style={styles.galleryInfo}>
                      <Text style={styles.galleryText}>{item.name}</Text>
                      <Text style={styles.galleryMeta}>
                        {item.rarity ?? "Reward"}
                        {typeof item.count === "number"
                          ? ` • x${item.count}`
                          : ""}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.galleryEmptyText}>
                  You haven’t unlocked any rewards yet.
                </Text>
              )}
            </View>
          </SectionBlock>
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
              <Text style={styles.badgeText}>Study • Earn • Unbox</Text>
            </View>

            <Text style={[styles.heroTitle, isWide && styles.heroTitleWide]}>
              The fun way{`\n`}to stay on top{`\n`}of your studies
            </Text>

            <Text style={styles.heroSubtitle}>
              Complete tasks, earn coins, and unlock mystery boxes. Learning
              feels a little more worth showing up for.
            </Text>

            <View style={styles.heroActions}>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.primaryBtnText}>Get started</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryBtn}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.secondaryBtnText}>
                  I already have an account
                </Text>
              </Pressable>
            </View>

            <View style={styles.heroMetaRow}>
              {STATS.map((stat) => (
                <View key={stat.label} style={styles.heroMetaItem}>
                  <Text style={styles.heroMetaValue}>{stat.value}</Text>
                  <Text style={styles.heroMetaLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.heroVisual, isWide && styles.heroVisualWide]}>
            <View style={styles.heroMascotArea}>
              <View style={styles.cockatielWrapper}>
                <Animated.Image
                  source={seaturtle}
                  style={[
                    {
                      width: 800,
                      height: 800,
                    },
                    cockatielMotionStyle,
                  ]}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>

        <SectionBlock
          title="Everything you need to stay consistent"
          subtitle="One simple loop that keeps you coming back every day."
          alt
        >
          <View
            style={[styles.splitSection, isWide && styles.splitSectionWide]}
          >
            <View style={styles.splitMain}>
              <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
                {FEATURES.map((feature) => (
                  <View key={feature.title} style={styles.featureCard}>
                    <Text style={styles.featureLabel}>{feature.label}</Text>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureBody}>{feature.body}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.splitAside}>
              <View style={styles.asideMascotCard}>
                <Animated.View style={pufferfishMotionStyle}>
                  <Animated.Image
                    source={PUFFERFISH_OPEN}
                    style={[styles.asidePufferfish, { opacity: openOpacity }]}
                    resizeMode="contain"
                  />
                  <Animated.Image
                    source={PUFFERFISH_CLOSED}
                    style={[
                      StyleSheet.absoluteFill,
                      styles.asidePufferfish,
                      { opacity: closedOpacity },
                    ]}
                    resizeMode="contain"
                  />
                </Animated.View>
              </View>
              <Text style={styles.asideCaption}>
                Puffy is there when you finish a task.
              </Text>
            </View>
          </View>
        </SectionBlock>

        <SectionBlock
          title="Start in four simple steps"
          subtitle="No complicated setup. Just you, your tasks, and a mystery box waiting."
        >
          <View
            style={[styles.splitSection, isWide && styles.splitSectionWide]}
          >
            <View style={styles.splitAside}>
              <View style={styles.asideCockatielCard}>
                <Animated.Image
                  source={seaotter}
                  style={[
                    {
                      width: 280,
                      height: 280,
                    },
                    cockatielMotionStyle,
                  ]}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.asideCaption}>
                Otto reads every guide so you don't have to.
              </Text>
            </View>

            <View style={styles.splitMain}>
              <View style={styles.stepList}>
                {STEPS.map((item) => (
                  <View key={item.step} style={styles.stepCard}>
                    <Text style={styles.stepIndex}>{item.step}</Text>
                    <View style={styles.stepTextWrap}>
                      <Text style={styles.stepTitle}>{item.title}</Text>
                      <Text style={styles.stepBody}>{item.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </SectionBlock>

        <SectionBlock
          title="Build habits that actually stick."
          subtitle="Streaks, coins, and mystery boxes make it easier to keep showing up."
          alt
        >
          <View
            style={[styles.statsSection, isWide && styles.statsSectionWide]}
          >
            <View style={styles.statGrid}>
              {STATS.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>
                    {stat.label.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.statsMascotCard}>
              <Animated.Image
                source={mantaray}
                style={[
                  {
                    width: 220,
                    height: 220,
                  },
                  cockatielMotionStyle,
                ]}
                resizeMode="contain"
              />
              <Text style={styles.asideCaption}>
                Ray is celebrating your streak!
              </Text>
            </View>
          </View>
        </SectionBlock>

        <View style={styles.ctaBand}>
          <View
            style={[styles.ctaBandInner, isWide && styles.ctaBandInnerWide]}
          >
            <View style={styles.ctaBandCopy}>
              <Text style={styles.ctaBandTitle}>
                Ready to unbox your potential?
              </Text>
              <Text style={styles.ctaBandText}>
                Join students who actually look forward to studying every day.
              </Text>
            </View>

            <Pressable
              style={styles.ctaBandButton}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.ctaBandButtonText}>Get started for free</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 UnboxedU</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Privacy</Text>
            <Text style={styles.footerLink}>Terms</Text>
            <Text style={styles.footerLink}>About</Text>
            <Text style={styles.footerLink}>Contact</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionBlock({
  title,
  subtitle,
  alt,
  children,
}: {
  title: string;
  subtitle: string;
  alt?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.sectionWrap, alt && styles.sectionWrapAlt]}>
      <View style={styles.sectionInner}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
        {children}
      </View>
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
        {done ? "Done" : "Open"} - {title}
      </Text>
      <Text style={styles.miniTaskCoins}>+{coins}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  navWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAF0",
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 18,
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
  },
  navWide: {
    paddingHorizontal: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 220,
    height: 68,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navEmail: {
    fontSize: 15,
    color: colors.textMuted,
    maxWidth: 240,
  },
  navGhost: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  navGhostText: {
    fontSize: 16,
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
    paddingBottom: 32,
  },

  hero: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 56,
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
  },
  heroWide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 56,
    paddingHorizontal: 40,
    paddingTop: 72,
    paddingBottom: 72,
  },
  heroCopy: {
    marginBottom: 32,
  },
  heroCopyWide: {
    flex: 1,
    marginBottom: 0,
    maxWidth: 700,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 50,
    marginBottom: 16,
    letterSpacing: -0.7,
  },
  heroTitleWide: {
    fontSize: 62,
    lineHeight: 68,
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.textMuted,
    marginBottom: 28,
    maxWidth: 620,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 26,
  },
  heroMetaItem: {
    minWidth: 90,
  },
  heroMetaValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  heroMetaLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },

  heroVisual: {
    position: "relative",
    minHeight: 320,
    flex: 1,
    overflow: "hidden",
  },
  heroVisualWide: {
    minHeight: 380,
  },
  heroSpeechBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: 22,
  },
  heroSpeechRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  heroSpeechPill: {
    backgroundColor: "#F8F5FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroSpeechPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  heroSpeechMain: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontWeight: "600",
  },
  heroMascotArea: {
    position: "relative",
    minHeight: 600,
  },
  cockatielWrapper: {
    position: "absolute",
    left: 10,
    bottom: -100,
    zIndex: 2,
  },
  pufferfishWrapper: {
    position: "absolute",
    right: 20,
    top: 86,
    zIndex: 3,
  },
  pufferfishImage: {
    width: 180,
    height: 180,
  },

  sectionWrap: {
    width: "100%",
    paddingVertical: 72,
    backgroundColor: "#fff",
  },
  sectionWrapAlt: {
    backgroundColor: "#F5F2FF",
  },
  sectionInner: {
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 40,
  },
  sectionHeader: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 23,
    maxWidth: 760,
  },

  splitSection: {
    gap: 24,
  },
  splitSectionWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  splitMain: {
    flex: 1.4,
  },
  splitAside: {
    flex: 0.8,
    justifyContent: "center",
  },
  asideMascotCard: {
    alignSelf: "center",
    padding: 12,
  },
  asideCockatielCard: {
    alignSelf: "center",
    padding: 12,
  },
  asidePufferfish: {
    width: 220,
    height: 220,
  },
  asideCaption: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },

  cardGrid: {
    gap: 16,
  },
  cardGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minWidth: 240,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  featureBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },

  stepList: {
    gap: 14,
  },
  stepCard: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
  },
  stepIndex: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#F3EEFF",
    color: colors.primary,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "800",
    overflow: "hidden",
    lineHeight: 34,
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },

  statsSection: {
    gap: 20,
  },
  statsSectionWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  statGrid: {
    flex: 1,
    gap: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statCard: {
    width: "48%",
    minWidth: 150,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  statsMascotCard: {
    flex: 0.7,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: "#fff",
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
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  taskCoins: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.coin,
  },
  taskName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  taskDetail: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },

  galleryCard: {
    backgroundColor: "#fff",
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
  galleryInfo: {
    flex: 1,
  },
  galleryText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  galleryMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  galleryEmptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  dashboardHero: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
  },
  dashboardHeroWide: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 24,
    paddingHorizontal: 40,
    paddingTop: 72,
  },
  dashboardCopy: {
    flex: 1,
    marginBottom: 18,
  },
  dashboardTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 50,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  dashboardSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textMuted,
    marginBottom: 26,
    maxWidth: 640,
  },
  dashboardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dashboardPanel: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 22,
    minWidth: 320,
  },
  dashboardPanelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  panelValue: {
    fontSize: 17,
    fontWeight: "800",
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
    fontSize: 14,
    fontWeight: "800",
    color: colors.coin,
  },
  boxCard: {
    backgroundColor: "#fff",
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
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  boxText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 10,
  },
  boxLink: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },

  ctaBand: {
    backgroundColor: "#5B4AE6",
    marginTop: 0,
  },
  ctaBandInner: {
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 36,
    gap: 18,
  },
  ctaBandInnerWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingVertical: 44,
  },
  ctaBandCopy: {
    flex: 1,
  },
  ctaBandTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 40,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  ctaBandText: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.84)",
    maxWidth: 520,
  },
  ctaBandButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.36)",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  ctaBandButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  footer: {
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 40,
    paddingTop: 18,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 14,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 18,
    flexWrap: "wrap",
  },
  footerLink: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
