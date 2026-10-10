
(() => {
  if (window.__handsfreeContentLoaded) return;
  window.__handsfreeContentLoaded = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "HANDSFREE_COMMAND") return;

    try {
      switch (message.command) {
        case "scrollDown":
          window.scrollBy({
            top: Math.round(window.innerHeight * 0.7),
            behavior: "smooth"
          });
          sendResponse({ success: true, message: "Scrolled down." });
          break;

        case "scrollUp":
          window.scrollBy({
            top: -Math.round(window.innerHeight * 0.7),
            behavior: "smooth"
          });
          sendResponse({ success: true, message: "Scrolled up." });
          break;

        case "scrollTop":
          window.scrollTo({ top: 0, behavior: "smooth" });
          sendResponse({ success: true, message: "Returned to the top." });
          break;

        case "highlight": {
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

          sendResponse({
            success: true,
            message: `Highlighted ${count} visible elements.`
          });
          break;
        }

        default:
          sendResponse({
            success: false,
            message: "Unsupported HANDSFREE command."
          });
      }
    } catch (error) {
      sendResponse({
        success: false,
        message: error instanceof Error ? error.message : "Command failed."
      });
    }

    return true;
  });
})();
