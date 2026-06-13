import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

type Reward = {
  id: string;
  name: string;
  rarity: string;
  weight: number;
};

function getWeightedRandomReward(rewards: Reward[]): Reward {
  const totalWeight = rewards.reduce(
    (sum, r) => sum + Number(r.weight ?? 0),
    0,
  );

  let random = Math.random() * totalWeight;

  for (const reward of rewards) {
    const weight = Number(reward.weight ?? 0);

    random -= weight;

    if (random <= 0) {
      return reward;
    }
  }

  return rewards[rewards.length - 1];
}

export async function openBox(): Promise<Reward> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? null,
      coins: 0,
      xp: 0,
      level: 1,
    });

    throw new Error(
      "Your user profile was missing. It has been recreated with zero coins. Earn coins before opening a box.",
    );
  }

  const coins = userSnap.data()?.coins ?? 0;
  if (coins < 50) throw new Error("Not enough coins");

  await runTransaction(db, async (transaction) => {
    const freshSnap = await transaction.get(userRef);
    const freshCoins = freshSnap.data()?.coins ?? 0;

    if (freshCoins < 50) {
      throw new Error("Not enough coins");
    }

    transaction.update(userRef, {
      coins: increment(-50),
    });
  });

  const rewardsSnap = await getDocs(collection(db, "rewards"));

  const rewards: Reward[] = rewardsSnap.docs.map((doc) => {
    const data = doc.data() as Omit<Reward, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });

  const reward = getWeightedRandomReward(rewards);

  await addDoc(collection(db, "collections", user.uid, "items"), reward);

  return reward;
}
