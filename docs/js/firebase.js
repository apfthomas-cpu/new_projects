// docs/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium",
  storageBucket: "cranium-gymnasium.firebasestorage.app",
  messagingSenderId: "330492342452",
  appId: "1:330492342452:web:3770394e816d1e909227e1"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
