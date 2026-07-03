import { Redirect, router } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
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
import { db } from "@/lib/firebase";

type GalleryItem = {
  id: string;
  name: string;
  rarity?: string;
  count?: number;
};

export default function GalleryScreen() {
  const { user, loading } = useAuth();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

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
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Gallery</Text>
          <Text style={styles.subtitle}>
            All of the items you’ve unlocked from tasks and mystery boxes.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countLabel}>Collected</Text>
          <Text style={styles.countValue}>{galleryItems.length}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {galleryItems.length > 0 ? (
          galleryItems.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.thumb} />
              <View style={styles.content}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.rarity ?? "Reward"}
                  {typeof item.count === "number" ? ` • x${item.count}` : ""}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            You haven’t unlocked any rewards yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
    gap: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  countBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F2FF",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  countValue: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  content: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
