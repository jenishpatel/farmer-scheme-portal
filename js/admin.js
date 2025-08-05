// This module handles rendering all content for the Admin dashboard.

import { showToast, showConfirmModal, showModal, debounce } from './ui.js';
import {
    fetchUsers, fetchCrops, fetchSchemes, fetchApplications,
    getCurrentAdminTab, setCurrentAdminTab,
    addCrop, addScheme, addNotification, updateApplicationStatus, deactivateFarmer
} from './data.js';
import { logInfo, logError } from './logger.js';

let adminDashboardMainContentArea = null;

export async function renderAdminDashboardContent() {
    const appContainer = document.getElementById('app');

    if (!adminDashboardMainContentArea) {
        adminDashboardMainContentArea = document.createElement('main');
        adminDashboardMainContentArea.id = "admin-dashboard-main-content-area";
        adminDashboardMainContentArea.className = "flex-1 max-w-7xl mx-auto p-6 md:p-8 space-y-10";
        appContainer.appendChild(adminDashboardMainContentArea);
    }
    adminDashboardMainContentArea.innerHTML = '<div class="spinner-main"></div>';

    const currentTab = getCurrentAdminTab();
    logInfo(`Rendering admin dashboard for tab: ${currentTab}`);

    try {
        const headerCard = await createHeader();
        
        let contentDiv;
        switch (currentTab) {
            case 'user-management':
                contentDiv = await renderUserManagement();
                break;
            case 'crops':
                contentDiv = await renderManageCrops();
                break;
            case 'schemes':
                contentDiv = await renderManageSchemes();
                break;
            case 'notifications':
                contentDiv = await renderSendNotificationsForm();
                break;
            default:
                contentDiv = await renderApplicationsManagement();
        }

        adminDashboardMainContentArea.innerHTML = ''; // Clear spinner
        adminDashboardMainContentArea.appendChild(headerCard);
        const tabsComponent = createTabs();
        adminDashboardMainContentArea.appendChild(tabsComponent.tabsDiv);
        tabsComponent.tabsContentContainer.appendChild(contentDiv);

    } catch (error) {
        logError(`Error rendering admin tab: ${currentTab}`, { error });
        adminDashboardMainContentArea.innerHTML = `<p class="text-red-500">Error loading data. Please try again later.</p>`;
        showToast("Could not load data.", "error");
    }
}

// --- Component Creation Functions ---

async function createHeader() {
    const headerCard = document.createElement('div');
    headerCard.className = "bg-gradient-to-r from-sky-600 to-indigo-700 rounded-xl p-8 text-white shadow-xl";
    
    const [applications, users, crops, schemes] = await Promise.all([
        fetchApplications(),
        fetchUsers(),
        fetchCrops(),
        fetchSchemes()
    ]);

    const totalPending = applications.filter(a => a.status === "pending").length;
    const totalApproved = applications.filter(a => a.status === "approved").length;
    const totalRejected = applications.filter(a => a.status === "rejected").length;
    const totalApplications = applications.length;
    const totalFarmers = users.filter(u => u.role === 'farmer').length;

    headerCard.innerHTML = `
        <h1 class="text-4xl font-extrabold mb-3">Admin Dashboard</h1>
        <p class="text-blue-100 text-xl font-light mb-8">Oversee operations and manage platform data.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div class="bg-white/20 rounded-lg p-5 backdrop-blur-sm"><div class="flex items-center space-x-4"><i class="fas fa-users h-9 w-9 text-white"></i><div><p class="text-sm opacity-90">Total Users</p><p class="text-3xl font-bold">${totalFarmers}</p></div></div></div>
            <div class="bg-white/20 rounded-lg p-5 backdrop-blur-sm"><div class="flex items-center space-x-4"><i class="fas fa-seedling h-9 w-9 text-white"></i><div><p class="text-sm opacity-90">Total Crops</p><p class="text-3xl font-bold">${crops.length}</p></div></div></div>
            <div class="bg-white/20 rounded-lg p-5 backdrop-blur-sm"><div class="flex items-center space-x-4"><i class="fas fa-file-alt h-9 w-9 text-white"></i><div><p class="text-sm opacity-90">Active Schemes</p><p class="text-3xl font-bold">${schemes.filter(s => s.status === "active").length}</p></div></div></div>
            <div class="bg-white/20 rounded-lg p-5 backdrop-blur-sm"><div class="flex items-center space-x-4"><i class="fas fa-clock h-9 w-9 text-white"></i><div><p class="text-sm opacity-90">Pending Apps</p><p class="text-3xl font-bold">${totalPending}</p></div></div></div>
        </div>
        <div class="mt-10 text-white">
            <h3 class="text-2xl font-bold mb-5">Application Status Overview</h3>
            <div class="bar-chart-container w-full max-w-2xl mx-auto">
                <div class="bar pending" style="height: ${Math.max(15, (totalPending / (totalApplications || 1)) * 100)}%;"><span class="bar-value">${totalPending}</span><span class="bar-label">Pending</span></div>
                <div class="bar approved" style="height: ${Math.max(15, (totalApproved / (totalApplications || 1)) * 100)}%;"><span class="bar-value">${totalApproved}</span><span class="bar-label">Approved</span></div>
                <div class="bar rejected" style="height: ${Math.max(15, (totalRejected / (totalApplications || 1)) * 100)}%;"><span class="bar-value">${totalRejected}</span><span class="bar-label">Rejected</span></div>
            </div>
        </div>
    `;
    return headerCard;
}

function createTabs() {
    const tabsDiv = document.createElement('div');
    tabsDiv.className = "space-y-8";
    const tabsList = document.createElement('div');
    tabsList.className = "tabs-list flex flex-wrap justify-center sm:justify-start w-full";
    tabsList.innerHTML = `
        <button class="tabs-trigger" data-value="applications">Applications</button>
        <button class="tabs-trigger" data-value="user-management">User Management</button>
        <button class="tabs-trigger" data-value="crops">Add Crop Information</button>
        <button class="tabs-trigger" data-value="schemes">Add Government Scheme</button>
        <button class="tabs-trigger" data-value="notifications">Send Notifications</button>
    `;

    const tabsContentContainer = document.createElement('div');
    tabsContentContainer.id = "admin-tabs-content-container";
    tabsDiv.appendChild(tabsList);
    tabsDiv.appendChild(tabsContentContainer);

    const currentTab = getCurrentAdminTab();
    tabsList.querySelectorAll('.tabs-trigger').forEach(trigger => {
        if (trigger.dataset.value === currentTab) {
            trigger.setAttribute('data-state', 'active');
        }
        trigger.onclick = (e) => {
            setCurrentAdminTab(e.target.dataset.value);
            renderAdminDashboardContent();
        };
    });

    return { tabsDiv, tabsContentContainer };
}

// --- Tab Content Rendering Functions ---

async function renderApplicationsManagement() {
    logInfo('Fetching applications for admin view');
    const applications = await fetchApplications();
    logInfo(`Found ${applications.length} total applications`);
    const contentDiv = document.createElement('div');
    contentDiv.className = "card p-8";

    contentDiv.innerHTML = `
        <h2 class="text-3xl font-bold mb-8">Farmer Applications</h2>
        <div class="overflow-x-auto">
            <table class="table min-w-full">
                <thead><tr><th>Farmer</th><th>Scheme</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="admin-applications-table-body"></tbody>
            </table>
        </div>
        ${applications.length === 0 ? '<p class="text-center text-gray-500 mt-6">No applications received yet.</p>' : ''}
    `;

    const tableBody = contentDiv.querySelector('#admin-applications-table-body');
    applications.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.farmerName}</td>
            <td>${app.schemeName}</td>
            <td>${app.appliedAt.toLocaleDateString()}</td>
            <td><span class="badge ${app.status === 'approved' ? 'badge-default' : app.status === 'rejected' ? 'badge-destructive' : 'badge-secondary'}">${app.status}</span></td>
            <td>
                ${app.status === 'pending' ? `
                    <button class="btn btn-primary btn-sm approve-btn" data-id="${app.id}">Approve</button>
                    <button class="btn btn-destructive btn-sm reject-btn ml-2" data-id="${app.id}">Reject</button>
                ` : 'Reviewed'}
            </td>
        `;
        tableBody.appendChild(row);
    });

    const handleUpdate = async (e, status) => {
        const appId = e.target.dataset.id;
        showConfirmModal(`Confirm ${status}`, `Are you sure you want to ${status} this application?`, async () => {
            logInfo(`Updating application status`, { appId, newStatus: status });
            try {
                await updateApplicationStatus(appId, status);
                showToast(`Application has been ${status}.`, 'success');
                renderAdminDashboardContent();
            } catch (error) {
                logError('Failed to update application status', { error });
                showToast('Update failed. Please try again.', 'error');
            }
        });
    };

    tableBody.querySelectorAll('.approve-btn').forEach(b => b.onclick = (e) => handleUpdate(e, 'approved'));
    tableBody.querySelectorAll('.reject-btn').forEach(b => b.onclick = (e) => handleUpdate(e, 'rejected'));

    return contentDiv;
}

async function renderUserManagement() {
    logInfo('Fetching users and applications for admin view');
    const [users, applications] = await Promise.all([fetchUsers(), fetchApplications()]);
    const farmers = users.filter(u => u.role === 'farmer');
    logInfo(`Found ${farmers.length} farmer users`);

    const contentDiv = document.createElement('div');
    contentDiv.className = "card p-8";
    contentDiv.innerHTML = `
        <div class="flex items-center mb-8">
            <i class="fas fa-users-cog text-3xl text-indigo-500 mr-4"></i>
            <h2 class="text-3xl font-bold">User Management</h2>
        </div>
        <div class="mb-6">
            <label for="user-search" class="label">Search Users</label>
            <input id="user-search" type="text" placeholder="Search by farmer name or email..." class="input">
        </div>
        <div class="overflow-x-auto">
            <table class="table min-w-full">
                <thead>
                    <tr>
                        <th>Farmer</th>
                        <th>Email Address</th>
                        <th>Crop Interests</th>
                        <th>Region</th>
                        <th>Total Apps</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="user-management-table-body"></tbody>
            </table>
        </div>
    `;

    const tableBody = contentDiv.querySelector('#user-management-table-body');
    const searchInput = contentDiv.querySelector('#user-search');

    const renderTable = (filteredFarmers) => {
        tableBody.innerHTML = '';
        filteredFarmers.forEach(farmer => {
            const appCount = applications.filter(app => app.farmerId === farmer.uid).length;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="font-medium text-gray-800">${farmer.name}</td>
                <td class="text-gray-700">${farmer.email}</td>
                <td class="text-gray-700">${(farmer.cropInterests || []).join(', ') || 'N/A'}</td>
                <td class="text-gray-700">${farmer.region || 'N/A'}</td>
                <td class="text-gray-700 text-center">${appCount}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn btn-outline btn-sm view-apps-btn" data-farmer-id="${farmer.uid}" data-farmer-name="${farmer.name}">
                            <i class="fas fa-eye h-4 w-4 mr-1"></i> Apps
                        </button>
                        <button class="btn btn-destructive btn-sm deactivate-btn" data-farmer-id="${farmer.uid}">
                            <i class="fas fa-user-slash h-4 w-4 mr-1"></i> Deactivate
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        tableBody.querySelectorAll('.view-apps-btn').forEach(b => {
            b.onclick = (e) => {
                const farmerId = e.currentTarget.dataset.farmerId;
                const farmerName = e.currentTarget.dataset.farmerName;
                const farmerApps = applications.filter(app => app.farmerId === farmerId);
                const appDetailsHtml = farmerApps.length > 0
                    ? `<ul class="text-left list-disc list-inside">${farmerApps.map(app => `<li>${app.schemeName} - <strong>${app.status}</strong></li>`).join('')}</ul>`
                    : '<p>This user has not submitted any applications.</p>';
                showModal(`Applications for ${farmerName}`, appDetailsHtml);
            };
        });

        // ***** START OF DEBUGGING CODE *****
        tableBody.querySelectorAll('.deactivate-btn').forEach(b => {
            b.onclick = (e) => {
                const farmerId = e.currentTarget.dataset.farmerId;
                
                // 1. Log the ID to the console to see what is being captured.
                console.log("Attempting to deactivate farmer with ID:", farmerId);

                // 2. Check if the ID is valid before proceeding.
                if (!farmerId) {
                    alert("DEBUG: Could not find farmer ID. Deactivation cannot proceed.");
                    return;
                }
                
                showConfirmModal('Confirm Deactivation', 'This will remove the user from the database. Are you sure?', async () => {
                    logInfo('Deactivating farmer', { farmerId });
                    try {
                        await deactivateFarmer(farmerId);
                        showToast('User deactivated.', 'success');
                        renderAdminDashboardContent();
                    } catch (error) {
                        // 3. Log the *entire* error object and show the specific message.
                        console.error("Firestore Deactivation Error:", error);
                        logError('Failed to deactivate user', { error });
                        showToast(`Deactivation failed: ${error.message}`, 'error');
                    }
                });
            };
        });
        // ***** END OF DEBUGGING CODE *****
    };

    searchInput.oninput = debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredFarmers = farmers.filter(f => 
            f.name.toLowerCase().includes(searchTerm) || 
            f.email.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredFarmers);
    }, 300);

    renderTable(farmers);
    return contentDiv;
}


async function renderManageCrops() {
    const contentDiv = document.createElement('div');
    contentDiv.className = "card p-8";
    
    contentDiv.innerHTML = `
        <h2 class="text-3xl font-bold mb-8">Add New Crop Information</h2>
        <form id="add-crop-form">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
                <div>
                    <label for="crop-name" class="label">Crop Name <span class="text-red-500">*</span></label>
                    <input id="crop-name" placeholder="Enter crop name" required class="input mt-1">
                </div>
                <div>
                    <label for="crop-season" class="label">Best Season <span class="text-red-500">*</span></label>
                    <select id="crop-season" required class="input mt-1">
                        <option value="">Select season</option>
                        <option value="Kharif">Kharif</option>
                        <option value="Rabi">Rabi</option>
                        <option value="Zaid">Zaid</option>
                    </select>
                </div>
                <div>
                    <label for="crop-region" class="label">Suitable Region <span class="text-red-500">*</span></label>
                    <input id="crop-region" placeholder="Enter suitable regions" required class="input mt-1">
                </div>
                <div>
                    <label for="crop-pesticides" class="label">Pesticides (comma-separated)</label>
                    <input id="crop-pesticides" placeholder="Enter pesticides" class="input mt-1">
                </div>
                <div>
                    <label for="crop-fertilizers" class="label">Fertilizers (comma-separated)</label>
                    <input id="crop-fertilizers" placeholder="Enter fertilizers" class="input mt-1">
                </div>
                <div class="md:col-span-2">
                    <label for="crop-desc" class="label">Description <span class="text-red-500">*</span></label>
                    <textarea id="crop-desc" placeholder="Enter crop description" required class="textarea mt-1" rows="5"></textarea>
                </div>
            </div>
            <button type="submit" class="btn btn-primary mt-8">
                <i class="fas fa-plus h-5 w-5 mr-2"></i>
                Add Crop Information
            </button>
        </form>
    `;
    
    contentDiv.querySelector('#add-crop-form').onsubmit = async (e) => {
        e.preventDefault();
        const newCrop = {
            name: e.target.querySelector('#crop-name').value,
            season: e.target.querySelector('#crop-season').value,
            region: e.target.querySelector('#crop-region').value,
            pesticides: e.target.querySelector('#crop-pesticides').value.split(',').map(s => s.trim()).filter(Boolean),
            fertilizers: e.target.querySelector('#crop-fertilizers').value.split(',').map(s => s.trim()).filter(Boolean),
            description: e.target.querySelector('#crop-desc').value,
        };
        logInfo('Adding new crop', { crop: newCrop });
        try {
            await addCrop(newCrop);
            showToast('Crop added successfully!', 'success');
            e.target.reset();
        } catch(error) {
            logError('Failed to add crop', { error });
            showToast('Failed to add crop.', 'error');
        }
    };
    return contentDiv;
}

async function renderManageSchemes() {
    const contentDiv = document.createElement('div');
    contentDiv.className = "card p-8";
    
    contentDiv.innerHTML = `
        <h2 class="text-3xl font-bold mb-8">Add New Government Scheme</h2>
        <form id="add-scheme-form">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
                <div>
                    <label for="scheme-title" class="label">Scheme Title <span class="text-red-500">*</span></label>
                    <input id="scheme-title" placeholder="Enter scheme title" required class="input mt-1">
                </div>
                <div>
                    <label for="scheme-deadline" class="label">Application Deadline <span class="text-red-500">*</span></label>
                    <input id="scheme-deadline" type="date" required class="input mt-1">
                </div>
                <div class="md:col-span-2">
                    <label for="scheme-desc" class="label">Description <span class="text-red-500">*</span></label>
                    <textarea id="scheme-desc" placeholder="Enter scheme description" required class="textarea mt-1" rows="4"></textarea>
                </div>
                <div>
                    <label for="scheme-eligibility" class="label">Eligibility Criteria <span class="text-red-500">*</span></label>
                    <textarea id="scheme-eligibility" placeholder="Enter eligibility criteria" required class="textarea mt-1" rows="4"></textarea>
                </div>
                <div>
                    <label for="scheme-benefits" class="label">Benefits <span class="text-red-500">*</span></label>
                    <textarea id="scheme-benefits" placeholder="Enter scheme benefits" required class="textarea mt-1" rows="4"></textarea>
                </div>
            </div>
            <button type="submit" class="btn btn-primary mt-8">
                <i class="fas fa-plus h-5 w-5 mr-2"></i>
                Add Government Scheme
            </button>
        </form>
    `;

    contentDiv.querySelector('#add-scheme-form').onsubmit = async (e) => {
        e.preventDefault();
        const newScheme = {
            title: e.target.querySelector('#scheme-title').value,
            description: e.target.querySelector('#scheme-desc').value,
            eligibility: e.target.querySelector('#scheme-eligibility').value,
            benefits: e.target.querySelector('#scheme-benefits').value,
            deadline: e.target.querySelector('#scheme-deadline').value,
            status: 'active'
        };
        logInfo('Adding new scheme', { scheme: newScheme });
        try {
            await addScheme(newScheme);
            showToast('New scheme added successfully!', 'success');
            e.target.reset();
        } catch(error) {
            logError('Failed to add scheme', { error });
            showToast('Failed to add scheme.', 'error');
        }
    };
    return contentDiv;
}

async function renderSendNotificationsForm() {
    const contentDiv = document.createElement('div');
    const users = await fetchUsers();
    const farmers = users.filter(u => u.role === 'farmer');
    contentDiv.className = "card p-8";
    contentDiv.innerHTML = `
        <h2 class="text-3xl font-bold mb-8">Send Notifications</h2>
        <form id="send-notification-form" class="space-y-6">
            <textarea id="notification-message" placeholder="Notification Message" required class="textarea" rows="4"></textarea>
            <button type="submit" class="btn btn-primary w-full">Send Notification to All Farmers</button>
        </form>
    `;

    contentDiv.querySelector('#send-notification-form').onsubmit = async (e) => {
        e.preventDefault();
        const message = contentDiv.querySelector('#notification-message').value;
        if (!message.trim()) {
            showToast('Message cannot be empty.', 'error');
            return;
        }

        const isReadMap = farmers.reduce((acc, farmer) => {
            acc[farmer.uid] = false;
            return acc;
        }, {});

        const newNotification = {
            type: 'info',
            message: message,
            sentBy: 'admin',
            isRead: isReadMap
        };
        
        logInfo('Sending notification', { notification: newNotification });
        try {
            await addNotification(newNotification);
            showToast('Notification sent successfully!', 'success');
            e.target.reset();
        } catch (error) {
            logError('Failed to send notification', { error });
            showToast('Failed to send notification.', 'error');
        }
    };

    return contentDiv;
}
