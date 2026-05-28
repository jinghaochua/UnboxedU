import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return {
    user: user ?? null,
    loading: user === undefined,
  };
}
