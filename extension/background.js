
const APP_URLS = [
  "http://localhost:",
  "http://127.0.0.1:"
];

function isHandsfreeApp(url = "") {
  return APP_URLS.some((prefix) => url.startsWith(prefix));
}

async function rememberTargetTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);

    if (
      tab.url?.startsWith("http") &&
      !isHandsfreeApp(tab.url)
    ) {
      await chrome.storage.local.set({
        handsfreeTargetTabId: tabId
      });
    }
  } catch {
    // The tab may have closed.
  }
}

// Remember the last normal website visited.
chrome.tabs.onActivated.addListener(({ tabId }) => {
  rememberTargetTab(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    if (!isHandsfreeApp(tab.url)) {
      rememberTargetTab(tabId);
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { handsfreeTargetTabId } =
    await chrome.storage.local.get("handsfreeTargetTabId");

  if (handsfreeTargetTabId === tabId) {
    await chrome.storage.local.remove("handsfreeTargetTabId");
  }
});

chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (message?.type !== "HANDSFREE_COMMAND") return;

    const senderUrl = sender.url || "";

    if (
      !senderUrl.startsWith("http://localhost:") &&
      !senderUrl.startsWith("http://127.0.0.1:")
    ) {
      sendResponse({
        success: false,
        message: "Untrusted sender."
      });
      return;
    }

    const allowedCommands = [
      "scrollDown",
      "scrollUp",
      "scrollTop",
      "highlight"
    ];

    if (!allowedCommands.includes(message.command)) {
      sendResponse({
        success: false,
        message: "Unsupported command."
      });
      return;
    }

    (async () => {
      try {
        const { handsfreeTargetTabId } =
          await chrome.storage.local.get("handsfreeTargetTabId");

        if (handsfreeTargetTabId == null) {
          throw new Error(
            "No target website saved. Open a website first, then return to HANDSFREE."
          );
        }

        const tab = await chrome.tabs.get(handsfreeTargetTabId);

        if (!tab.url?.startsWith("http") || isHandsfreeApp(tab.url)) {
          throw new Error(
            "Target website unavailable. Open your website again."
          );
        }

        const results = await chrome.scripting.executeScript({
          target: { tabId: handsfreeTargetTabId },
          func: (command) => {
            if (command === "scrollDown") {
              window.scrollBy({
                top: Math.round(window.innerHeight * 0.7),
                behavior: "smooth"
              });
              return "Scrolled down.";
            }

            if (command === "scrollUp") {
              window.scrollBy({
                top: -Math.round(window.innerHeight * 0.7),
                behavior: "smooth"
              });
              return "Scrolled up.";
            }

            if (command === "scrollTop") {
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
              return "Returned to the top.";
            }

            if (command === "highlight") {
              const elements = document.querySelectorAll(
                'a, button, input, select, textarea, [role="button"], [onclick]'
              );

              let count = 0;

              elements.forEach((element) => {
                if (element.getClientRects().length === 0) return;

                element.style.outline = "3px solid #4263ff";
                element.style.outlineOffset = "3px";
                count++;
              });

              return `Highlighted ${count} visible elements.`;
            }

            throw new Error("Unsupported command.");
          },
          args: [message.command]
        });

        sendResponse({
          success: true,
          message: results[0]?.result || "Command completed."
        });
      } catch (error) {
        sendResponse({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Command failed."
        });
      }
    })();

    return true;
  }
);
