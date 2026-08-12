import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import CreateTasks from "@/components/CreateTasks";
import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  durationMinutes: number;
  coins: number;
  status: string;
};

export default function TasksScreen() {
  const { user, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;
  const isCompact = width < 680;
  const isSmallNav = width < 560;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      setUserCoins(snapshot.exists() ? (snapshot.data()?.coins ?? 0) : 0);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "tasks"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">),
      }));

      setTasks(loadedTasks);
    });

    return () => unsubscribe();
  }, [user]);

  const pendingTasks = tasks.filter((task) => task.status === "pending");

  const completedTasks = tasks.filter((task) => task.status === "completed");

  async function handleDeleteTask(id: string) {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
      setTasks((current) => current.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  }

  function confirmDeleteTask(id: string) {
    setTaskToDelete(id);
  }

  const activeTask =
    pendingTasks.find((task) => task.id === activeTaskId) ?? null;

  useEffect(() => {
    if (timeRemaining <= 0 || isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((current) => {
        if (current <= 1) {
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isPaused]);

  useEffect(() => {
    if (timeRemaining > 0 || !user) {
      return;
    }

    const finishTimer = async () => {
      const resetFocusState = () => {
        setActiveTaskId(null);
        setTimeRemaining(0);
        setSessionDuration(0);
        setIsPaused(false);
      };

      if (!activeTaskId) {
        resetFocusState();
        return;
      }

      const completedTask = tasks.find((task) => task.id === activeTaskId);

      if (!completedTask || completedTask.status === "completed") {
        resetFocusState();
        return;
      }

      try {
        const reward = completedTask.coins ?? 0;
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.exists() ? userSnapshot.data() : null;
        const currentStreak =
          typeof userData?.streak === "number" ? userData.streak : 0;
        const lastCompletedDate =
          typeof userData?.lastCompletedDate === "string"
            ? userData.lastCompletedDate
            : null;
        const todayKey = new Date().toLocaleDateString("en-CA");

        let nextStreak = 1;

        if (lastCompletedDate === todayKey) {
          nextStreak = currentStreak;
        } else if (lastCompletedDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = yesterday.toLocaleDateString("en-CA");

          nextStreak =
            lastCompletedDate === yesterdayKey ? currentStreak + 1 : 1;
        }

        await Promise.all([
          updateDoc(doc(db, "users", user.uid, "tasks", activeTaskId), {
            status: "completed",
          }),
          updateDoc(userRef, {
            coins: increment(reward),
            streak: nextStreak,
            lastCompletedDate: todayKey,
          }),
        ]);

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === activeTaskId ? { ...task, status: "completed" } : task,
          ),
        );
      } catch (error) {
        console.error(error);
      }

      resetFocusState();
    };

    finishTimer();
  }, [activeTaskId, timeRemaining, user, tasks]);

  const handleStartFocusSession = (task: Task) => {
    const duration = task.durationMinutes * 60;

    setActiveTaskId(task.id);
    setTimeRemaining(duration);
    setSessionDuration(duration);
    setIsPaused(false);
  };

  const handleStartPomodoroOption = (
    durationMinutes: number,
    label: string,
  ) => {
    if (label === "Focus") {
      if (pendingTasks.length === 0) {
        return;
      }

      const firstPendingTask = pendingTasks[0];
      setIsPomodoroModalOpen(false);
      setActiveTaskId(firstPendingTask.id);
      setTimeRemaining(durationMinutes * 60);
      setSessionDuration(durationMinutes * 60);
      setIsPaused(false);
      return;
    }

    setIsPomodoroModalOpen(false);
    setActiveTaskId(null);
    setTimeRemaining(durationMinutes * 60);
    setSessionDuration(durationMinutes * 60);
    setIsPaused(false);
  };

  const handleStopFocusSession = () => {
    setActiveTaskId(null);
    setTimeRemaining(0);
    setSessionDuration(0);
    setIsPaused(false);
  };

  const handleTogglePause = () => {
    setIsPaused((p) => !p);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");

    return `${mins}:${secs}`;
  };

  const timerProgress = sessionDuration
    ? Math.max(0, (timeRemaining / sessionDuration) * 100)
    : 0;

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

  return (
    <View style={styles.page}>
      <View style={styles.navWrap}>
        <View style={[styles.nav, isWide && styles.navWide]}>
          <Pressable onPress={() => router.replace("/")}>
            <Image
              source={require("../assets/images/unboxedu-logo.png")}
              style={[styles.logo, isSmallNav && styles.logoCompact]}
              resizeMode="contain"
            />
          </Pressable>

          {isWide ? (
            <View style={styles.navLinks}>
              <View style={styles.activeNavLink}>
                <Text style={styles.activeNavLinkText}>Tasks</Text>
              </View>
              <Pressable onPress={() => router.push("/mystery" as never)}>
                <Text style={styles.navLink}>Mystery Boxes</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/leaderboard" as never)}>
                <Text style={styles.navLink}>Leaderboard</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.navSpacer} />
          )}

          <Pressable style={styles.homeButton} onPress={() => router.replace("/")}>
            <Text style={styles.homeButtonText}>Back to home</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <View style={[styles.header, isCompact && styles.headerCompact]}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Tasks</Text>
          <Text style={styles.title}>What you need to finish</Text>
          <Text style={styles.subtitle}>
            Keep your active tasks visible and move through the rest one by one.
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.openSummary}>
              <Text style={styles.summaryValue}>{pendingTasks.length}</Text>
              <Text style={styles.summaryLabel}>active</Text>
            </View>
            <View style={styles.doneSummary}>
              <Text style={styles.summaryValue}>{completedTasks.length}</Text>
              <Text style={styles.summaryLabel}>completed</Text>
            </View>
          </View>
        </View>

        <View style={[styles.headerActions, isCompact && styles.headerActionsCompact]}>
          <View style={styles.coinPill}>
            <Text style={styles.coinValue}>{userCoins.toLocaleString()}</Text>
            <Text style={styles.coinLabel}>coins</Text>
          </View>

          <Pressable
            style={styles.createTaskButton}
            onPress={() => setIsCreateModalOpen(true)}
          >
            <Text style={styles.createTaskButtonText}>Create task</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={styles.pomodoroButton}
        onPress={() => setIsPomodoroModalOpen(true)}
      >
        <Text style={styles.pomodoroButtonText}>Open Pomodoro Timer</Text>
      </Pressable>

      {timeRemaining > 0 ? (
        <View style={styles.focusTimerCard}>
          <View style={styles.focusTimerTopRow}>
            <Text style={styles.focusTimerLabel}>
              {activeTask ? "Focus session" : "Break session"}
            </Text>
            <Text style={styles.focusTimerStatus}>
              {isPaused ? "Paused" : "In progress"}
            </Text>
          </View>
          <Text style={styles.focusTimerValue}>
            {formatTime(timeRemaining)}
          </Text>
          <Text style={styles.focusTimerSubtext}>
            {activeTask
              ? `Working on ${activeTask.title}`
              : "Take a moment to recharge"}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${timerProgress}%` as `${number}%` },
              ]}
            />
          </View>

          <View style={styles.focusTimerActions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={handleTogglePause}
            >
              <Text style={styles.secondaryButtonText}>
                {isPaused ? "Resume" : "Pause"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { marginLeft: 8 }]}
              onPress={handleStopFocusSession}
            >
              <Text style={styles.secondaryButtonText}>Stop</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active tasks</Text>
        <Text style={styles.sectionCount}>{pendingTasks.length} open</Text>
      </View>

      <View style={styles.taskList}>
        {pendingTasks.length > 0 ? (
          pendingTasks.map((task) => (
            <PendingTaskRow
              key={task.id}
              task={task}
              isActive={task.id === activeTaskId}
              isCompact={isCompact}
              onDelete={confirmDeleteTask}
              onStart={() => handleStartFocusSession(task)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active tasks</Text>
            <Text style={styles.emptyText}>
              Add your next study task and start earning coins.
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => setIsCreateModalOpen(true)}
            >
              <Text style={styles.emptyButtonText}>Create a task</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable
        style={styles.sectionHeader}
        onPress={() => setShowCompleted((current) => !current)}
      >
        <Text style={styles.sectionTitle}>Completed tasks</Text>
        <Text style={styles.sectionCount}>
          {completedTasks.length} done · {showCompleted ? "Hide" : "Show"}
        </Text>
      </Pressable>

      {showCompleted ? (
        <View style={styles.completedList}>
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <CompletedTaskRow
                key={task.id}
                task={task}
                onDelete={confirmDeleteTask}
              />
            ))
          ) : (
            <View style={styles.emptyStateSmall}>
              <Text style={styles.emptyText}>
                Completed tasks will appear here.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <Pressable
        style={styles.footerButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.footerButtonText}>Back to home</Text>
      </Pressable>

      <Modal
        visible={isPomodoroModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsPomodoroModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.pomodoroModalContent}>
              <Text style={styles.pomodoroModalTitle}>Pomodoro Timer</Text>
              <Text style={styles.pomodoroModalSubtitle}>
                Choose a session length to start.
              </Text>

              {[
                {
                  label: "Focus",
                  duration: 25,
                  description: "Standard 25 min focus",
                },
                {
                  label: "Short Break",
                  duration: 5,
                  description: "5 min short break",
                },
                {
                  label: "Long Break",
                  duration: 15,
                  description: "15 min long break",
                },
              ].map((option) => (
                <Pressable
                  key={option.label}
                  style={[
                    styles.pomodoroOptionButton,
                    option.label === "Focus" &&
                      pendingTasks.length === 0 &&
                      styles.pomodoroOptionDisabled,
                  ]}
                  disabled={
                    option.label === "Focus" && pendingTasks.length === 0
                  }
                  onPress={() =>
                    handleStartPomodoroOption(option.duration, option.label)
                  }
                >
                  <Text style={styles.pomodoroOptionLabel}>{option.label}</Text>
                  <Text style={styles.pomodoroOptionDescription}>
                    {option.label === "Focus" && pendingTasks.length === 0
                      ? "Create an active task first"
                      : option.description}
                  </Text>
                </Pressable>
              ))}

              <Pressable
                style={styles.pomodoroCancelButton}
                onPress={() => setIsPomodoroModalOpen(false)}
              >
                <Text style={styles.pomodoroCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCreateModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <CreateTasks onClose={() => setIsCreateModalOpen(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={taskToDelete !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setTaskToDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteModalTitle}>Delete task?</Text>
            <Text style={styles.deleteModalText}>
              This task will be removed permanently.
            </Text>

            <View style={styles.deleteModalActions}>
              <Pressable
                style={styles.deleteCancelButton}
                onPress={() => setTaskToDelete(null)}
              >
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.deleteConfirmButton}
                onPress={() => {
                  if (taskToDelete) {
                    handleDeleteTask(taskToDelete);
                  }
                  setTaskToDelete(null);
                }}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
}

function CompletedTaskRow({
  task,
  onDelete,
}: {
  task: { id: string; title: string };
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <View style={styles.completedCard}>
      <View style={styles.completedCheckDone}>
        <Text style={styles.completedCheckText}>✓</Text>
      </View>
      <Text style={styles.completedTitle}>{task.title}</Text>
      <Pressable
        style={[styles.deleteButton, hovered && styles.deleteButtonHover]}
        onPress={() => onDelete(task.id)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPressIn={() => setHovered(true)}
        onPressOut={() => setHovered(false)}
      >
        <Text
          style={[
            styles.deleteButtonText,
            hovered && styles.deleteButtonTextHover,
          ]}
        >
          ×
        </Text>
      </Pressable>
    </View>
  );
}

function PendingTaskRow({
  task,
  isActive,
  isCompact,
  onDelete,
  onStart,
}: {
  task: { id: string; title: string; durationMinutes: number; coins: number };
  isActive: boolean;
  isCompact: boolean;
  onDelete: (id: string) => void;
  onStart: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <View
      style={[
        styles.taskCard,
        isActive && styles.activeTaskCard,
        isCompact && styles.taskCardCompact,
      ]}
    >
      <View style={styles.taskCheckOpen} />
      <View style={styles.taskCardContent}>
        <Text style={styles.taskFlag}>
          {isActive ? "Focus in progress" : "Active task"}
        </Text>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskDetails}>
          <Text style={styles.taskMeta}>{task.durationMinutes} min</Text>
          <Text style={styles.taskReward}>+{task.coins} coins</Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.taskActionButton,
          isCompact && styles.taskActionButtonCompact,
          isActive && styles.taskActionButtonActive,
        ]}
        disabled={isActive}
        onPress={onStart}
      >
        <Text style={styles.taskActionButtonText}>
          {isActive ? "Focusing" : "Start focus"}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.deleteButton, hovered && styles.deleteButtonHover]}
        onPress={() => onDelete(task.id)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPressIn={() => setHovered(true)}
        onPressOut={() => setHovered(false)}
      >
        <Text
          style={[
            styles.deleteButtonText,
            hovered && styles.deleteButtonTextHover,
          ]}
        >
          ×
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FAFAFE",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFE",
  },
  navWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8F0",
  },
  nav: {
    width: "100%",
    maxWidth: 1680,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  navWide: {
    paddingHorizontal: 28,
  },
  logo: {
    width: 220,
    height: 68,
  },
  logoCompact: {
    width: 150,
    height: 52,
  },
  navLinks: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },
  navSpacer: {
    flex: 1,
  },
  navLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A8AA3",
  },
  activeNavLink: {
    backgroundColor: "#EEF0FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  activeNavLinkText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#5B4FE8",
  },
  homeButton: {
    backgroundColor: "#F6F6FB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  homeButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#14142B",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FAFAFE",
  },
  content: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    backgroundColor: "#F0EEFF",
    borderRadius: 24,
    padding: 24,
  },
  headerCompact: {
    flexDirection: "column",
  },
  headerCopy: {
    flex: 1,
  },
  headerActions: {
    gap: 10,
    alignItems: "flex-end",
  },
  headerActionsCompact: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 560,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  openSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  doneSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF8EF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  summaryValue: {
    color: "#14142B",
    fontSize: 13,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#7C7C91",
    fontSize: 12,
    fontWeight: "700",
  },
  coinPill: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 92,
    alignItems: "center",
    flexShrink: 0,
  },
  coinValue: {
    color: colors.coin,
    fontSize: 24,
    fontWeight: "900",
  },
  coinLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  createTaskButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  createTaskButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  pomodoroButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  pomodoroButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  focusTimerCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCD8FF",
  },
  focusTimerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  focusTimerLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  focusTimerValue: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "900",
    marginTop: 8,
  },
  focusTimerSubtext: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
  },
  focusTimerStatus: {
    color: "#5B4FE8",
    backgroundColor: "#F0EEFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "800",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8E8F0",
    overflow: "hidden",
    marginTop: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#5B4FE8",
  },
  focusTimerActions: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  pomodoroModalContent: {
    backgroundColor: colors.card,
    padding: 24,
    gap: 12,
  },
  pomodoroModalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  pomodoroModalSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  pomodoroOptionButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pomodoroOptionDisabled: {
    opacity: 0.45,
  },
  pomodoroOptionLabel: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "800",
  },
  pomodoroOptionDescription: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  pomodoroCancelButton: {
    marginTop: 4,
    alignItems: "center",
    paddingVertical: 10,
  },
  pomodoroCancelText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800",
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    position: "relative",
    paddingRight: 48,
  },
  activeTaskCard: {
    backgroundColor: "#F5F3FF",
    borderColor: "#8F85F5",
  },
  taskCardCompact: {
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  taskCardContent: {
    flex: 1,
  },
  taskFlag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  taskReward: {
    color: colors.coin,
    fontSize: 13,
    fontWeight: "800",
  },
  taskTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 25,
    marginTop: 3,
  },
  taskMeta: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  taskDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  taskActionButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 132,
  },
  taskActionButtonCompact: {
    width: "100%",
  },
  taskActionButtonActive: {
    backgroundColor: "#8F85F5",
  },
  taskActionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexGrow: 1,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexGrow: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  completedList: {
    gap: 12,
  },
  taskCheckOpen: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D8D8E4",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  completedCard: {
    backgroundColor: "#FCFCFE",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  completedCheckDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  completedCheckText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 14,
  },
  completedTitle: {
    color: "#7C7C91",
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    textDecorationLine: "line-through",
  },
  completedDetail: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 14,
  },
  footerButton: {
    marginTop: 4,
    backgroundColor: "#F0EEFF",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  footerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  deleteButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 6,
    borderRadius: 8,
  },
  deleteButtonHover: {
    backgroundColor: "#FEE2E2",
  },
  deleteButtonText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "900",
  },
  deleteButtonTextHover: {
    color: "#EF4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    backgroundColor: "#fff",
  },
  deleteModalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  deleteModalTitle: {
    color: "#14142B",
    fontSize: 21,
    fontWeight: "900",
  },
  deleteModalText: {
    color: "#7C7C91",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  deleteCancelButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F6F6FB",
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteCancelButtonText: {
    color: "#14142B",
    fontSize: 14,
    fontWeight: "800",
  },
  deleteConfirmButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteConfirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8F0",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 34,
  },
  emptyStateSmall: {
    alignItems: "center",
    backgroundColor: "#FCFCFE",
    borderRadius: 16,
    padding: 20,
  },
  emptyTitle: {
    color: "#14142B",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    color: "#7C7C91",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#5B4FE8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 16,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
