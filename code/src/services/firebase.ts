// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAjn_DTkEbuDNXMs7qdk7OW3JbszmSDN-E",
  authDomain: "campus-docs-plateform.firebaseapp.com",
  projectId: "campus-docs-plateform",
  storageBucket: "campus-docs-plateform.firebasestorage.app",
  messagingSenderId: "592146219638",
  appId: "1:592146219638:web:483ede81dee4e54adb5557"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };