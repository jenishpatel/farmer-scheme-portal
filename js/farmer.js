// This module handles rendering all content for the Farmer dashboard using live Firestore data.

import { showToast, showModal } from './ui.js';
import { getSimulatedWeather, getSimulatedMarketPrices, getSimulatedCropAdvisory } from './utils.js';
import {
    getCurrentUser, getCurrentFarmerTab, setCurrentFarmerTab,
    getApplicationForm, setApplicationForm,
    fetchCrops, fetchSchemes, fetchApplications, addApplication,
    fetchNotifications, markNotificationAsRead
} from './data.js';
import { logInfo, logError } from './logger.js';

let farmerDashboardMainContentArea = null;

export async function renderFarmerDashboardContent() {
    const appContainer = document.getElementById('app');
    if (!farmerDashboardMainContentArea) {
        farmerDashboardMainContentArea = document.createElement('main');
        farmerDashboardMainContentArea.id = "farmer-dashboard-main-content-area";
        farmerDashboardMainContentArea.className = "flex-1 max-w-7xl mx-auto p-6 md:p-8 space-y-10";
        appContainer.appendChild(farmerDashboardMainContentArea);
    }
    farmerDashboardMainContentArea.innerHTML = '<div class="spinner-main"></div>';

    const currentTab = getCurrentFarmerTab();
    const currentUser = getCurrentUser();
    logInfo(`Rendering farmer dashboard for tab: ${currentTab}`, { userId: currentUser.uid });

    try {
        const headerCard = await createHeader(currentUser);
        const tabsComponent = createTabs();
        
        let contentDiv;
        switch (currentTab) {
            case 'crops':
                contentDiv = await renderCropsContent();
                break;
            case 'schemes':
                contentDiv = await renderSchemesContent();
                break;
            case 'apply':
                contentDiv = await renderApplyForm();
                break;
            case 'applications':
                contentDiv = await renderMyApplications();
                break;
            default: // 'dashboard'
                contentDiv = await renderFarmerDashboardHome();
        }
        
        farmerDashboardMainContentArea.innerHTML = ''; // Clear spinner
        farmerDashboardMainContentArea.appendChild(headerCard);
        farmerDashboardMainContentArea.appendChild(tabsComponent.tabsDiv);
        tabsComponent.tabsContentContainer.appendChild(contentDiv);

    } catch (error) {
        logError(`Error rendering farmer tab: ${currentTab}`, { error });
        farmerDashboardMainContentArea.innerHTML = `<p class="text-red-500">Error loading data. Please try again later.</p>`;
        showToast("Could not load data.", "error");
    }
}

async function createHeader(currentUser) {
    const headerCard = document.createElement('div');
    headerCard.className = "bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-8 text-white shadow-xl";

    const [crops, schemes, applications] = await Promise.all([
        fetchCrops(),
        fetchSchemes(),
        fetchApplications(currentUser.uid)
    ]);

    headerCard.innerHTML = `
        <h1 class="text-4xl font-extrabold mb-3">Welcome, ${currentUser.name}!</h1>
        <p class="text-green-100 text-xl font-light mb-8">Manage your crops, schemes, and connect with the community.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div class="bg-white/20 rounded-lg p-5 backdrop-blur-sm"><div class="flex items-center space-x-4"><i class="fas fa-seedling h-9 w-9 text-white"></i><div><p class="text-sm opacity-90">Total Crops</p><p class="text-3xl font-bold">${crops.length}</p></div></div></div>
            <div class="bg-white/20 rounded-lg p-5 backdrop-blur-sm"><div class="flex items-center space-x-4"><i class="fas fa-file-alt h-9 w-9 text-white"></i><div><p class="text-sm opacity-90">Available Schemes</p><p class="text-3xl font-bold">${schemes.length}</p></div></div></div>
            <div class="bg-white/20 rounded-lg p-5 backdrop-blur-sm"><div class="flex items-center space-x-4"><i class="fas fa-clock h-9 w-9 text-white"></i><div><p class="text-sm opacity-90">My Applications</p><p class="text-3xl font-bold">${applications.length}</p></div></div></div>
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
        <button class="tabs-trigger" data-value="dashboard">Dashboard</button>
        <button class="tabs-trigger" data-value="crops">Crop Information</button>
        <button class="tabs-trigger" data-value="schemes">Government Schemes</button>
        <button class="tabs-trigger" data-value="apply">Apply for Scheme</button>
        <button class="tabs-trigger" data-value="applications">My Applications</button>
    `;

    const tabsContentContainer = document.createElement('div');
    tabsContentContainer.id = "tabs-content-container";
    tabsDiv.appendChild(tabsList);
    tabsDiv.appendChild(tabsContentContainer);

    const currentTab = getCurrentFarmerTab();
    tabsList.querySelectorAll('.tabs-trigger').forEach(trigger => {
        if (trigger.dataset.value === currentTab) {
            trigger.setAttribute('data-state', 'active');
        }
        trigger.onclick = (e) => {
            setCurrentFarmerTab(e.target.dataset.value);
            renderFarmerDashboardContent();
        };
    });

    return { tabsDiv, tabsContentContainer };
}

async function renderFarmerDashboardHome() {
    // ... (This function remains the same)
    logInfo('Fetching data for farmer dashboard home');
    const contentDiv = document.createElement('div');
    contentDiv.className = "space-y-8";
    const currentUser = getCurrentUser();
    
    const [notifications, schemes] = await Promise.all([
        fetchNotifications(),
        fetchSchemes()
    ]);

    const unreadNotifications = notifications.filter(n => n.isRead && n.isRead[currentUser.uid] === false);
    
    const recommendedSchemes = schemes.filter(scheme => {
        if (!currentUser.cropInterests || currentUser.cropInterests.length === 0) return false;
        const eligibilityKeywords = (scheme.eligibility || '').toLowerCase().split(/\W+/);
        return currentUser.cropInterests.some(ci => eligibilityKeywords.includes(ci.toLowerCase()));
    }).slice(0, 2);

    const weather = getSimulatedWeather(currentUser.region);

    contentDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="card p-7">
                <h3 class="text-xl font-bold text-gray-900 mb-5 flex items-center"><i class="fas fa-bullhorn text-blue-500 mr-3"></i> Notifications (${unreadNotifications.length} Unread)</h3>
                <div id="notification-list" class="space-y-3 max-h-48 overflow-y-auto pr-2">
                    ${unreadNotifications.length > 0 ? unreadNotifications.map(n => `
                        <div class="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 relative group">
                            <p>${n.message}</p>
                            <span class="text-xs text-blue-600 block mt-1">${n.timestamp.toLocaleDateString()}</span>
                            <button class="absolute top-1 right-1 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity mark-read-btn" data-notification-id="${n.id}"><i class="fas fa-check h-4 w-4"></i></button>
                        </div>`).join('') : `<p class="text-gray-500">No new notifications.</p>`}
                </div>
            </div>
            <div class="card p-7">
                <h3 class="text-xl font-bold text-gray-900 mb-5 flex items-center"><i class="fas fa-chart-line text-purple-500 mr-3"></i> Daily Insights</h3>
                <div class="space-y-4">
                    <div>
                        <p class="font-semibold text-lg text-gray-700">Weather in ${currentUser.region || 'Your Region'}:</p>
                        <div class="flex items-center space-x-2 text-gray-600 mt-2">
                            <i class="fas fa-cloud-sun h-6 w-6 text-yellow-500"></i>
                            <span>${weather.temperature}, ${weather.condition}, Humidity: ${weather.humidity}</span>
                        </div>
                    </div>
                    ${currentUser.cropInterests && currentUser.cropInterests.length > 0 ? `
                        <div>
                            <p class="font-semibold text-lg text-gray-700">Market Prices:</p>
                            <ul class="list-disc list-inside text-gray-600 mt-2 space-y-1">
                                ${currentUser.cropInterests.map(crop => `<li>${crop}: <span class="font-bold text-emerald-600">${getSimulatedMarketPrices(crop)}</span></li>`).join('')}
                            </ul>
                        </div>` : ''}
                </div>
            </div>
        </div>
        <div class="card p-7">
            <h3 class="text-xl font-bold text-gray-900 mb-5 flex items-center"><i class="fas fa-hand-holding-usd text-emerald-500 mr-3"></i> Recommended Schemes for You</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${recommendedSchemes.length > 0 ? recommendedSchemes.map(scheme => `
                    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h4 class="font-bold text-lg text-gray-800">${scheme.title}</h4>
                        <p class="text-gray-600 text-sm mt-1 mb-3">${(scheme.description || '').substring(0, 100)}...</p>
                        <button class="btn btn-primary btn-sm apply-now-btn" data-scheme-id="${scheme.id}">Apply Now</button>
                    </div>`).join('') : `<p class="text-gray-500 col-span-2">No specific recommendations. Explore all schemes in the 'Government Schemes' tab.</p>`}
            </div>
        </div>
    `;

    contentDiv.querySelectorAll('.mark-read-btn').forEach(button => {
        button.onclick = async (e) => {
            const notificationId = e.currentTarget.dataset.notificationId;
            try {
                await markNotificationAsRead(notificationId, currentUser.uid);
                showToast('Notification marked as read.', 'success');
                renderFarmerDashboardContent();
            } catch (error) {
                logError('Failed to mark notification as read', { error });
                showToast('Could not update notification.', 'error');
            }
        };
    });
    
    contentDiv.querySelectorAll('.apply-now-btn').forEach(button => {
        button.onclick = (e) => {
            const formState = getApplicationForm();
            setApplicationForm({ ...formState, schemeId: e.target.dataset.schemeId });
            setCurrentFarmerTab('apply');
            renderFarmerDashboardContent();
        };
    });

    return contentDiv;
}

async function renderCropsContent() {
    // ... function remains the same
    logInfo('Fetching crops data');
    const crops = await fetchCrops();
    logInfo(`Found ${crops.length} crops`);
    const contentDiv = document.createElement('div');
    
    contentDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="crops-grid"></div>
        <div id="crop-detail-section" class="hidden card p-8 border-2 border-emerald-200 mt-8"></div>
    `;

    const cropsGrid = contentDiv.querySelector('#crops-grid');
    if (crops.length === 0) {
        cropsGrid.innerHTML = `<p>No crop information available.</p>`;
        return contentDiv;
    }

    crops.forEach(crop => {
        const cropCard = document.createElement('div');
        cropCard.className = "card p-7 hover:shadow-xl transition-all cursor-pointer";
        cropCard.innerHTML = `
            <div class="flex items-center space-x-4 mb-4">
                <div class="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
                    <i class="fas fa-leaf h-7 w-7 text-emerald-600"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900">${crop.name}</h3>
                    <span class="badge badge-secondary mt-1">${crop.season || 'N/A'}</span>
                </div>
            </div>
            <p class="text-gray-700 leading-relaxed mb-4">${(crop.description || '').substring(0, 80)}...</p>
            <div class="flex items-center space-x-3 text-gray-600">
                <i class="fas fa-map-marker-alt h-5 w-5 text-emerald-500"></i>
                <span>${crop.region || 'N/A'}</span>
            </div>
        `;
        cropCard.onclick = () => {
            logInfo('Displaying crop details', { cropId: crop.id });
            renderCropDetailView(contentDiv, crop);
        };
        cropsGrid.appendChild(cropCard);
    });
    return contentDiv;
}

function renderCropDetailView(parentDiv, selectedCrop) {
    // ... function remains the same
    const detailSection = parentDiv.querySelector('#crop-detail-section');
    detailSection.classList.remove('hidden');
    detailSection.innerHTML = `
        <div class="flex justify-between items-start mb-6">
            <h2 class="text-3xl font-bold text-gray-900">${selectedCrop.name}</h2>
            <button class="btn btn-outline p-2 rounded-full" id="close-crop-detail">
                <i class="fas fa-times h-5 w-5"></i>
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg text-gray-700">
            <div>
                <h3 class="font-bold text-gray-800 mb-3 text-xl">Basic Information</h3>
                <div class="space-y-3">
                    <p><strong>Season:</strong> ${selectedCrop.season || 'N/A'}</p>
                    <p><strong>Region:</strong> ${selectedCrop.region || 'N/A'}</p>
                    <p><strong>Description:</strong> ${selectedCrop.description || 'No description available.'}</p>
                </div>
            </div>
            <div>
                <h3 class="font-bold text-gray-800 mb-3 text-xl">Required Inputs</h3>
                <div class="space-y-4">
                    <div>
                        <p class="font-semibold text-base mb-2">Pesticides:</p>
                        <div class="flex flex-wrap gap-2">
                            ${(selectedCrop.pesticides || []).map(p => `<span class="badge badge-outline bg-gray-50">${p}</span>`).join('') || '<span>N/A</span>'}
                        </div>
                    </div>
                    <div>
                        <p class="font-semibold text-base mb-2">Fertilizers:</p>
                        <div class="flex flex-wrap gap-2">
                            ${(selectedCrop.fertilizers || []).map(f => `<span class="badge badge-outline bg-gray-50">${f}</span>`).join('') || '<span>N/A</span>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-8 pt-8 border-t border-gray-200">
            <h3 class="font-bold text-gray-800 mb-4 text-xl flex items-center"><i class="fas fa-info-circle text-blue-500 mr-3"></i> Interactive Crop Advisory</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="advisory-stage" class="label">Current Growth Stage</label>
                    <input type="text" id="advisory-stage" class="input" placeholder="e.g., Tillering, Flowering">
                </div>
                <div>
                    <label for="advisory-pest" class="label">Observed Pest/Disease</label>
                    <input type="text" id="advisory-pest" class="input" placeholder="e.g., Aphids, Rust">
                </div>
            </div>
            <button id="get-advisory-btn" class="btn btn-primary mt-6">Get Advisory</button>
            <p id="advisory-output" class="text-gray-700 mt-4 bg-gray-50 p-4 rounded-md border border-gray-200 text-left"></p>
        </div>
    `;

    detailSection.querySelector('#close-crop-detail').onclick = () => {
        logInfo('Closing crop details view');
        detailSection.classList.add('hidden');
    };

    detailSection.querySelector('#get-advisory-btn').onclick = () => {
        const stage = detailSection.querySelector('#advisory-stage').value;
        const pest = detailSection.querySelector('#advisory-pest').value;
        logInfo('Getting crop advisory', { crop: selectedCrop.name, stage, pest });
        const advisory = getSimulatedCropAdvisory(selectedCrop.name, stage, pest);
        detailSection.querySelector('#advisory-output').textContent = advisory;
    };
}


async function renderSchemesContent() {
    // ... function remains the same
    logInfo('Fetching schemes data');
    const schemes = await fetchSchemes();
    logInfo(`Found ${schemes.length} schemes`);
    const contentDiv = document.createElement('div');
    contentDiv.className = "grid grid-cols-1 lg:grid-cols-2 gap-8";
    schemes.forEach(scheme => {
        const schemeCard = document.createElement('div');
        schemeCard.className = "card p-7";
        
        const deadlineText = (scheme.deadline instanceof Date) 
            ? scheme.deadline.toLocaleDateString() 
            : 'Not specified';

        schemeCard.innerHTML = `
            <h3 class="text-2xl font-bold">${scheme.title}</h3>
            <p class="text-gray-700 my-2">${scheme.description}</p>
            <p><strong>Deadline:</strong> ${deadlineText}</p>
            <button class="btn btn-primary mt-4 apply-now-btn" data-scheme-id="${scheme.id}">Apply Now</button>
        `;
        contentDiv.appendChild(schemeCard);
    });

    contentDiv.querySelectorAll('.apply-now-btn').forEach(button => {
        button.onclick = (e) => {
            const schemeId = e.target.dataset.schemeId;
            logInfo('Apply Now button clicked', { schemeId });
            const formState = getApplicationForm();
            setApplicationForm({ ...formState, schemeId });
            setCurrentFarmerTab('apply');
            renderFarmerDashboardContent();
        };
    });
    return contentDiv;
}

async function renderMyApplications() {
    const currentUser = getCurrentUser();
    logInfo('Fetching applications for user', { uid: currentUser.uid });
    
    const applications = await fetchApplications(currentUser.uid);
    applications.sort((a, b) => (b.appliedAt || 0) - (a.appliedAt || 0));

    logInfo(`Found ${applications.length} applications for this user`);
    const contentDiv = document.createElement('div');
    contentDiv.className = "card p-8";

    // **NEW LAYOUT IMPLEMENTED HERE**
    contentDiv.innerHTML = `
        <h2 class="text-3xl font-bold mb-8">My Applications</h2>
        <div class="overflow-x-auto">
            <table class="table min-w-full">
                <thead>
                    <tr>
                        <th>Scheme Name</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Land Size</th>
                        <th>Crop Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="my-applications-table-body"></tbody>
            </table>
        </div>
        ${applications.length === 0 ? '<p class="text-center text-gray-500 mt-6">You have not submitted any applications yet.</p>' : ''}
    `;

    const tableBody = contentDiv.querySelector('#my-applications-table-body');
    applications.forEach(app => {
        const row = document.createElement('tr');
        const appliedDateText = (app.appliedAt instanceof Date) ? app.appliedAt.toLocaleDateString() : 'N/A';
        row.innerHTML = `
            <td class="font-medium text-gray-800">${app.schemeName}</td>
            <td class="text-gray-700">${appliedDateText}</td>
            <td><span class="badge ${app.status === 'approved' ? 'badge-default' : app.status === 'rejected' ? 'badge-destructive' : 'badge-secondary'}">${app.status}</span></td>
            <td class="text-gray-700">${app.landSize || 'N/A'} acres</td>
            <td class="text-gray-700">${app.cropType || 'N/A'}</td>
            <td>
                <button class="btn btn-outline btn-sm view-application-btn py-2 px-3" data-app-id="${app.id}">
                    <i class="fas fa-eye h-4 w-4 mr-1"></i> View
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    tableBody.querySelectorAll('.view-application-btn').forEach(button => {
        button.onclick = (e) => {
            const appId = e.currentTarget.dataset.appId;
            const app = applications.find(a => a.id === appId);
            if (app) {
                logInfo('Viewing application details', { appId });
                showModal("Application Details", `
                    <div class="text-left space-y-3">
                        <p><strong>Scheme:</strong> ${app.schemeName}</p>
                        <p><strong>Status:</strong> <span class="font-bold">${app.status.toUpperCase()}</span></p>
                        <p><strong>Applied On:</strong> ${(app.appliedAt instanceof Date) ? app.appliedAt.toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Land Size:</strong> ${app.landSize} acres</p>
                        <p><strong>Crop Type:</strong> ${app.cropType}</p>
                        <p><strong>Additional Details:</strong> ${app.details || 'No details provided.'}</p>
                    </div>
                `);
            }
        };
    });

    return contentDiv;
}


async function renderApplyForm() {
    // ... function remains the same
    logInfo('Rendering application form');
    const [schemes, crops] = await Promise.all([fetchSchemes(), fetchCrops()]);
    const formState = getApplicationForm();
    const currentUser = getCurrentUser();
    const contentDiv = document.createElement('div');
    contentDiv.className = "card p-8";
    
    contentDiv.innerHTML = `
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Apply for Government Scheme</h2>
        <form id="apply-form">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
                <div>
                    <label for="apply-scheme-select" class="label">Select Scheme <span class="text-red-500">*</span></label>
                    <select id="apply-scheme-select" class="input mt-1">
                        <option value="">Choose a scheme...</option>
                        ${schemes.map(s => `<option value="${s.id}" ${formState.schemeId === s.id ? 'selected' : ''}>${s.title}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="apply-name" class="label">Full Name <span class="text-red-500">*</span></label>
                    <input id="apply-name" value="${currentUser.name}" readonly class="input mt-1 bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                    <label for="apply-landSize" class="label">Land Size (acres) <span class="text-red-500">*</span></label>
                    <input id="apply-landSize" type="number" placeholder="e.g. 5" class="input mt-1" value="${formState.landSize || ''}" />
                </div>
                <div>
                    <label for="apply-cropType" class="label">Crop Type <span class="text-red-500">*</span></label>
                    <select id="apply-cropType" class="input mt-1">
                        <option value="">Select crop type...</option>
                        ${crops.map(c => `<option value="${c.name}" ${formState.cropType === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label for="apply-details" class="label">Additional Details</label>
                    <textarea id="apply-details" placeholder="Provide any additional information" class="textarea mt-1" rows="5">${formState.details || ''}</textarea>
                </div>
            </div>
            <button type="submit" class="btn btn-primary mt-8">
                Submit Application <i class="fas fa-paper-plane ml-2"></i>
            </button>
        </form>
    `;

    contentDiv.querySelector('#apply-form').onsubmit = async (e) => {
        e.preventDefault();
        const schemeId = contentDiv.querySelector('#apply-scheme-select').value;
        const landSize = contentDiv.querySelector('#apply-landSize').value;
        const cropType = contentDiv.querySelector('#apply-cropType').value;
        const details = contentDiv.querySelector('#apply-details').value;

        if (!schemeId || !landSize || !cropType) {
            showModal("Validation Error", "Please fill out all required fields marked with *");
            return;
        }

        const scheme = schemes.find(s => s.id === schemeId);
        
        const newApplication = {
            farmerId: currentUser.uid,
            farmerName: currentUser.name,
            schemeId: schemeId,
            schemeName: scheme.title,
            status: 'pending',
            landSize: parseFloat(landSize),
            cropType: cropType,
            details: details
        };
        
        logInfo('Submitting new application', { application: newApplication });

        try {
            await addApplication(newApplication);
            logInfo('Application submitted successfully');
            showToast("Application submitted!", "success");
            setApplicationForm({ name: currentUser.name, landSize: "", cropType: "", details: "" });
            setCurrentFarmerTab('applications');
            renderFarmerDashboardContent();
        } catch (error) {
            logError('Failed to submit application', { error });
            showToast("Failed to submit application.", "error");
        }
    };
    return contentDiv;
}
