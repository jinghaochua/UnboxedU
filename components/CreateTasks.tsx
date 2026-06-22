import { useState } from "react";

import { colors } from "@/constants/theme";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function CreateTaskScreen() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number | null>(null);

  const coins = duration ? Math.min(40, Math.ceil(duration / 3)) : 0;

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    if (!duration) {
      alert("Please select a duration");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("Not logged in");
      return;
    }

    const coins = Math.min(40, Math.ceil(duration / 3));

    try {
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        title: title.trim(),
        durationMinutes: duration,
        coins,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("Task created");
    } catch (error) {
      console.error(error);
      alert("Failed to create task");
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Task</Text>

      <Text style={styles.label}>Task Title</Text>

      <TextInput
        placeholder="e.g. Finish CS1231 Tutorial"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <Text style={styles.label}>Duration</Text>

      <View style={styles.durationContainer}>
        {DURATIONS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setDuration(item)}
            style={[
              styles.durationButton,
              duration === item && styles.durationButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.durationText,
                duration === item && styles.durationTextSelected,
              ]}
            >
              {item} min
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.rewardCard}>
        <Text style={styles.rewardLabel}>Reward</Text>
        <Text style={styles.rewardCoins}>{coins} Coins</Text>
      </View>

      <Pressable style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Create Task</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    color: colors.text,
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  durationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    color: colors.text,
    fontWeight: "700",
  },
  durationTextSelected: {
    color: "#fff",
  },
  rewardCard: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    alignItems: "center",
  },
  rewardLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  rewardCoins: {
    color: colors.coin,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  createButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
