
import time
import pyautogui
import uiautomation as auto


def start_voice_typing():
    try:
        time.sleep(0.3)

        control = auto.GetFocusedControl()

        # Don't rely on the textbox name being "search" or "address".
        if control is not None:
            control_type = control.ControlTypeName

            if control_type in {
                "EditControl",
                "DocumentControl"
            }:
                pyautogui.hotkey("win", "h")
                return True

        # Fallback: try Windows voice typing anyway.
        # This helps when WhatsApp doesn't expose its textbox properly.
        pyautogui.hotkey("win", "h")
        return True

    except Exception as e:
        print("Voice typing error:", e)
        return False
