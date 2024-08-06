// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeOpuonSBR5u0YjAYJBZ9wlcyFj3p7T8A",
  authDomain: "pantryapphs.firebaseapp.com",
  projectId: "pantryapphs",
  storageBucket: "pantryapphs.appspot.com",
  messagingSenderId: "638816312668",
  appId: "1:638816312668:web:ebf1c2ae6898c750ed3599"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };