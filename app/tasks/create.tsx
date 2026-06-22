import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Redirect } from "expo-router";

import CreateTasks from "@/components/CreateTasks";
import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function CreateTaskRoute() {
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

  return <CreateTasks />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
