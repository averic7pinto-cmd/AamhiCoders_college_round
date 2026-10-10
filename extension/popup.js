
const API_BASE = "http://127.0.0.1:8000";
const API_KEY = "HM-local-2026-change-this-key";

const statusEl = document.getElementById("status");
const connectionTitle = document.getElementById("connectionTitle");
const connectionMessage = document.getElementById("connectionMessage");
const connectionIndicator = document.getElementById("connectionIndicator");
const statusDot = document.getElementById("statusDot");
const sessionBadge = document.getElementById("sessionBadge");
const cameraStatus = document.getElementById("cameraStatus");
const cameraBadge = document.getElementById("cameraBadge");
const startButton = document.getElementById("startHandMouse");
const stopButton = document.getElementById("stopHandMouse");
const refreshButton = document.getElementById("refreshStatus");

let serverConnected = false;
let tracking = false;
let busy = false;

function showMessage(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = "status-message";

  if (type) {
    statusEl.classList.add(type);
  }
}

function renderStatus() {
  statusDot.className = "status-dot";
  connectionIndicator.className = "connection-indicator";
  sessionBadge.className = "badge";

  if (!serverConnected) {
    statusDot.classList.add("offline");
    connectionIndicator.classList.add("offline");

    connectionTitle.textContent = "Server disconnected";
    connectionMessage.textContent =
      "Start server.py and verify the extension configuration.";

    sessionBadge.textContent = "Offline";
    sessionBadge.classList.add("error");

    cameraStatus.textContent = "Waiting for HandMouse";
    cameraBadge.textContent = "OFFLINE";
    cameraBadge.className = "mini-badge muted";

    startButton.disabled = true;
    stopButton.disabled = true;
    refreshButton.disabled = busy;
    return;
  }

  statusDot.classList.add("online");
  connectionIndicator.classList.add("online");

  connectionTitle.textContent = "Server connected";
  connectionMessage.textContent = tracking
    ? "HandMouse is running."
    : "Ready to start a session.";

  sessionBadge.textContent = tracking ? "Running" : "Idle";

  if (tracking) {
    sessionBadge.classList.add("running");
    cameraStatus.textContent = "HandMouse session active";
    cameraBadge.textContent = "ACTIVE";
    cameraBadge.className = "mini-badge active";
  } else {
    cameraStatus.textContent = "Starts with HandMouse";
    cameraBadge.textContent = "IDLE";
    cameraBadge.className = "mini-badge";
  }

  startButton.disabled = busy || tracking;
  stopButton.disabled = busy || !tracking;
  refreshButton.disabled = busy;
}

async function apiRequest(endpoint, method = "GET") {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "X-HandMouse-Key": API_KEY
    },
    cache: "no-store"
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.detail || `Server returned HTTP ${response.status}`
    );
  }

  return body;
}

async function refreshStatus(showResult = false) {
  if (busy) return;

  try {
    const result = await apiRequest("/status");

    serverConnected = true;
    tracking = Boolean(result.tracking);

    renderStatus();

    if (showResult) {
      showMessage(
        tracking
          ? "Connected · HandMouse is running."
          : "Connected · HandMouse is ready.",
        "success"
      );
    }
  } catch (error) {
    serverConnected = false;
    tracking = false;
    renderStatus();

    if (showResult) {
      showMessage(
        `Connection failed · ${error.message}. Check server.py and its extension ID/CORS configuration.`,
        "error"
      );
    }
  }
}

async function runSessionAction(action) {
  if (busy) return;

  busy = true;
  startButton.disabled = true;
  stopButton.disabled = true;
  refreshButton.disabled = true;

  showMessage(
    action === "start"
      ? "Starting HandMouse..."
      : "Sending stop request..."
  );

  try {
    await apiRequest(`/${action}`, "POST");

    // Check the actual backend state instead of assuming the
    // camera or tracking thread started/stopped successfully.
    await refreshStatus();

    if (serverConnected) {
      showMessage(
        action === "start"
          ? tracking
            ? "HandMouse started. Use your configured gestures."
            : "Start request sent, but tracking is not active yet."
          : tracking
            ? "Stop requested. Waiting for tracking to stop."
            : "HandMouse stopped.",
        tracking && action === "start" ? "success" : ""
      );
    } else {
      showMessage(
        "The request was sent, but the server status could not be verified.",
        "error"
      );
    }
  } catch (error) {
    showMessage(
      `Unable to ${action} HandMouse · ${error.message}`,
      "error"
    );

    await refreshStatus();
  } finally {
    busy = false;
    renderStatus();
  }
}

startButton.addEventListener("click", () => {
  runSessionAction("start");
});

stopButton.addEventListener("click", () => {
  runSessionAction("stop");
});

refreshButton.addEventListener("click", () => {
  refreshStatus(true);
});

// Existing browser actions
async function runBrowserAction(action) {
  showMessage("Running browser action...");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.id || !tab.url?.startsWith("http")) {
      throw new Error("Open a normal website to use browser actions.");
    }

    let func;

    if (action === "highlight") {
      func = () => {
        const selector =
          'a, button, input, select, textarea, [role="button"], [onclick]';

        const elements = document.querySelectorAll(selector);
        let count = 0;

        elements.forEach((element) => {
          if (element.getClientRects().length === 0) return;

          element.style.outline = "3px solid #6477ff";
          element.style.outlineOffset = "3px";
          count++;
        });

        return `Highlighted ${count} visible elements.`;
      };
    } else if (action === "scrollDown") {
      func = () => {
        window.scrollBy({
          top: Math.round(window.innerHeight * 0.7),
          behavior: "smooth"
        });
        return "Scrolled down.";
      };
    } else if (action === "scrollUp") {
      func = () => {
        window.scrollBy({
          top: -Math.round(window.innerHeight * 0.7),
          behavior: "smooth"
        });
        return "Scrolled up.";
      };
    } else {
      func = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return "Returned to the top.";
      };
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func
    });

    showMessage(
      `Success · ${results[0]?.result || "Action completed."}`,
      "success"
    );
  } catch (error) {
    showMessage(`Browser action failed · ${error.message}`, "error");
  }
}

document.getElementById("highlight").addEventListener("click", () => {
  runBrowserAction("highlight");
});

document.getElementById("scrollDown").addEventListener("click", () => {
  runBrowserAction("scrollDown");
});

document.getElementById("scrollUp").addEventListener("click", () => {
  runBrowserAction("scrollUp");
});

document.getElementById("scrollTop").addEventListener("click", () => {
  runBrowserAction("scrollTop");
});

// Initialize the connection status when the popup opens.
refreshStatus();

// Refresh while the popup stays open.
setInterval(() => {
  if (!busy) refreshStatus();
}, 4000);
