# CampusConnect 🛡️

![CampusConnect Banner](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge) ![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb) ![React-Leaflet](https://img.shields.io/badge/Maps-React%20Leaflet-11999e?style=for-the-badge&logo=leaflet)

**CampusConnect** (formerly CommunityConnect) is a comprehensive, real-time campus safety monitoring and incident reporting web application built as a final-year BTech academic project. It empowers students to safely and anonymously report incidents while providing administrators with a powerful command center for tracking, analyzing, and resolving community issues.

## 🌟 Key Features

### For Students
- **Incident Reporting:** Report security incidents (Harassment, Theft, Violence, Infrastructure Issues) with rich descriptions and media attachments.
- **Interactive Location Mapping:** Precisely pin incident locations using an interactive map powered by `react-leaflet` and reverse geocoded by OpenStreetMap's Nominatim.
- **Anonymous Reporting:** A dedicated toggle allows students to confidently submit critical tips while fully protecting their identity.
- **Community Safety Hub:** View real-time campus safety feeds, high-priority severity alerts, and explore active Black Spot heatmaps.

### For Administrators & Moderators
- **Admin Command Center:** A secure dashboard equipped with rich charts (`recharts`) detailing incident distributions and historical trends.
- **Black Spot Heatmaps:** High-contrast CartoCDN dark maps visually aggregate severity clusters across the campus to optimize patrol routing.
- **Incident Management:** Filter, review, and sequentially resolve complaints, automatically keeping the community updated on action taken. 
- **Sample Data Seeding:** Instantly populate the database with demonstration data for testing and academic presentation purposes.

## 🛠️ Technology Stack

**Frontend (Client)**
* React.js (Vite)
* Tailwind CSS (Styling & Dark Mode UI)
* React-Leaflet (Map Integration)
* Recharts (Data Visualization)
* Lucide React (Icons)
* React Router DOM (Navigation)

**Backend (Server)**
* Node.js & Express.js
* MongoDB & Mongoose (NoSQL Database)
* JSON Web Tokens (Authentication)
* Helmet (Content Security Policy & Header Hardening)
* Axios (HTTP Client)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/CampusConnect.git
   cd CampusConnect
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

Create a `.env` file in the **server** directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

*(Optionally, configure Vite `.env` parameters in the client directory if necessary).*

## 🏃‍♂️ Running the Application

### Development Mode

Run the backend server (from the `/server` folder):
```bash
node index.js
# or if using nodemon: npm run dev
```

Run the Vite frontend (from the `/client` folder):
```bash
npm run dev
```

The app will be accessible at `http://localhost:5173`.

### Production Server (Monolith Build)

The application is configured to serve the fully-compiled React frontend statically via the Express backend in production mode.

1. **Build the production frontend:**
   ```bash
   cd client
   npm run build
   ```
2. **Start the Express monolith server:**
   ```bash
   cd ../server
   # Windows PowerShell
   $env:NODE_ENV="production"; node index.js
   
   # Linux / macOS
   NODE_ENV=production node index.js
   ```

The fully assembled application will now run dynamically out of `http://localhost:5000`.

## 🛡️ Security

- The backend is fortified with `helmet.js` to prevent malicious header injections. 
- A custom **Content-Security-Policy** safely provisions exceptions for Leaflet and CartoCDN tiles to ensure map layers remain visible tightly under production environments.
- API endpoints are protected using robust JWT middleware.

## 📜 License
This project was developed as a Final Year Academic Engineering Project and is open-sourced under the MIT License.

---
*Built to make university campuses safer, more connected, and highly responsive.*
