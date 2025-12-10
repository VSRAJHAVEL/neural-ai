import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBU-YZdFN89Bbqgrl6mN6VljbHQ9XnV_VI",
  authDomain: "hackathon-2e5ff.firebaseapp.com",
  projectId: "hackathon-2e5ff",
  storageBucket: "hackathon-2e5ff.firebasestorage.app",
  messagingSenderId: "979752525194",
  appId: "1:979752525194:web:001f56725107791da27c73",
  measurementId: "G-C3ERS1QW65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
