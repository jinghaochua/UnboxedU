import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

import { ensureUserProfile } from "@/lib/authService";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await ensureUserProfile(currentUser);
      }
    });
  }, []);

  return {
    user: user ?? null,
    loading: user === undefined,
  };
}
