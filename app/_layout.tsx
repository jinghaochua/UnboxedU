import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";

export default function RootLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const onAuthScreen = segments[0] === "login" || segments[0] === "register";

    if (user && onAuthScreen) {
      router.replace("/");
    }
  }, [user, loading, segments, router]);

  return <Stack />;
}
