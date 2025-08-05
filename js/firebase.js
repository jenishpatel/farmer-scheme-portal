// Initialize Firebase using the global config object from config.js
firebase.initializeApp(window.firebaseConfig);

// Export Firestore and Authentication services
const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth };
