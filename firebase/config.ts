import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCIuEDkq-t0zWT6Cu_UOUl9fySHduMFo5s",
  authDomain: "tests-372d3.firebaseapp.com",
  projectId: "tests-372d3",
  storageBucket: "tests-372d3.firebasestorage.app",
  messagingSenderId: "989519459103",
  appId: "1:989519459103:web:c937945f7ccd4876ef762a",
  measurementId: "G-EK9MCVVT2J",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics is optional; ignore unsupported environments.
    });
}