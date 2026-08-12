import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";

type Reward = {
  id: string;
  name: string;
  rarity: string;
  weight: number;
  banner?: string;
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

export async function openBox(count = 1, banner?: string): Promise<Reward[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const totalCost = count * 50;
  const userRef = doc(db, "users", user.uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);

    if (!snap.exists()) {
      throw new Error("User profile missing");
    }

    const coins = snap.data().coins ?? 0;
    if (coins < totalCost) throw new Error("Not enough coins");

    tx.update(userRef, {
      coins: increment(-totalCost),
      boxesOpened: increment(count),
      xp: increment(10 * count),
    });
  });

  // Check for level ups
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) return;

    const currentXP = snap.data().xp ?? 0;
    const currentLevel = snap.data().level ?? 1;
    const XP_PER_LEVEL = 30;

    const levelsGained = Math.floor(currentXP / XP_PER_LEVEL);

    if (levelsGained > 0) {
      const remainingXP = currentXP % XP_PER_LEVEL;
      tx.update(userRef, {
        level: currentLevel + levelsGained,
        xp: remainingXP,
      });
    }
  });

  const rewardsQuery = banner
    ? query(collection(db, "rewards"), where("banner", "==", banner))
    : collection(db, "rewards");

  const rewardsSnap = await getDocs(rewardsQuery);
  if (rewardsSnap.empty) {
    throw new Error(
      banner ? `No rewards configured for ${banner}` : "No rewards configured",
    );
  }

  const rewards = rewardsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reward[];

  const pulledRewards: Reward[] = [];

  for (let index = 0; index < count; index += 1) {
    const reward = getWeightedRandomReward(rewards);
    const itemRef = doc(db, "users", user.uid, "collections", reward.id);

    await setDoc(
      itemRef,
      {
        id: reward.id,
        name: reward.name,
        rarity: reward.rarity,
        count: increment(1),
        lastObtained: new Date(),
      },
      { merge: true },
    );

    pulledRewards.push(reward);
  }

  return pulledRewards;
}
