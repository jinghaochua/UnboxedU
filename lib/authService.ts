import { auth, db } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

// SIGN UP
export const signUp = async (email: string, password: string) => {
  console.log("SIGNUP STARTED");
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  console.log("AUTH CREATED USER");

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    coins: 0,
    xp: 0,
    level: 1,
    createdAt: serverTimestamp(),
  });

  console.log("FIRESTORE CREATED USER");

  return user;
};

// LOGIN
export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
};
