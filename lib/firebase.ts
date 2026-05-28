import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAaPZ50t7oc-NOUEKapwHfKWqwmfaaghjE",
  authDomain: "unboxedu.firebaseapp.com",
  projectId: "unboxedu",
  storageBucket: "unboxedu.firebasestorage.app",
  messagingSenderId: "153090787576",
  appId: "1:153090787576:web:4cdabbd590731b2d02130d",
  measurementId: "G-T9PVDZKRV8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
