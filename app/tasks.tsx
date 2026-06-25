import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
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

  useEffect(() => {
    if (!user) {
      setUserCoins(0);
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      setUserCoins(snapshot.exists() ? (snapshot.data()?.coins ?? 0) : 0);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "users", user.uid, "tasks"),
          orderBy("createdAt", "desc"),
        );

        const snapshot = await getDocs(q);

        const loadedTasks: Task[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Task, "id">),
        }));

        setTasks(loadedTasks);
      } catch (error) {
        console.error(error);
      }
    };

    loadTasks();
  }, [user]);

  const pendingTasks = tasks.filter((task) => task.status === "pending");

  const completedTasks = tasks.filter((task) => task.status === "completed");

  const activeTask =
    pendingTasks.find((task) => task.id === activeTaskId) ?? null;

  useEffect(() => {
    if (!activeTaskId || timeRemaining <= 0) {
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
  }, [activeTaskId, timeRemaining]);

  useEffect(() => {
    if (!activeTaskId || timeRemaining > 0 || !user) {
      return;
    }

    const completeTask = async () => {
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
            task.id === activeTaskId ? { ...task, status: "completed" } : task,
          ),
        );
        setActiveTaskId(null);
        setTimeRemaining(0);
      } catch (error) {
        console.error(error);
      }
    };

    completeTask();
  }, [activeTaskId, timeRemaining, user]);

  const handleStartFocusSession = (task: Task) => {
    setActiveTaskId(task.id);
    setTimeRemaining(task.durationMinutes / 10); // change to seconds for testing purposes, in production it should be task.durationMinutes * 60
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
            onPress={() => router.push("/tasks/create")}
          >
            <Text style={styles.createTaskButtonText}>Create task</Text>
          </Pressable>
        </View>
      </View>

      {activeTask && timeRemaining > 0 ? (
        <View style={styles.focusTimerCard}>
          <Text style={styles.focusTimerLabel}>Focus session</Text>
          <Text style={styles.focusTimerValue}>
            {formatTime(timeRemaining)}
          </Text>
          <Text style={styles.focusTimerSubtext}>
            Working on {activeTask.title}
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active tasks</Text>
        <Text style={styles.sectionCount}>{pendingTasks.length} open</Text>
      </View>

      <View style={styles.taskList}>
        {pendingTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskCardContent}>
              <Text style={styles.taskFlag}>Active task</Text>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskMeta}>{task.durationMinutes} min</Text>
              <Text style={styles.taskReward}>+{task.coins} coins</Text>
            </View>

            <Pressable
              style={styles.taskActionButton}
              onPress={() => handleStartFocusSession(task)}
            >
              <Text style={styles.taskActionButtonText}>
                Start Focus Session
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Completed tasks</Text>
        <Text style={styles.sectionCount}>{completedTasks.length} done</Text>
      </View>

      <View style={styles.completedList}>
        {completedTasks.map((task) => (
          <View key={task.title} style={styles.completedCard}>
            <Text style={styles.completedTitle}>{task.title}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.footerButton} onPress={() => router.push("/")}>
        <Text style={styles.footerButtonText}>Back to home</Text>
      </Pressable>
    </ScrollView>
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
    gap: 16,
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
  completedCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
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
});
