/**
 * CausalFunnel — User Analytics Tracker Script
 *
 * Drop this script into any webpage to track page_view and click events.
 * Events are sent to the analytics backend API.
 *
 * Usage:
 *   <script src="tracker.js" data-api="http://localhost:5000/api/events"></script>
 */
(function () {
  "use strict";

  // ── Configuration ──────────────────────────────────────────────────
  const scriptTag = document.currentScript;
  const API_ENDPOINT =
    (scriptTag && scriptTag.getAttribute("data-api")) ||
    "http://localhost:5000/api/events";

  // ── Session Management ─────────────────────────────────────────────
  function getSessionId() {
    let sessionId = localStorage.getItem("cf_session_id");

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("cf_session_id", sessionId);
    }

    return sessionId;
  }

  function getDeviceType() {
    return /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
  }

  // ── Send Event to Backend ──────────────────────────────────────────
  function sendEvent(eventData) {
    eventData.device_type = getDeviceType();
    try {
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
        keepalive: true,
      }).catch(function (err) {
        console.warn("[CausalFunnel Tracker] Failed to send event:", err);
      });
    } catch (err) {
      console.warn("[CausalFunnel Tracker] Error:", err);
    }
  }

  // ── Page View Tracking ─────────────────────────────────────────────
  window.addEventListener("load", function () {
    sendEvent({
      session_id: getSessionId(),
      event_type: "page_view",
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  });

  // ── Click Tracking ─────────────────────────────────────────────────
  document.addEventListener("click", function (e) {
    let targetText = "";
    let targetTag = "";
    
    if (e.target) {
      targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : "";
      targetText = e.target.textContent ? e.target.textContent.trim().substring(0, 100) : "";
    }

    sendEvent({
      session_id: getSessionId(),
      event_type: "click",
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      click_x: e.clientX,
      click_y: e.clientY,
      target_tag: targetTag,
      target_text: targetText
    });
  });
})();
