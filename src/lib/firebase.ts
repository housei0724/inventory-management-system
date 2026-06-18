import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDJvxDaCHGY3IXgD9eXU0lyCc5vTcrooeU",
    authDomain: "inventory-app-14768.firebaseapp.com",
    projectId: "inventory-app-14768",
    storageBucket: "inventory-app-14768.firebasestorage.app",
    messagingSenderId: "856844157352",
    appId: "1:856844157352:web:0545e5469c5ab0006add9d"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
