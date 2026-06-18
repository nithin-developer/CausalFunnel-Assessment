# CausalFunnel — User Analytics Tracker & Dashboard

A full-stack, end-to-end user analytics application built to capture, store, and visualize real-time user behavior on web properties. This project features a lightweight tracking script, a scalable backend, and a modern, high-performance React dashboard to map out user journeys and click heatmaps.

Built as part of the **CausalFunnel Full Stack Engineer Assessment**.

---

## 📂 Project Structure

```
├── backend/                  # Node.js + Express API server
│   ├── models/
│   │   └── Event.js          # Mongoose schema for events
│   ├── routes/
│   │   └── analytics.js      # API endpoints
│   ├── server.js             # Entry point
│   └── .env                  # Environment config
│
├── frontend/                 # React + Vite dashboard
│   └── src/
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   └── EventTimeline.tsx
│       ├── pages/
│       │   ├── Sessions.tsx
│       │   └── Heatmap.tsx
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
│
├── tracker-script/           # Standalone tracking script
│   ├── tracker.js
│   └── demo.html             # Demo e-commerce page
│
└── README.md
```

---

## 🏗 Tech Stack

| Layer | Technology | Description |
|-------|-----------|-------------|
| **Frontend Dashboard** | React 19 + Vite + TypeScript | High-performance dashboard built with Tailwind CSS (v4), Framer Motion for physics-based animations, and `shadcn/ui` for modular, accessible components. Routing handled via React Router v7. |
| **Tracking Script** | Vanilla JavaScript | A lightweight, dependency-free script injected into client applications to monitor DOM interactions. |
| **Backend API** | Node.js + Express.js | Fast, scalable REST API for ingesting tracking events and serving analytics data. |
| **Database** | MongoDB + Mongoose | NoSQL database capable of high-throughput write operations for event ingestion. |
| **HTTP Client** | Axios & Fetch API | `fetch` (with keepalive) is used in the tracker to ensure performance; Axios powers the frontend data retrieval. |

---

## ⚙️ How It Works (Architecture & Data Flow)

The application relies on three distinct layers working in harmony:

1. **Data Ingestion (The Tracker Script):**
   - The lightweight `tracker.js` is embedded into client sites (e.g., `demo.html`).
   - Upon initialization, it generates a unique cryptographic `session_id` using `crypto.randomUUID()` and persists it via `localStorage`. 
   - A basic heuristic utilizing the `navigator.userAgent` determines whether the `device_type` is Mobile or Desktop.
   - It attaches event listeners to the DOM to fire API requests on `load` (`page_view` events) and `click` (`click` events capturing X/Y coordinates, target elements, and textual content).
   - Payloads are dispatched to the backend via `fetch` utilizing `keepalive: true`, ensuring events aren't lost if the user navigates away.

2. **Data Storage & Processing (Backend):**
   - An Express.js REST API receives the structured event payloads.
   - The backend validates the structural integrity of the payload (`session_id`, `event_type`, `page_url`).
   - Valid events are stored as immutable records in a MongoDB collection utilizing Mongoose.

3. **Data Visualization (Frontend Dashboard):**
   - Built on Vite & React, the dashboard queries the analytics endpoints (`/api/sessions`, `/api/heatmap`).
   - **Sessions View**: Utilizes MongoDB `$group` aggregation pipelines to dynamically calculate total session durations, unique page interactions, and device distributions.
   - **Heatmaps View**: Fetches precise `click_x` and `click_y` coordinate data mapped against a target URL, rendering interactive visual heatmaps (using radial-gradient logic) overlaid on webpage screenshots to discover "hot" interaction zones.

---

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory and add your MongoDB connection string:
  ```env
  MONGO_URI=mongodb://localhost:27017/causalfunnel
  PORT=5000
  ```
- Start the server:
  ```bash
  npm run dev
  ```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
- The frontend proxy is configured to direct `/api` calls to `http://localhost:5000`.
- Start the development server:
  ```bash
  npm run dev
  ```

### 3. Demo Application (Tracker Target)
- To simulate interactions and populate data, open `tracker-script/demo.html` in your browser (ideally via a Live Server extension or HTTP server).
- Navigate, click buttons, and view products. The tracker will actively push events to the backend, which will instantly reflect in your running React Dashboard.

---

## 🤔 Assumptions & Trade-Offs

To maintain scope and performance for this assessment, several specific architectural choices were made:

### 1. Session Identity
- **Assumption:** `localStorage` is used to maintain a persistent `session_id`.
- **Trade-off:** This method fails to track users across cross-domain boundaries or different browsers. If a user clears their cache or opens an Incognito window, they are treated as a completely new session. 

### 2. Event Tracking Coordinates
- **Assumption:** Click tracking utilizes `clientX` and `clientY` relative to the viewport.
- **Trade-off:** If the user scrolls deeply into a page, rendering the heatmap against a static full-page screenshot requires careful coordinate normalization (e.g., mapping viewport clicks to total scroll heights (`pageX/pageY`) depending on how the heatmap canvas handles absolute vs relative rendering).

### 3. Device Fingerprinting
- **Assumption:** Device type (Mobile vs Desktop) is determined by a simplistic regular expression matched against the `navigator.userAgent`.
- **Trade-off:** User agents can be easily spoofed, and tablet devices might fall into ambiguous categorizations.

### 4. Asynchronous Event Delivery
- **Assumption:** The `fetch` API using `keepalive: true` is sufficient for beaconing data before page unloads.
- **Trade-off:** While cleaner than older methods, `navigator.sendBeacon` is arguably slightly more reliable specifically for tab-closing scenarios, but standard `fetch` allows for easier JSON header manipulation and error handling.

### 5. Security & Authentication
- **Assumption:** This implementation serves as an internal analytics PoC.
- **Trade-off:** Endpoints (both ingestion and dashboard queries) do not currently enforce JWT or API Key authentication. In production, the tracker script would need CORS restrictions tightly bound to allowed origins, and dashboard APIs would be guarded by robust authentication middleware.
