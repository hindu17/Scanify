import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQGoH-rInWMaqVehPf1nFrsWaa9X6zO2c",
  authDomain: "scanify-7c308.firebaseapp.com",
  projectId: "scanify-7c308",
  storageBucket: "scanify-7c308.firebasestorage.app",
  messagingSenderId: "228932759056",
  appId: "1:228932759056:web:66968d7c4e5ebcbc3e2495",
  measurementId: "G-DM2SEYHFN4"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);