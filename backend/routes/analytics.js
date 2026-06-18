const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// POST /api/events — Receive and store a tracking event
router.post("/events", async (req, res) => {
  try {
    const { session_id, event_type, page_url, timestamp, click_x, click_y, target_tag, target_text, device_type } =
      req.body;

    if (!session_id || !event_type || !page_url) {
      return res.status(400).json({
        success: false,
        error: "session_id, event_type, and page_url are required",
      });
    }

    const event = new Event({
      session_id,
      event_type,
      page_url,
      timestamp: timestamp || new Date(),
      click_x: click_x ?? null,
      click_y: click_y ?? null,
      target_tag: target_tag ?? null,
      target_text: target_text ?? null,
      device_type: device_type ?? "Unknown",
    });

    await event.save();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error saving event:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/sessions — List all sessions with event counts and timestamps
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: "$session_id",
          total_events: { $sum: 1 },
          page_views: {
            $sum: { $cond: [{ $eq: ["$event_type", "page_view"] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] }
          },
          unique_pages: { $addToSet: "$page_url" },
          first_event: { $min: "$timestamp" },
          last_event: { $max: "$timestamp" },
          device_type: { $first: "$device_type" },
        },
      },
      {
        $addFields: {
          unique_page_count: { $size: "$unique_pages" }
        }
      },
      { $sort: { last_event: -1 } },
    ]);

    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/session/:id — Fetch all events for a specific session (user journey)
router.get("/session/:id", async (req, res) => {
  try {
    const events = await Event.find({
      session_id: req.params.id,
    }).sort({ timestamp: 1 });

    res.json(events);
  } catch (err) {
    console.error("Error fetching session events:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/heatmap?page=<url> — Fetch click data for a specific page
router.get("/heatmap", async (req, res) => {
  try {
    const page = req.query.page;

    if (!page) {
      return res.status(400).json({ error: "page query parameter is required" });
    }

    const clicks = await Event.find({
      page_url: page,
      event_type: "click",
    }).select("click_x click_y timestamp session_id target_text target_tag");

    res.json(clicks);
  } catch (err) {
    console.error("Error fetching heatmap data:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/pages — Fetch distinct page URLs (for heatmap dropdown)
router.get("/pages", async (req, res) => {
  try {
    const pages = await Event.distinct("page_url");
    res.json(pages);
  } catch (err) {
    console.error("Error fetching pages:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
