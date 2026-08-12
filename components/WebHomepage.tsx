import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

import { rewardImages } from "@/constants/rewardImages";
import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";

const seaturtle = require("../assets/images/seaturtle.png");
const mantaray = require("../assets/images/mantaray.png");
const seaotter = require("../assets/images/seaotter.png");
const CHEST_LID = require("../assets/images/chest-lid.png");
const CHEST_BODY = require("../assets/images/chest-body.png");
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
  const showNavLinks = width >= 940;
  const showNavPills = width >= 720;
  const isCompact = width < 560;
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  type Task = {
    id: string;
    title: string;
    coins?: number;
    done?: boolean;
    detail?: string;
    status?: string;
    createdAt?: any;
  };

  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userStreak, setUserStreak] = useState<number>(0);
  const [boxesOpened, setBoxesOpened] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXP, setUserXP] = useState<number>(0);

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

  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "tasks"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          title: data.title ?? data.name ?? "",
          coins: data.coins ?? data.coin ?? 0,
          detail: data.detail ?? data.description ?? "",
          status: data.status,
          createdAt: data.createdAt,
          done: data.status === "completed" || data.done === true,
        } as Task;
      });

      setUserTasks(items as Task[]);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      setUserCoins(snapshot.exists() ? (data?.coins ?? 0) : 0);
      setUserStreak(snapshot.exists() ? (data?.streak ?? 0) : 0);
      setBoxesOpened(snapshot.exists() ? (data?.boxesOpened ?? 0) : 0);
      setUserLevel(snapshot.exists() ? (data?.level ?? 1) : 1);
      setUserXP(snapshot.exists() ? (data?.xp ?? 0) : 0);
    });

    return unsubscribe;
  }, [user]);

  const galleryPreviewItems = galleryItems.slice(0, 3);

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
    const displayName = (user.email?.split("@")[0] ?? "UnboxedU User")
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const incompleteTasksCount = userTasks.filter((task) => !task.done).length;
    const completedTasksCount = userTasks.length - incompleteTasksCount;
    const XP_PER_LEVEL = 30;
    const xpProgress = Math.min((userXP / XP_PER_LEVEL) * 100, 100);
    const xpToNextLevel = Math.max(XP_PER_LEVEL - userXP, 0);

    const stats = [
      {
        label: "Level",
        value: `${userLevel}`,
        cardStyle: styles.loggedInStatCardGreen,
        valueStyle: styles.loggedInStatValueGreen,
      },
      {
        label: "Coins",
        value: `${userCoins.toLocaleString()}`,
        cardStyle: styles.loggedInStatCardGold,
        valueStyle: styles.loggedInStatValueGold,
      },
      {
        label: "Tasks Left",
        value: `${incompleteTasksCount}`,
        cardStyle: styles.loggedInStatCardBlue,
        valueStyle: styles.loggedInStatValueBlue,
      },
      {
        label: "Boxes opened",
        value: `${boxesOpened}`,
        cardStyle: styles.loggedInStatCardPurple,
        valueStyle: styles.loggedInStatValuePurple,
      },
    ];

    const tasks = userTasks;

    return (
      <View style={styles.loggedInPage}>
        <View style={styles.loggedInNavWrap}>
          <View style={[styles.loggedInNav, isWide && styles.loggedInNavWide]}>
            <Pressable
              style={styles.logoRow}
              onPress={() => router.replace("/")}
            >
              <Image
                source={require("../assets/images/unboxedu-logo.png")}
                style={[
                  styles.logoImage,
                  isCompact && styles.loggedInLogoCompact,
                ]}
                resizeMode="contain"
              />
            </Pressable>

            {showNavLinks ? (
              <View style={styles.loggedInNavLinks}>
                <Pressable onPress={() => router.push("/tasks" as never)}>
                  <Text style={styles.loggedInNavLink}>Tasks</Text>
                </Pressable>
                <Pressable onPress={() => router.push("/mystery" as never)}>
                  <Text style={styles.loggedInNavLink}>Mystery Boxes</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push("/leaderboard" as never)}
                >
                  <Text style={styles.loggedInNavLink}>Leaderboard</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.loggedInNavSpacer} />
            )}

            <View style={styles.loggedInNavRight}>
              {showNavPills ? (
                <>
                  <View style={styles.loggedInNavPillGold}>
                    <Text style={styles.loggedInNavPillText}>
                      {userStreak} Day{userStreak === 1 ? "" : "s"} Streak
                    </Text>
                  </View>

                  <View style={styles.loggedInNavPillPurple}>
                    <Text style={styles.loggedInNavPillText}>
                      {userCoins.toLocaleString()} Coins
                    </Text>
                  </View>
                </>
              ) : null}

              {!isCompact ? (
                <Pressable
                  onPress={() => router.push("/profile" as never)}
                  style={({ pressed }) => [
                    styles.loggedInNavAvatar,
                    { opacity: pressed ? 0.7 : 1 } // Simulates activeOpacity={0.7}
                  ]}
                >
                  <Text style={styles.loggedInNavAvatarText}>
                    {(displayName[0] ?? "U").toUpperCase()}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                style={styles.loggedInNavGhost}
                onPress={async () => {
                  await signOut(auth);
                  router.replace("/login");
                }}
              >
                <Text style={styles.loggedInNavGhostText}>Log out</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.loggedInScroll}
          contentContainerStyle={styles.loggedInScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[styles.loggedInHero, isWide && styles.loggedInHeroWide]}
          >
            <View style={styles.loggedInCopy}>
              <View style={styles.loggedInHeader}>
                <View style={styles.loggedInHeaderText}>
                  <Text style={styles.loggedInTitle}>
                    Welcome back, {displayName}
                  </Text>
                  <Text style={styles.loggedInSubtitle}>
                    {incompleteTasksCount > 0
                      ? `You have ${incompleteTasksCount} task${
                          incompleteTasksCount === 1 ? "" : "s"
                        } left. Keep your study streak going.`
                      : "You’re all caught up. Open a mystery box or add a new task."}
                  </Text>
                </View>

                <Image
                  source={require("../assets/images/mascotgirl.png")}
                  style={styles.loggedInMascot}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          <View style={styles.loggedInXpCard}>
            <View style={styles.loggedInXpHeaderRow}>
              <Text style={styles.loggedInXpLabel}>Level {userLevel}</Text>
              <Text style={styles.loggedInXpValue}>
                {userXP}/{XP_PER_LEVEL} XP
              </Text>
            </View>

            <View style={styles.loggedInXpTrack}>
              <View
                style={[styles.loggedInXpFill, { width: `${xpProgress}%` }]}
              />
            </View>

            <Text style={styles.loggedInXpHint}>
              {xpToNextLevel > 0
                ? `${xpToNextLevel} XP to level ${userLevel + 1}`
                : `Level ${userLevel + 1} unlocked!`}
            </Text>
          </View>

          <View
            style={[
              styles.loggedInStatsGrid,
              isWide && styles.loggedInStatsGridWide,
            ]}
          >
            {stats.map((item) => (
              <View
                key={item.label}
                style={[styles.loggedInStatCard, item.cardStyle]}
              >
                <Text style={styles.loggedInStatLabel}>
                  {item.label.toUpperCase()}
                </Text>
                <Text style={[styles.loggedInStatValue, item.valueStyle]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.loggedInMainGrid,
              isWide && styles.loggedInMainGridWide,
            ]}
          >
            <View style={styles.loggedInTasksCard}>
              <View style={styles.loggedInSectionHeader}>
                <Text style={styles.loggedInSectionTitle}>
                  Recently Added Tasks
                </Text>

                <Pressable
                  style={styles.loggedInAddTaskButton}
                  onPress={() => router.push("/tasks" as never)}
                >
                  <Text style={styles.loggedInAddTaskButtonText}>SHOW ALL</Text>
                </Pressable>
              </View>

              <View style={styles.loggedInTaskList}>
                {tasks.length > 0 ? (
                  tasks.slice(0, 3).map((task) => (
                    <Pressable
                      key={task.id}
                      style={styles.loggedInTaskRow}
                      onPress={() => Alert.alert("Task", task.title)}
                    >
                      <View
                        style={[
                          styles.loggedInTaskCheck,
                          task.done
                            ? styles.loggedInTaskCheckDone
                            : styles.loggedInTaskCheckOpen,
                        ]}
                      >
                        {task.done ? (
                          <Text style={styles.loggedInTaskCheckText}>✓</Text>
                        ) : null}
                      </View>

                      <Text
                        style={[
                          styles.loggedInTaskText,
                          task.done && styles.loggedInTaskTextDone,
                        ]}
                        numberOfLines={2}
                      >
                        {task.title}
                      </Text>

                      <Text style={styles.loggedInTaskCoin}>+{task.coins}</Text>
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.loggedInEmptyState}>
                    <Text style={styles.loggedInEmptyTitle}>
                      No tasks added yet
                    </Text>
                    <Text style={styles.loggedInEmptyTaskText}>
                      Add a study task and start earning coins.
                    </Text>
                    <Pressable
                      style={styles.loggedInEmptyButton}
                      onPress={() => router.push("/tasks" as never)}
                    >
                      <Text style={styles.loggedInEmptyButtonText}>
                        CREATE A TASK
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.loggedInBoxCard}>
              <Text style={styles.loggedInSectionTitle}>Mystery box</Text>
              <Text style={styles.loggedInBoxSubtext}>
                Spend your coins and unlock a surprise reward.
              </Text>

              <Pressable
                style={styles.loggedInBoxVisual}
                onPress={() => router.push("/mystery" as never)}
              >
                <Image
                  source={CHEST_BODY}
                  style={styles.loggedInBoxBodyImage}
                  resizeMode="contain"
                />
                <Image
                  source={CHEST_LID}
                  style={styles.loggedInBoxLidImage}
                  resizeMode="contain"
                />
              </Pressable>

              <Text style={styles.loggedInProgressText}>
                {completedTasksCount} of {tasks.length} tasks done
              </Text>
              <Pressable
                style={styles.loggedInShopButton}
                onPress={() => router.push("/mystery" as never)}
              >
                <Text style={styles.loggedInShopButtonText}>
                  VIEW REWARDS SHOP
                </Text>
              </Pressable>
            </View>
          </View>
          <SectionBlock
            title="Gallery"
            subtitle="Items you unlock can live here later."
          >
            <View style={styles.gallerySectionHeader}>
              <Text style={styles.gallerySectionCaption}>
                {galleryItems.length > 0
                  ? `${galleryItems.length} unlocked item${
                      galleryItems.length === 1 ? "" : "s"
                    }`
                  : "No unlocked items yet"}
              </Text>
              <Pressable
                style={styles.galleryShowAllButton}
                onPress={() => router.push("/gallery" as never)}
              >
                <Text style={styles.galleryShowAllButtonText}>SHOW ALL</Text>
              </Pressable>
            </View>

            <View style={styles.galleryCard}>
              {galleryPreviewItems.length > 0 ? (
                galleryPreviewItems.map((item) => (
                  <View key={item.id} style={styles.galleryRow}>
                    <View style={styles.galleryThumb}>
                      {rewardImages[item.id] ? (
                        <Image
                          source={rewardImages[item.id]}
                          style={styles.galleryThumbImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.galleryThumbFallback} />
                      )}
                    </View>
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
                <View style={styles.galleryEmptyState}>
                  <Text style={styles.galleryEmptyTitle}>
                    Your collection is waiting
                  </Text>
                  <Text style={styles.galleryEmptyText}>
                    Open a mystery box to unlock your first reward.
                  </Text>
                  <Pressable
                    style={styles.galleryEmptyButton}
                    onPress={() => router.push("/mystery" as never)}
                  >
                    <Text style={styles.galleryEmptyButtonText}>
                      OPEN MYSTERY BOXES
                    </Text>
                  </Pressable>
                </View>
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
        <View style={styles.loggedInXpCard}>
          <View style={styles.loggedInXpHeaderRow}>
            <Text style={styles.loggedInXpLabel}>Level 1</Text>
            <Text style={styles.loggedInXpValue}>0/30 XP</Text>
          </View>

          <View style={styles.loggedInXpTrack}>
            <View style={[styles.loggedInXpFill, { width: "0%" }]} />
          </View>

          <Text style={styles.loggedInXpHint}>Sign in to start leveling up</Text>
        </View>
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
                Otto reads every guide so you don’t have to.
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
  galleryInfo: {
    flex: 1,
  },
  galleryMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  galleryEmptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  galleryEmptyState: {
    alignItems: "center",
    paddingVertical: 18,
  },
  galleryEmptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 5,
  },
  galleryEmptyButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 14,
  },
  galleryEmptyButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  galleryCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  gallerySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  gallerySectionCaption: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  galleryShowAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  galleryShowAllButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  galleryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  galleryThumb: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    overflow: "hidden",
  },
  galleryThumbImage: {
    width: "100%",
    height: "100%",
  },
  galleryThumbFallback: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  galleryText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
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

  loggedInPage: {
    flex: 1,
    backgroundColor: "#FAFAFE",
  },

  loggedInNavWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8F0",
  },
  loggedInNav: {
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  loggedInNavWide: {
    paddingHorizontal: 28,
  },
  loggedInLogoCompact: {
    width: 150,
    height: 52,
  },
  loggedInNavLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    flex: 1,
    justifyContent: "center",
  },
  loggedInNavSpacer: {
    flex: 1,
  },
  loggedInNavLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A8AA3",
  },
  loggedInNavRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loggedInNavPillGold: {
    backgroundColor: "#FFF3D9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    minWidth: 58,
    alignItems: "center",
  },
  loggedInNavPillPurple: {
    backgroundColor: "#EEF0FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    minWidth: 70,
    alignItems: "center",
  },
  loggedInNavPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#14142B",
  },
  loggedInNavAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#5B4FE8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  loggedInNavAvatarText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  loggedInNavGhost: {
    backgroundColor: "#F6F6FB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loggedInNavGhostText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#14142B",
  },

  loggedInScroll: {
    flex: 1,
  },
  loggedInScrollContent: {
    paddingBottom: 28,
  },

  loggedInHero: {
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    gap: 18,
  },
  loggedInHeroWide: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 20,
    paddingHorizontal: 28,
  },
  loggedInCopy: {
    flex: 1,
  },
  loggedInHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8F0",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 20,
  },
  loggedInHeaderText: {
    flex: 1,
  },
  loggedInTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#14142B",
    lineHeight: 42,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  loggedInSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#7C7C91",
    maxWidth: 520,
  },
  loggedInMascot: {
    width: 170,
    height: 170,
  },
  loggedInXpCard: {
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  loggedInXpHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8F0",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  loggedInXpLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  loggedInXpValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  loggedInXpTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  loggedInXpFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  loggedInXpHint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },

  loggedInStatsGrid: {
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  loggedInStatsGridWide: {
    paddingHorizontal: 28,
  },
  loggedInStatCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 18,
    padding: 18,
  },
  loggedInStatCardGreen: {
    backgroundColor: "#EAF8EF",
  },
  loggedInStatCardGold: {
    backgroundColor: "#FFF3D9",
  },
  loggedInStatCardBlue: {
    backgroundColor: "#EAF4FF",
  },
  loggedInStatCardPurple: {
    backgroundColor: "#F0EEFF",
  },
  loggedInStatLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8A8AA3",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  loggedInStatValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#14142B",
  },
  loggedInStatValueGreen: {
    color: "#16803A",
  },
  loggedInStatValueGold: {
    color: "#A15C00",
  },
  loggedInStatValueBlue: {
    color: "#2563A8",
  },
  loggedInStatValuePurple: {
    color: "#5B4FE8",
  },

  loggedInMainGrid: {
    maxWidth: 1680,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 18,
  },
  loggedInMainGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 28,
  },
  loggedInTasksCard: {
    flex: 1.55,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8F0",
    borderRadius: 24,
    padding: 22,
  },
  loggedInBoxCard: {
    flex: 0.95,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8F0",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },

  loggedInSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  loggedInSectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#14142B",
    marginBottom: 10,
  },
  loggedInAddTaskButton: {
    backgroundColor: "#5B4FE8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  loggedInAddTaskButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  loggedInTaskList: {
    gap: 0,
  },
  loggedInEmptyState: {
    alignItems: "flex-start",
    backgroundColor: "#FAFAFE",
    borderRadius: 16,
    padding: 18,
  },
  loggedInEmptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#14142B",
  },
  loggedInEmptyTaskText: {
    fontSize: 14,
    color: "#7C7C91",
    lineHeight: 20,
    marginTop: 5,
  },
  loggedInEmptyButton: {
    backgroundColor: "#5B4FE8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 14,
  },
  loggedInEmptyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  loggedInTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  loggedInTaskCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  loggedInTaskCheckDone: {
    backgroundColor: "#16A34A",
  },
  loggedInTaskCheckOpen: {
    borderWidth: 2,
    borderColor: "#D8D8E4",
    backgroundColor: "#fff",
  },
  loggedInTaskCheckText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 14,
  },
  loggedInTaskText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#14142B",
    lineHeight: 20,
  },
  loggedInTaskTextDone: {
    color: "#B8B8C5",
    textDecorationLine: "line-through",
  },
  loggedInTaskCoin: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8A5A00",
    backgroundColor: "#FFF3D9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  loggedInBoxSubtext: {
    fontSize: 13,
    color: "#7C7C91",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  loggedInBoxVisual: {
    width: 150,
    height: 112,
    borderRadius: 24,
    backgroundColor: "#FFF3D9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
    overflow: "hidden",
  },
  loggedInBoxBodyImage: {
    position: "absolute",
    width: 116,
    height: 72,
    bottom: 8,
  },
  loggedInBoxLidImage: {
    position: "absolute",
    width: 112,
    height: 56,
    top: 15,
  },
  loggedInProgressText: {
    fontSize: 11,
    color: "#A2A2AF",
    fontWeight: "700",
    marginBottom: 16,
  },
  loggedInShopButton: {
    width: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  loggedInShopButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
