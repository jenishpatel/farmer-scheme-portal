// This is the main entry point and controller for the application.

import { renderFarmerDashboardContent } from './farmer.js';
import { renderAdminDashboardContent } from './admin.js';
import { showToast } from './ui.js';
import { getCurrentUser, setCurrentUser, setApplicationForm, setCurrentFarmerTab, setCurrentAdminTab } from './data.js';
import { registerUser, loginUser, logoutUser, onAuthStateChange } from './auth.js';

const appContainer = document.getElementById('app');
const loadingOverlay = document.getElementById('loading-overlay');

// --- Component Rendering Functions ---

function renderNavigation(user, onLogout) {
    const nav = document.createElement('nav');
    nav.className = "bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg";
    const container = document.createElement('div');
    container.className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
    nav.appendChild(container);

    const headerDiv = document.createElement('div');
    headerDiv.className = "flex justify-between items-center h-16";
    container.appendChild(headerDiv);

    // --- Logo ---
    const logoDiv = document.createElement('div');
    logoDiv.className = "flex items-center space-x-3 cursor-pointer";
    logoDiv.innerHTML = `<i class="fas fa-seedling h-8 w-8 text-white"></i><span class="text-2xl font-extrabold tracking-wide">AgriPortal</span>`;
    logoDiv.onclick = () => {
        if (user.role === 'farmer') {
            setCurrentFarmerTab('dashboard');
            renderFarmerDashboardContent();
        } else {
            setCurrentAdminTab('applications');
            renderAdminDashboardContent();
        }
    };
    headerDiv.appendChild(logoDiv);

    // --- Desktop Navigation & Logout ---
    const desktopNavDiv = document.createElement('div');
    desktopNavDiv.className = "hidden md:flex items-center space-x-4";
    headerDiv.appendChild(desktopNavDiv);

    const links = user.role === 'farmer' ? [
        { icon: 'fas fa-tachometer-alt', label: "Dashboard", value: "dashboard" },
        { icon: 'fas fa-seedling', label: "Crop Information", value: "crops" },
        { icon: 'fas fa-file-alt', label: "Government Schemes", value: "schemes" },
        { icon: 'fas fa-clock', label: "My Applications", value: "applications" },
    ] : [
        { icon: 'fas fa-tachometer-alt', label: "Applications", value: "applications" },
        { icon: 'fas fa-users', label: "User Management", value: "user-management" },
    ];

    links.forEach(link => {
        const linkEl = document.createElement('a');
        linkEl.href = "#";
        linkEl.className = "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-emerald-800 transition-colors text-base";
        linkEl.innerHTML = `<i class="${link.icon} h-5 w-5"></i><span>${link.label}</span>`;
        linkEl.onclick = (e) => {
            e.preventDefault();
            if (user.role === 'farmer') {
                setCurrentFarmerTab(link.value);
                renderFarmerDashboardContent();
            } else {
                setCurrentAdminTab(link.value);
                renderAdminDashboardContent();
            }
        };
        desktopNavDiv.appendChild(linkEl);
    });

    const logoutButton = document.createElement('button');
    logoutButton.className = "btn btn-ghost text-white hover:bg-emerald-800 px-4 py-2 text-base flex items-center space-x-2";
    logoutButton.innerHTML = `<i class="fas fa-sign-out-alt h-5 w-5"></i><span>Sign Out</span>`;
    logoutButton.onclick = onLogout;
    desktopNavDiv.appendChild(logoutButton);


    // --- Mobile Menu Button ("Hamburger") ---
    const mobileMenuButton = document.createElement('div');
    mobileMenuButton.className = "md:hidden flex items-center";
    mobileMenuButton.innerHTML = `
        <button id="mobile-menu-button" class="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <i class="fas fa-bars h-6 w-6"></i>
        </button>
    `;
    headerDiv.appendChild(mobileMenuButton);


    // --- Mobile Menu Panel ---
    const mobileMenu = document.createElement('div');
    mobileMenu.id = "mobile-menu";
    mobileMenu.className = "md:hidden hidden"; // Hidden by default on all screens
    container.appendChild(mobileMenu);

    const mobileNavLinksDiv = document.createElement('div');
    mobileNavLinksDiv.className = "px-2 pt-2 pb-3 space-y-1 sm:px-3";
    mobileMenu.appendChild(mobileNavLinksDiv);
    
    links.forEach(link => {
        const linkEl = document.createElement('a');
        linkEl.href = "#";
        linkEl.className = "flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-emerald-800 transition-colors text-base font-medium block";
        linkEl.innerHTML = `<i class="${link.icon} h-5 w-5"></i><span>${link.label}</span>`;
        linkEl.onclick = (e) => {
            e.preventDefault();
            // Close the mobile menu after clicking a link
            mobileMenu.classList.add('hidden');
            if (user.role === 'farmer') {
                setCurrentFarmerTab(link.value);
                renderFarmerDashboardContent();
            } else {
                setCurrentAdminTab(link.value);
                renderAdminDashboardContent();
            }
        };
        mobileNavLinksDiv.appendChild(linkEl);
    });

    // Add Logout to Mobile Menu
    const mobileLogoutDiv = document.createElement('div');
    mobileLogoutDiv.className = "pt-4 pb-3 border-t border-emerald-500";
    mobileMenu.appendChild(mobileLogoutDiv);

    const mobileLogoutButton = document.createElement('button');
    mobileLogoutButton.className = "w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-emerald-800 transition-colors text-base font-medium";
    mobileLogoutButton.innerHTML = `<i class="fas fa-sign-out-alt h-5 w-5"></i><span>Sign Out</span>`;
    mobileLogoutButton.onclick = onLogout;
    mobileLogoutDiv.appendChild(mobileLogoutButton);


    // --- Event Listener to Toggle Mobile Menu ---
    mobileMenuButton.querySelector('#mobile-menu-button').onclick = () => {
        mobileMenu.classList.toggle('hidden');
    };

    return nav;
}


function renderLoginForm() {
    appContainer.innerHTML = '';
    const loginDiv = document.createElement('div');
    loginDiv.className = "min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-100 p-4";
    const card = document.createElement('div');
    card.className = "card w-full max-w-md p-10";
    card.innerHTML = `<div class="text-center mb-10"><h1 class="text-4xl font-extrabold text-gray-900">AgriPortal</h1><p class="text-gray-600 mt-3 text-lg">Sign In</p></div>`;

    const form = document.createElement('form');
    form.className = "space-y-7";
    form.innerHTML = `
        <div><label for="email" class="label">Email</label><input id="email" type="email" required class="input mt-1" value=""></div>
        <div><label for="password" class="label">Password</label><input id="password" type="password" required class="input mt-1" value=""></div>
        <button type="submit" class="btn btn-primary w-full mt-8">Sign In</button>
        <h2 class="col">Note: Testing  For admin use <br> Email is: admin@example.com <br> Password is: password</h2>
        <h2 class="col">For farmer use <br> Email and Password can be anything you want</h2>
    `;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        loadingOverlay.classList.remove('hidden');
        try {
            await loginUser(email, password);
            showToast("Login successful!", "success");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    };
    card.appendChild(form);

    const links = document.createElement('div');
    links.className = "mt-8 text-center text-base text-gray-600";
    links.innerHTML = `<p class="mt-4">Don’t have an account? <a href="#" id="go-to-register" class="text-blue-600 hover:underline">Register here</a></p>`;
    card.appendChild(links);
    loginDiv.appendChild(card);
    
    loginDiv.querySelector('#go-to-register').onclick = (e) => {
        e.preventDefault();
        renderRegisterForm();
    };

    appContainer.appendChild(loginDiv);
}

function renderRegisterForm() {
    appContainer.innerHTML = '';
    const formDiv = document.createElement('div');
    formDiv.className = "min-h-screen flex items-center justify-center p-4";
    formDiv.innerHTML = `<div class="card w-full max-w-md p-10"><h2 class="text-2xl font-bold mb-4 text-center">Register</h2><form id="register-form" class="space-y-4"><input id="reg-name" placeholder="Full Name" required class="input"><input id="reg-email" type="email" placeholder="Email" required class="input"><input id="reg-password" type="password" placeholder="Password" required class="input"><input id="reg-region" placeholder="Region (e.g., Punjab)" class="input"><button type="submit" class="btn btn-primary w-full">Register</button><p class="text-center mt-3"><a href="#" id="go-to-login" class="text-blue-600">Back to Login</a></p></form></div>`;
    
    formDiv.querySelector('#register-form').onsubmit = async (e) => {
        e.preventDefault();
        const name = formDiv.querySelector('#reg-name').value;
        const email = formDiv.querySelector('#reg-email').value;
        const password = formDiv.querySelector('#reg-password').value;
        const region = formDiv.querySelector('#reg-region').value;
        loadingOverlay.classList.remove('hidden');
        try {
            await registerUser(email, password, { name, region, role: 'farmer' });
            showToast('Registration successful! Please log in.', 'success');
            renderLoginForm();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    };
    
    formDiv.querySelector('#go-to-login').onclick = (e) => {
        e.preventDefault();
        renderLoginForm();
    };
    appContainer.appendChild(formDiv);
}

// --- Main App Controller ---

function renderApp(user) {
    appContainer.innerHTML = '';
    loadingOverlay.classList.add('hidden');

    if (!user) {
        renderLoginForm();
    } else {
        setApplicationForm({ name: user.name, landSize: "", cropType: "", details: "" });
        
        appContainer.appendChild(renderNavigation(user, async () => {
            loadingOverlay.classList.remove('hidden');
            await logoutUser();
            showToast("You have been logged out.", "success");
        }));

        if (user.role === "farmer") {
            renderFarmerDashboardContent();
        } else if (user.role === "admin") {
            renderAdminDashboardContent();
        } else {
            appContainer.innerHTML = '<p>Unknown user role.</p>';
        }
    }
}

// --- Initial Execution ---
onAuthStateChange(renderApp);
