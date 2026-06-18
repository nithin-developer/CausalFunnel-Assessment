# User Analytics Application

A full-stack application that tracks user interactions (page views & clicks) on a webpage and displays them in a premium analytics dashboard.

Built as part of the **CausalFunnel Full Stack Engineer** assessment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Dashboard** | React 19 + Vite + TypeScript |
| **Tracking Script** | Vanilla JavaScript |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **HTTP Client** | Axios |
| **Routing** | React Router v7 |

---

## Project Structure

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

## Setup & Running

### Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on `mongodb://localhost:27017`

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

The API server will start at `http://localhost:5000`.

### 2. Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

The dashboard will open at `http://localhost:5173`.

### 3. Demo Page (Generate Events)

Open `tracker-script/demo.html` directly in your browser. Every page load and click will send events to the backend API.

> **Tip:** Click around the demo page, then switch to the dashboard to see your sessions and heatmap data appear.

---

## API Documentation

### POST `/api/events` — Receive an event

```json
{
  "session_id": "abc123",
  "event_type": "page_view | click",
  "page_url": "http://localhost:5173",
  "timestamp": "2026-06-18T10:30:00.000Z",
  "click_x": 220,
  "click_y": 340
}
```

### GET `/api/sessions` — List sessions with event counts

Returns an array of sessions with `_id`, `total_events`, `first_event`, `last_event`.

### GET `/api/session/:id` — User journey for a session

Returns all events for a session, sorted by timestamp (ascending).

### GET `/api/heatmap?page=<url>` — Click data for heatmap

Returns click coordinates for a specific page URL.

### GET `/api/pages` — List all tracked page URLs

Returns an array of distinct page URLs.

---

## Database Schema

### Event Collection

```javascript
{
  _id: ObjectId,
  session_id: "abc123",         // UUID stored in localStorage
  event_type: "click",          // "page_view" | "click"
  page_url: "http://...",       // Full page URL
  timestamp: Date,              // ISO timestamp
  click_x: 220,                // Click X coordinate (null for page_view)
  click_y: 340                 // Click Y coordinate (null for page_view)
}
```

**Indexes:**
- `session_id` — fast session lookups
- `{ page_url, event_type }` — fast heatmap queries

---

## Dashboard Features

### Sessions View
- Overview stats: total sessions, total events, avg events/session
- Sortable sessions table with session ID, event count, first/last seen, duration
- Click a session → slide-over panel shows the **user journey** as an interactive timeline

### Heatmap View
- Dropdown to select a tracked page URL
- Visual click map rendering click positions as animated dots
- Stats: total clicks, unique sessions

---

## Assumptions & Trade-offs

- **Session ID** is stored in `localStorage` using `crypto.randomUUID()`. A new session is created per browser/device.
- Only `page_view` and `click` events are tracked (no scroll, form, or custom events).
- Heatmap renders clicks as positioned dots — not a density-based heatmap (kept simple per spec).
- **No authentication** — the API is open (out of scope for this assessment).
- Click coordinates use `clientX`/`clientY` (viewport-relative), not page-relative.
- The tracker script is configured via `data-api` attribute for flexible endpoint targeting.

---

## Extra Features (Beyond Base Requirements)

- ✅ **Session start & end time** with duration calculation
- ✅ **Page filter** dropdown in Heatmap view
- ✅ **Stats overview cards** with computed metrics
- ✅ **Slide-over panel** for user journey (not page navigation)
- ✅ **Premium dark theme** with glassmorphism, animations, and Inter typography
- ✅ **Demo e-commerce page** for generating real event data
- ✅ **Responsive design** with collapsible sidebar
