

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firestore and Authentication services
const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth };
