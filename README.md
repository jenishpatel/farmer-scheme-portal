# farmer-scheme-portal

<br/>
<div align="center">
  <img src="https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/logo.png" alt="AgriPortal Logo" width="300" height="300">

<h1 align="center">AgriPortal - Farmer Empowerment Platform</h1>

  <p align="center">
    A modern, data-driven web portal designed to connect farmers directly with government schemes, vital crop information, and real-time agricultural data.
    <br />
    <a href="https://agriportal-app.netlify.app/"><strong>View Live Demo »</strong></a>
    <br />
    <p><h3>NOTE: if live demo not load properly refresh website</h3></p>
  </p>
</div>


---

## 🌾 About The Project

**AgriPortal** is a comprehensive, user-centric web application designed to bridge the information gap for farmers in the digital age. It directly tackles the challenge many farmers face in accessing and applying for beneficial government aid schemes. The platform provides a centralized, intuitive interface for farmers to discover opportunities, while also offering a powerful backend for administrators to manage the ecosystem efficiently.

This project was built from the ground up using a "vanilla" front-end stack (HTML, CSS, JavaScript), ensuring it remains lightweight, performant, and highly maintainable. For its backend, AgriPortal leverages the power and scalability of **Google Firebase**, utilizing **Firestore** for a real-time NoSQL database and **Firebase Authentication** for secure, role-based user management.

### Our Mission
* **To Empower Farmers:** By providing direct, transparent access to information that can significantly improve their livelihood and agricultural practices.
* **To Drive Efficiency:** By digitizing and streamlining the application process for government schemes, drastically reducing paperwork and bureaucratic hurdles.
* **To Foster Transparency:** By creating a clear, trackable system that gives both farmers and administrators a real-time view of the application lifecycle.

---

## ✨ Key Features

AgriPortal is divided into two primary roles, each with a dashboard and set of features tailored to their specific needs.

### For Farmers (`role: 'farmer'`)

* 🔐 **Secure Authentication**: Simple, secure registration and login.
* 📊 **Personalized Dashboard**: A dynamic and responsive main page featuring:
    * **Live Notifications** from administrators.
    * **Daily Insights Card** with simulated weather for their region and current market prices for their crops of interest.
    * **AI-Powered Recommendations** for schemes based on their profile and crop interests.
* 🌿 **Crop Information Hub**: A detailed, searchable database of various crops, including optimal growing seasons, suitable regions, and recommended fertilizers/pesticides.
* 💰 **Scheme Discovery**: A dedicated section to browse and search for available government schemes, with clear details on eligibility, benefits, and application deadlines.
* 📝 **Simplified Application Process**: An intuitive, multi-step form to apply for schemes. The form is pre-filled with the farmer's data to minimize manual entry.
* 📈 **Live Application Tracking**: A clean, sortable table where farmers can view the real-time status (`Pending`, `Approved`, `Rejected`) of every application they have submitted.

### For Administrators (`role: 'admin'`)

* 🛡️ **Secure Admin Access**: A separate, secure login for platform administrators.
* 📈 **Centralized Overview**: A powerful admin dashboard with key metrics at a glance:
    * Totals for users, crops, and active schemes.
    * A visual bar chart providing an immediate overview of application statuses.
* 📋 **Application Management**: The ability to review, approve, or reject farmer applications in real-time. Changes are instantly reflected in the farmer's dashboard.
* 👥 **User Management**: A complete list of all registered farmers, with the ability to search by name or email and manage their status on the platform.
* 🛠️ **Full Content Control**: Intuitive forms that allow admins to easily add new crop information and government schemes to the platform.
* 📢 **Broadcast Notifications**: A tool to send important announcements and updates to all registered farmers simultaneously.

---

## 🖼️ Photo Gallery

<details>
<summary><b>Click to expand the full application showcase</b></summary>
<br>

### **1. Public & Authentication**
*The first impression of the application, focusing on a clean and secure entry point.*

| Login Page | Registration Page |
| :---: | :---: |
| *The main gateway to the portal.* | *A simple form for new farmer registration.* |
| ![Login Page Screenshot](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/login.png) | ![Registration Page Screenshot](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/registration.png) |

<br>

---

### **2. The Farmer Experience**
*A complete visual tour of the features available to a registered farmer.*

**The Farmer's Command Center: A Personalized Dashboard**
*This is the heart of the farmer's experience, providing real-time, actionable data at a glance. It showcases key metrics, daily insights, and personalized recommendations.*
![Farmer Dashboard Screenshot](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/farmerdashbord.png))

| Crop Information Hub | Application Tracking |
| :---: | :---: |
| *A detailed view of crop data, including required inputs and advisories.* | *Farmers can track the real-time status of all their submitted applications.* |
| ![Crop Details Screenshot](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/cropinfo.png)) | ![Application Tracking Screenshot](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/applicationtraking.png) |

<br>

---

### **3. The Administrator Experience**
*A look into the powerful control panel used to manage the entire platform.*

**The Admin Control Panel: Application & Data Management**
*The main dashboard for administrators, featuring key metrics, a visual status overview, and the primary application review table.*
![Admin Dashboard Screenshot](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/admindashbord.png)

| User Management & Search | Content Creation Form |
| :---: | :---: |
| *Admins can view, search, and manage all registered users in real-time.* | *An intuitive form for adding new schemes or crops to the platform.* |
| ![User Management Screenshot](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/usermanagemet.png) | ![Add Scheme Form Screenshot](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/addscheme.png) |

<br>

---

### **4. Mobile Responsiveness**
*The application is fully responsive, ensuring a seamless experience on any device.*

| Farmer Dashboard on Mobile | Admin Table on Mobile |
| :---: | :---: |
| *The farmer's dashboard adapts perfectly to smaller screens.* | *Even complex tables are designed to be usable on mobile devices.* |
| ![Mobile Farmer Dashboard](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/mobilefarmer.png) | ![Mobile Admin Table](https://raw.githubusercontent.com/jenishpatel/farmer-scheme-portal/main/asset/mobileadmin.png) |

</details>

---

## 🛠️ Technology Stack & Architecture

This project uses a modern, lightweight, and scalable technology stack, chosen for its performance and developer-friendly experience.

### Technologies Used

| Category | Technology |
| :--- | :--- |
| **Front-End** | `HTML5`, `CSS3`, `JavaScript (ES6+ Modules)` |
| **Styling** | `Tailwind CSS` |
| **Backend & DB** | `Google Firebase` (Firestore, Authentication) |
| **Deployment** | `Netlify` |
| **Icons** | `Font Awesome` |

### Architecture

The application follows a **client-side rendered (CSR)** architecture. The front-end is built with vanilla JavaScript, organized into ES6 modules for better code structure and separation of concerns.

* **`main.js`**: Acts as the main controller, handling routing and rendering the correct views.
* **`auth.js`**: Manages all interactions with Firebase Authentication.
* **`data.js`**: Serves as the data layer, encapsulating all Firestore read/write operations.
* **`farmer.js` / `admin.js`**: Contain the logic for rendering the respective user dashboards.
* **`ui.js`**: Provides reusable UI components like modals and toasts.
* **Firebase Backend**: The application communicates directly with Firebase services, which handle the database, user authentication, and security rules, eliminating the need for a traditional server-side application.

---

## 🚀 Getting Started (Local Setup)

To get a local copy up and running, please follow these simple steps.

### Prerequisites

You only need a modern web browser and a code editor like VS Code.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/jenishpatel/farmer-scheme portal](https://github.com/jenishpatel/farmer-scheme-portal.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd farmer-scheme-portal
    ```
3.  **Create your Firebase Configuration:**
    * In the `js/` folder, create a new file named `config.js`.
    * This file is **intentionally ignored by Git** to keep your API keys secure.
    * Add your Firebase project configuration to `js/config.js`:
        ```javascript
        // js/config.js
        const firebaseConfig = {
          apiKey: "YOUR_FIREBASE_API_KEY",
          authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
          projectId: "YOUR_FIREBASE_PROJECT_ID",
          storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
          messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
          appId: "YOUR_FIREBASE_APP_ID"
        };
        ```
4.  **Launch the Application:**
    * Simply open the `index.html` file in your web browser. A live server extension in your code editor is recommended for the best experience.

---

## ☁️ Deployment

This project is configured for **Continuous Deployment** on **Netlify**.

* **Production Branch**: `main`
* **Build Command**: (None, as it's a static site)
* **Publish Directory**: `.`

### Environment Variables

The production API keys are **not** stored in the repository. They are configured as **environment variables** in the Netlify project settings. A script injected by Netlify at build time makes these keys available to the live application, ensuring a secure deployment.



---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

Jenish Dobariya - Jenishdobariya108@gmail.com

Project Link: [https://github.com/jenishpatel/farmer-scheme-portal](https://github.com/jenishpatel/farmer-scheme-portal)

---


