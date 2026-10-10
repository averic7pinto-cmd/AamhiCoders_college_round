
export type VoiceCommandResult = {
  matched: boolean;
  message: string;
};

const EXTENSION_ID = "blmgefakpnglhlpginljcljddahjbeoi";

type ExtensionResponse = {
  success: boolean;
  message: string;
};

function sendExtensionCommand(
  command: "scrollDown" | "scrollUp" | "scrollTop" | "highlight",
): void {
  const runtime = (
    window as Window & {
      chrome?: {
        runtime?: {
          sendMessage?: (
            extensionId: string,
            message: object,
            callback: (response?: ExtensionResponse) => void,
          ) => void;
          lastError?: { message?: string };
        };
      };
    }
  ).chrome?.runtime;

  if (!runtime?.sendMessage) {
    window.dispatchEvent(
      new CustomEvent("handsfree-command-status", {
        detail: {
          message: "HANDSFREE extension connection is unavailable."
        }
      }),
    );
    return;
  }

  runtime.sendMessage(
    EXTENSION_ID,
    {
      type: "HANDSFREE_COMMAND",
      command,
    },
    (response) => {
      const message =
        runtime.lastError?.message ||
        response?.message ||
        "No response from the extension.";

      window.dispatchEvent(
        new CustomEvent("handsfree-command-status", {
          detail: { message }
        }),
      );
    },
  );
}

export function executeVoiceCommand(
  transcript: string,
): VoiceCommandResult {
  const command = transcript
    .toLowerCase()
    .trim()
    .replace(/[.!?]+$/g, "");

  if (/^(scroll down|page down)$/.test(command)) {
    sendExtensionCommand("scrollDown");
    return { matched: true, message: "Sending scroll-down command..." };
  }

  if (/^(scroll up|page up)$/.test(command)) {
    sendExtensionCommand("scrollUp");
    return { matched: true, message: "Sending scroll-up command..." };
  }

  if (/^(go to top|scroll to top|top of page)$/.test(command)) {
    sendExtensionCommand("scrollTop");
    return { matched: true, message: "Sending go-to-top command..." };
  }

  if (/^(highlight elements|highlight buttons|show clickable elements)$/.test(command)) {
    sendExtensionCommand("highlight");
    return { matched: true, message: "Sending highlight command..." };
  }

  return {
    matched: false,
    message: `Command not recognized: "${transcript}"`,
  };
}
