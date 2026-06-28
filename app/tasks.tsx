import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/constants/theme";
import { auth, db } from "@/lib/firebase";

const DURATIONS = [15, 30, 45, 60, 90, 120];
const MAX_COINS = 40;

function coinsForDuration(minutes: number) {
  return Math.min(MAX_COINS, Math.ceil(minutes / 3));
}

export default function CreateTaskScreen() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const coins = duration === null ? 0 : coinsForDuration(duration);

  async function handleCreate() {
    const trimmed = title.trim();

    if (!trimmed) {
      setError("Enter a task title");
      return;
    }

    if (duration === null) {
      setError("Select a duration");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("You're not logged in");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        title: trimmed,
        durationMinutes: duration,
        coins,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      router.back();
    } catch (e) {
      console.log(e);
      setError("Failed to create task");
    }

    setSaving(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>New task</Text>
      <Text style={styles.subheading}>What are you working on?</Text>

      <Text style={styles.label}>Task title</Text>
      <TextInput
        placeholder="e.g. Finish CS1231 tutorial"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (error) setError("");
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused]}
      />

      <Text style={styles.label}>How long will it take?</Text>
      <View style={styles.durationRow}>
        {DURATIONS.map((minutes) => {
          const selected = duration === minutes;

          return (
            <Pressable
              key={minutes}
              onPress={() => {
                setDuration(minutes);
                if (error) setError("");
              }}
              style={[
                styles.durationPill,
                selected && styles.durationPillSelected,
              ]}
            >
              <Text
                style={[
                  styles.durationText,
                  selected && styles.durationTextSelected,
                ]}
              >
                {minutes}m
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.rewardCard}>
        <View style={styles.rewardIconWrap}>
          <Text style={styles.rewardIcon}>🪙</Text>
        </View>
        <View>
          <Text style={styles.rewardLabel}>You'll earn</Text>
          <Text style={styles.rewardCoins}>{coins > 0 ? `${coins} coins` : "—"}</Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.createButton, saving && styles.createButtonDisabled]}
        onPress={handleCreate}
        disabled={saving}
      >
        <Text style={styles.createButtonText}>
          {saving ? "Saving…" : "Create task"}
        </Text>
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
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  subheading: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 26,
    color: colors.text,
    fontSize: 15,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 26,
  },
  durationPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  durationPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  durationTextSelected: {
    color: "#fff",
  },
  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FAEEDA",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  rewardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardIcon: {
    fontSize: 20,
  },
  rewardLabel: {
    color: "#854F0B",
    fontSize: 11,
    fontWeight: "700",
  },
  rewardCoins: {
    color: "#412402",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
    textAlign: "center",
  },
  createButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});