// This module handles all Firebase Authentication logic.
import { auth, db } from './firebase.js';
import { setCurrentUser } from './data.js';
import { logInfo, logError } from './logger.js';

// Handles user registration
async function registerUser(email, password, userData) {
    try {
        logInfo('Attempting user registration', { email });
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Create a user profile document in Firestore
        const profileData = {
            uid: user.uid,
            email: user.email,
            name: userData.name,
            role: userData.role || 'farmer',
            region: userData.region || '',
            cropInterests: userData.cropInterests || []
        };
        await db.collection('users').doc(user.uid).set(profileData);
        logInfo('User registration successful and profile created', { uid: user.uid });
        return user;
    } catch (error) {
        logError('User registration failed', { error });
        throw error; // Re-throw the error to be caught by the UI
    }
}

// Handles user login
async function loginUser(email, password) {
    try {
        logInfo('Attempting user login', { email });
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        logInfo('User login successful', { uid: userCredential.user.uid });
        return userCredential.user;
    } catch (error) {
        logError('User login failed', { email, error });
        throw error;
    }
}

// Handles user logout
async function logoutUser() {
    try {
        const userId = auth.currentUser ? auth.currentUser.uid : 'N/A';
        logInfo('Attempting user logout', { uid: userId });
        await auth.signOut();
        setCurrentUser(null); // Clear the user state
        logInfo('User logout successful');
    } catch (error) {
        logError('User logout failed', { error });
        throw error;
    }
}

// Fetches the user profile from Firestore
async function getUserProfile(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            logInfo('User profile fetched successfully', { uid });
            return userDoc.data();
        } else {
            logError('No user profile found in Firestore', { uid });
            return null;
        }
    } catch (error) {
        logError('Failed to fetch user profile', { uid, error });
        throw error;
    }
}

// Listens for authentication state changes
function onAuthStateChange(callback) {
    return auth.onAuthStateChanged(async (user) => {
        if (user) {
            logInfo('Auth state changed: User is signed in', { uid: user.uid });
            const userProfile = await getUserProfile(user.uid);
            setCurrentUser(userProfile);
            callback(userProfile);
        } else {
            logInfo('Auth state changed: User is signed out');
            setCurrentUser(null);
            callback(null);
        }
    });
}

export { registerUser, loginUser, logoutUser, onAuthStateChange };
