import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export const ensureUserProfile = async (user: User, fullName?: string) => {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return;
  }

  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email ?? "",
      fullName: fullName ?? "",
      coins: 0,
      xp: 0,
      level: 1,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
};

// SIGN UP
export const signUp = async (
  email: string,
  password: string,
  fullName?: string,
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await ensureUserProfile(user, fullName);

  return user;
};

// LOGIN
export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  await ensureUserProfile(userCredential.user);

  return userCredential.user;
};
