import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { collection, getDocs, orderBy, query } from "firebase/firestore";

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
            <Text style={styles.coinValue}>120</Text>
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

            <Pressable style={styles.taskActionButton} onPress={() => {}}>
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
