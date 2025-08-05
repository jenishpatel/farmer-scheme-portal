// This module acts as the data layer for Firestore interactions and state management.
import { db } from './firebase.js';

// --- Exported Functions ---
export {
  // State Management (Getters and Setters)
  getCurrentUser,
  setCurrentUser,
  getCurrentFarmerTab,
  setCurrentFarmerTab,
  getCurrentAdminTab,
  setCurrentAdminTab,
  getApplicationForm,
  setApplicationForm,

  // Firestore Data Fetching
  fetchUsers,
  fetchCrops,
  fetchSchemes,
  fetchApplications,
  fetchNotifications,

  // Firestore Data Manipulation
  addApplication,
  addCrop,
  addScheme,
  addNotification,
  updateApplicationStatus,
  deactivateFarmer,
  markNotificationAsRead
};


// --- State Management (Private variables) ---
let currentUser = null; // Holds user profile data from Firestore
let currentFarmerTab = 'dashboard';
let currentAdminTab = 'applications';
let applicationForm = { schemeId: "", name: "", landSize: "", cropType: "", details: "" };


// --- State Management Functions (Getters and Setters) ---
function getCurrentUser() { return currentUser; }
function setCurrentUser(user) { currentUser = user; }

function getCurrentFarmerTab() { return currentFarmerTab; }
function setCurrentFarmerTab(tab) { currentFarmerTab = tab; }

function getCurrentAdminTab() { return currentAdminTab; }
function setCurrentAdminTab(tab) { currentAdminTab = tab; }

function getApplicationForm() { return applicationForm; }
function setApplicationForm(form) { applicationForm = form; }


// --- Firestore Data Fetching Functions ---

async function fetchUsers() {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fetchCrops() {
    const snapshot = await db.collection('crops').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fetchSchemes() {
    const snapshot = await db.collection('schemes').orderBy('title').get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.deadline && data.deadline.toDate) {
            data.deadline = data.deadline.toDate();
        }
        return { id: doc.id, ...data };
    });
}

async function fetchApplications(userId = null) {
    let query = db.collection('applications');

    if (userId) {
        // For a specific user, just filter. We will sort on the client.
        query = query.where('farmerId', '==', userId);
    } else {
        // For the admin, who gets all documents, we can sort on the server.
        query = query.orderBy('appliedAt', 'desc');
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.appliedAt && data.appliedAt.toDate) {
            data.appliedAt = data.appliedAt.toDate();
        }
        return { id: doc.id, ...data };
    });
}

async function fetchNotifications() {
    const snapshot = await db.collection('notifications').orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.timestamp && data.timestamp.toDate) {
            data.timestamp = data.timestamp.toDate();
        }
        return { id: doc.id, ...data };
    });
}


// --- Firestore Data Manipulation Functions ---

async function addApplication(applicationData) {
    return await db.collection('applications').add({
        ...applicationData,
        appliedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

async function addCrop(cropData) {
    return await db.collection('crops').add(cropData);
}

async function addScheme(schemeData) {
    return await db.collection('schemes').add({
        ...schemeData,
        deadline: firebase.firestore.Timestamp.fromDate(new Date(schemeData.deadline))
    });
}

async function addNotification(notificationData) {
    return await db.collection('notifications').add({
        ...notificationData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

async function updateApplicationStatus(appId, status) {
    return await db.collection('applications').doc(appId).update({ status });
}

async function deactivateFarmer(farmerId) {
    return await db.collection('users').doc(farmerId).delete();
}

async function markNotificationAsRead(notificationId, userId) {
    const notificationRef = db.collection('notifications').doc(notificationId);
    return await notificationRef.update({
        [`isRead.${userId}`]: true
    });
}
