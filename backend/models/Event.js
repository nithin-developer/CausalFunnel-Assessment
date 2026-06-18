const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true,
  },
  event_type: {
    type: String,
    required: true,
    enum: ["page_view", "click"],
  },
  page_url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  click_x: {
    type: Number,
    default: null,
  },
  click_y: {
    type: Number,
    default: null,
  },
  target_tag: {
    type: String,
    default: null,
  },
  target_text: {
    type: String,
    default: null,
  },
  device_type: {
    type: String,
    enum: ["Desktop", "Mobile", "Unknown"],
    default: "Unknown",
  },
});

// Compound index for heatmap queries
EventSchema.index({ page_url: 1, event_type: 1 });

module.exports = mongoose.model("Event", EventSchema);
