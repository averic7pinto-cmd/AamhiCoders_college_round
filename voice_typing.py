import time
import pyautogui
import uiautomation as auto


def start_voice_typing():
    try:
        # Allow the clicked element to receive focus
        time.sleep(0.3)

        control = auto.GetFocusedControl()

        if control is None:
            return False

        control_type = control.ControlTypeName
        name = (control.Name or "").lower()
        automation_id = (control.AutomationId or "").lower()

        # Only allow text input controls
        is_text_control = control_type in {
            "EditControl",
            "DocumentControl"
        }

        if not is_text_control:
            return False

        # Allow search boxes and chat/message boxes only
        allowed_words = (
            "search",
            "find",
            "message",
            "chat",
            "type a message",
            "ask",
            "prompt"
        )

        is_allowed_field = any(
            word in name or word in automation_id
            for word in allowed_words
        )

        if not is_allowed_field:
            return False

        # Open Windows Voice Typing only for allowed fields
        pyautogui.hotkey("win", "h")
        return True

    except Exception as e:
        print("Voice typing error:", e)
        return False
