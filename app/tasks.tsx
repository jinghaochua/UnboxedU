import { Redirect, router } from "expo-router";
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

const ACTIVE_TASK = {
  title: "Finish CS1231 Tutorial",
  duration: "60 min",
  coins: 20,
};

const COMPLETED_TASKS = [
  { title: "Review lecture notes", detail: "Completed 2 hours ago" },
  { title: "Practice quiz questions", detail: "Completed yesterday" },
  { title: "Read one chapter", detail: "Completed this morning" },
];

export default function TasksScreen() {
  const { user, loading } = useAuth();

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
        <View>
          <Text style={styles.eyebrow}>Tasks</Text>
          <Text style={styles.title}>What you need to finish</Text>
          <Text style={styles.subtitle}>Keep the active task visible and move through the rest one by one.</Text>
        </View>

        <View style={styles.coinPill}>
          <Text style={styles.coinValue}>120</Text>
          <Text style={styles.coinLabel}>coins</Text>
        </View>
      </View>

      <View style={styles.primaryCard}>
        <View style={styles.primaryCardTop}>
          <Text style={styles.taskFlag}>Active task</Text>
          <Text style={styles.taskReward}>+{ACTIVE_TASK.coins} coins</Text>
        </View>

        <Text style={styles.taskTitle}>{ACTIVE_TASK.title}</Text>
        <Text style={styles.taskMeta}>{ACTIVE_TASK.duration}</Text>

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryButton} onPress={() => {}}>
            <Text style={styles.primaryButtonText}>Start Focus Session</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => {}}>
            <Text style={styles.secondaryButtonText}>Create task</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Completed tasks</Text>
        <Text style={styles.sectionCount}>{COMPLETED_TASKS.length} done</Text>
      </View>

      <View style={styles.completedList}>
        {COMPLETED_TASKS.map((task) => (
          <View key={task.title} style={styles.completedCard}>
            <Text style={styles.completedTitle}>{task.title}</Text>
            <Text style={styles.completedDetail}>{task.detail}</Text>
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
  primaryCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
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