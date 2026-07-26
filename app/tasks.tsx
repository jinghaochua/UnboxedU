import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);

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
      if (activeTaskId) {
        try {
          const completedTask = tasks.find((task) => task.id === activeTaskId);
          const reward = completedTask?.coins ?? 0;

          await Promise.all([
            updateDoc(doc(db, "users", user.uid, "tasks", activeTaskId), {
              status: "completed",
            }),
            updateDoc(doc(db, "users", user.uid), {
              coins: increment(reward),
            }),
          ]);

          setTasks((currentTasks) =>
            currentTasks.map((task) =>
              task.id === activeTaskId
                ? { ...task, status: "completed" }
                : task,
            ),
          );
        } catch (error) {
          console.error(error);
        }
      }

      setActiveTaskId(null);
      setTimeRemaining(0);
      setIsPaused(false);
    };

    finishTimer();
  }, [activeTaskId, timeRemaining, user, tasks]);

  const handleStartFocusSession = (task: Task) => {
    setActiveTaskId(task.id);
    setTimeRemaining(task.durationMinutes / 10); // change to task.durationMinutes * 60 for deployment
    //setTimeRemaining(task.durationMinutes * 60);
    setIsPaused(false);
  };

  const handleStartPomodoroOption = (
    durationMinutes: number,
    label: string,
  ) => {
    setIsPomodoroModalOpen(false);

    if (label === "Focus") {
      if (pendingTasks.length === 0) {
        return;
      }

      const firstPendingTask = pendingTasks[0];
      setActiveTaskId(firstPendingTask.id);
      setTimeRemaining(durationMinutes * 60);
      setIsPaused(false);
      return;
    }

    setActiveTaskId(null);
    setTimeRemaining(durationMinutes * 60);
    setIsPaused(false);
  };

  const handleStopFocusSession = () => {
    setActiveTaskId(null);
    setTimeRemaining(0);
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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Tasks</Text>
          <Text style={styles.title}>What you need to finish</Text>
          <Text style={styles.subtitle}>
            Keep your active tasks visible and move through the rest one by one.
          </Text>
        </View>

        <View style={styles.headerActions}>
          <View style={styles.coinPill}>
            <Text style={styles.coinValue}>{userCoins}</Text>
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
          <Text style={styles.focusTimerLabel}>
            {activeTask ? "Focus session" : "Break session"}
          </Text>
          <Text style={styles.focusTimerValue}>
            {formatTime(timeRemaining)}
          </Text>
          <Text style={styles.focusTimerSubtext}>
            {activeTask
              ? `Working on ${activeTask.title}`
              : "Take a moment to recharge"}
          </Text>

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
        {pendingTasks.map((task) => (
          <PendingTaskRow
            key={task.id}
            task={task}
            onDelete={handleDeleteTask}
            onStart={() => handleStartFocusSession(task)}
          />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Completed tasks</Text>
        <Text style={styles.sectionCount}>{completedTasks.length} done</Text>
      </View>

      <View style={styles.completedList}>
        {completedTasks.map((task) => (
          <CompletedTaskRow
            key={task.id}
            task={task}
            onDelete={handleDeleteTask}
          />
        ))}
      </View>

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
                  style={styles.pomodoroOptionButton}
                  onPress={() =>
                    handleStartPomodoroOption(option.duration, option.label)
                  }
                >
                  <Text style={styles.pomodoroOptionLabel}>{option.label}</Text>
                  <Text style={styles.pomodoroOptionDescription}>
                    {option.description}
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
    </ScrollView>
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
  onDelete,
  onStart,
}: {
  task: { id: string; title: string; durationMinutes: number; coins: number };
  onDelete: (id: string) => void;
  onStart: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <View style={[styles.taskCard, { position: "relative" }]}>
      <View style={styles.taskCheckOpen} />
      <View style={styles.taskCardContent}>
        <Text style={styles.taskFlag}>Active task</Text>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskMeta}>{task.durationMinutes} min</Text>
        <Text style={styles.taskReward}>+{task.coins} coins</Text>
      </View>

      <Pressable style={styles.taskActionButton} onPress={onStart}>
        <Text style={styles.taskActionButtonText}>Start Focus Session</Text>
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerCopy: {
    flex: 1,
  },
  headerActions: {
    gap: 10,
    alignItems: "flex-end",
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
    maxWidth: 260,
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
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createTaskButtonText: {
    color: colors.primaryDark,
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
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
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
  focusTimerActions: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  pomodoroModalContent: {
    backgroundColor: colors.card,
    padding: 20,
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
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  taskMeta: {
    color: colors.textMuted,
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
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
    backgroundColor: colors.card,
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
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  completedDetail: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 14,
  },
  footerButton: {
    marginTop: 4,
    backgroundColor: colors.coin,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  footerButtonText: {
    color: colors.text,
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
  },
});
