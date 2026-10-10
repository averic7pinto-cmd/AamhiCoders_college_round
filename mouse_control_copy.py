import os
import time
import threading
import traceback

import cv2
import mediapipe as mp
import pyautogui

from voice_typing import start_voice_typing


# --------------------------------------------------
# SHARED STATE
# --------------------------------------------------

stop_event = threading.Event()
state_lock = threading.Lock()
frame_lock = threading.Lock()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

live_state = {
    "running": False,
    "phase": "stopped",  # stopped | loading-models | opening-camera | running
    "hand_detected": False,
    "landmarks": [],
    "gesture": "Waiting for gesture",
    "confidence": None,
    "head_direction": "CENTER",
    "error": None,
    "updated_at": None,
}

# Latest annotated JPEG frame, streamed to the web UI.
_latest_jpeg = None
_latest_frame_id = 0

# pyautogui waits 0.1 s after every call by default, which
# makes cursor control laggy. Disable it.
pyautogui.PAUSE = 0
pyautogui.FAILSAFE = True

HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (17, 18), (18, 19), (19, 20),
    (0, 17),
]


def update_state(**updates):
    with state_lock:
        live_state.update(updates)


def get_live_state():
    with state_lock:
        return dict(live_state)


def get_latest_frame():
    """Return (frame_id, jpeg_bytes) for the web stream."""
    with frame_lock:
        return _latest_frame_id, _latest_jpeg


def _publish_frame(frame):
    global _latest_jpeg, _latest_frame_id

    ok, buffer = cv2.imencode(
        ".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70]
    )

    if ok:
        with frame_lock:
            _latest_jpeg = buffer.tobytes()
            _latest_frame_id += 1


def _clear_frame():
    global _latest_jpeg

    with frame_lock:
        _latest_jpeg = None


def stop():
    stop_event.set()


# --------------------------------------------------
# DRAWING
# --------------------------------------------------

def draw_hand(frame, landmarks):
    height, width = frame.shape[:2]

    points = [
        (int(p.x * width), int(p.y * height)) for p in landmarks
    ]

    # Colors are BGR.
    for a, b in HAND_CONNECTIONS:
        cv2.line(frame, points[a], points[b], (99, 255, 184), 2)

    for index, point in enumerate(points):
        if index == 8:
            cv2.circle(frame, point, 6, (249, 232, 103), -1)
            cv2.circle(frame, point, 6, (255, 255, 255), 1)
        else:
            cv2.circle(frame, point, 3, (255, 255, 255), -1)


# --------------------------------------------------
# RULE-BASED GESTURE CLASSIFIER
# This is a fallback classifier, not an ML model.
# MediaPipe provides the 21 hand landmarks.
# --------------------------------------------------

def classify_gesture(landmarks):
    finger_pairs = [
        (8, 6),    # Index
        (12, 10),  # Middle
        (16, 14),  # Ring
        (20, 18),  # Little
    ]

    fingers_up = [
        landmarks[tip].y < landmarks[pip].y
        for tip, pip in finger_pairs
    ]

    index_up, middle_up, ring_up, little_up = fingers_up

    # Simple thumb-extension heuristic.
    thumb_extended = abs(landmarks[4].x - landmarks[2].x) > 0.08

    if not any(fingers_up) and not thumb_extended:
        return "Fist"

    if all(fingers_up):
        return "Open Palm"

    if index_up and middle_up and not ring_up and not little_up:
        return "Peace"

    if index_up and not middle_up and not ring_up and not little_up:
        return "Point"

    if thumb_extended and not any(fingers_up):
        return "Thumbs Up"

    return "Unknown"


# --------------------------------------------------
# CAMERA
# --------------------------------------------------

def open_camera(attempts=10, delay=0.5):
    """Open the webcam, retrying while the browser releases it."""
    backend = cv2.CAP_DSHOW if os.name == "nt" else cv2.CAP_ANY

    for _ in range(attempts):
        if stop_event.is_set():
            return None

        cap = cv2.VideoCapture(0, backend)

        if cap.isOpened():
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            return cap

        cap.release()
        time.sleep(delay)

    return None


# --------------------------------------------------
# MAIN TRACKING PIPELINE
# --------------------------------------------------

def run():
    stop_event.clear()

    update_state(
        running=True,
        phase="loading-models",
        hand_detected=False,
        landmarks=[],
        gesture="Starting tracking...",
        confidence=None,
        head_direction="CENTER",
        error=None,
        updated_at=time.time(),
    )

    cap = None

    try:
        hand_model_path = os.path.join(BASE_DIR, "hand_landmarker.task")
        face_model_path = os.path.join(BASE_DIR, "face_landmarker.task")

        if not os.path.isfile(hand_model_path):
            raise FileNotFoundError(
                f"Hand model not found: {hand_model_path}"
            )

        if not os.path.isfile(face_model_path):
            raise FileNotFoundError(
                f"Face model not found: {face_model_path}"
            )

        BaseOptions = mp.tasks.BaseOptions
        RunningMode = mp.tasks.vision.RunningMode

        hand_options = mp.tasks.vision.HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=hand_model_path),
            running_mode=RunningMode.VIDEO,
            num_hands=1,
        )

        face_options = mp.tasks.vision.FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=face_model_path),
            running_mode=RunningMode.VIDEO,
            num_faces=1,
        )

        screen_width, screen_height = pyautogui.size()

        smooth_x, smooth_y = 0.0, 0.0
        smoothing = 0.25

        last_head_click_time = 0.0
        head_click_delay = 0.8
        previous_head_turn = "CENTER"
        head_turn_threshold = 0.12

        frame_number = 0
        failed_reads = 0

        update_state(phase="opening-camera", updated_at=time.time())
        cap = open_camera()

        if cap is None:
            if stop_event.is_set():
                return
            raise RuntimeError(
                "Could not open webcam. Close other apps "
                "using the camera and try again."
            )

        update_state(phase="loading-models", updated_at=time.time())

        with (
            mp.tasks.vision.HandLandmarker.create_from_options(
                hand_options
            ) as detector,
            mp.tasks.vision.FaceLandmarker.create_from_options(
                face_options
            ) as face_detector,
        ):
            update_state(phase="running", updated_at=time.time())

            while cap.isOpened() and not stop_event.is_set():
                success, frame = cap.read()

                if not success:
                    # Webcams often fail a few reads at startup.
                    failed_reads += 1

                    if failed_reads > 30:
                        raise RuntimeError(
                            "Could not read a webcam frame."
                        )

                    time.sleep(0.03)
                    continue

                failed_reads = 0

                # Mirror the image for natural interaction.
                frame = cv2.flip(frame, 1)

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB,
                    data=rgb,
                )

                timestamp = frame_number * 33
                frame_number += 1

                result = detector.detect_for_video(mp_image, timestamp)
                face_result = face_detector.detect_for_video(
                    mp_image, timestamp
                )

                # --------------------------------------
                # HEAD DIRECTION
                # --------------------------------------

                head_turn = "CENTER"

                if face_result.face_landmarks:
                    face = face_result.face_landmarks[0]

                    nose_x = face[1].x
                    eye_midpoint = (face[33].x + face[263].x) / 2
                    eye_distance = abs(face[263].x - face[33].x)

                    if eye_distance > 0:
                        turn_value = (nose_x - eye_midpoint) / eye_distance

                        if turn_value < -head_turn_threshold:
                            head_turn = "LEFT"
                        elif turn_value > head_turn_threshold:
                            head_turn = "RIGHT"

                update_state(
                    head_direction=head_turn,
                    updated_at=time.time(),
                )

                current_time = time.time()

                if (
                    head_turn != "CENTER"
                    and previous_head_turn == "CENTER"
                    and current_time - last_head_click_time
                    >= head_click_delay
                ):
                    if head_turn == "LEFT":
                        pyautogui.click(button="left")

                        try:
                            start_voice_typing()
                        except Exception:
                            print("Voice typing could not start:")
                            traceback.print_exc()

                    elif head_turn == "RIGHT":
                        pyautogui.click(button="right")

                    last_head_click_time = current_time

                previous_head_turn = head_turn

                # --------------------------------------
                # HAND DETECTION AND GESTURE CLASSIFICATION
                # --------------------------------------

                if result.hand_landmarks:
                    landmarks = result.hand_landmarks[0]
                    prediction = classify_gesture(landmarks)

                    # Landmarks come from the already-mirrored frame,
                    # so they match the streamed video directly.
                    landmark_data = [
                        {
                            "x": float(point.x),
                            "y": float(point.y),
                            "z": float(point.z),
                        }
                        for point in landmarks
                    ]

                    update_state(
                        hand_detected=True,
                        landmarks=landmark_data,
                        gesture=prediction,
                        confidence=None,
                        updated_at=time.time(),
                    )

                    # Point, Peace and Open Palm move the cursor.
                    if prediction in ("Point", "Peace", "Open Palm"):
                        finger = landmarks[8]

                        x = (finger.x - 0.20) / 0.60
                        y = (finger.y - 0.20) / 0.60

                        x = max(0.0, min(1.0, x))
                        y = max(0.0, min(1.0, y))

                        target_x = int(x * (screen_width - 1))
                        target_y = int(y * (screen_height - 1))

                        if smooth_x == 0 and smooth_y == 0:
                            smooth_x = target_x
                            smooth_y = target_y
                        else:
                            smooth_x += (target_x - smooth_x) * smoothing
                            smooth_y += (target_y - smooth_y) * smoothing

                        pyautogui.moveTo(int(smooth_x), int(smooth_y))

                    draw_hand(frame, landmarks)

                else:
                    update_state(
                        hand_detected=False,
                        landmarks=[],
                        gesture="No hand detected",
                        confidence=None,
                        updated_at=time.time(),
                    )

                # Stream the annotated frame to the web UI
                # (no cv2.imshow: it is unsafe in a server thread).
                _publish_frame(frame)

    except Exception as exc:
        traceback.print_exc()

        update_state(
            running=False,
            phase="stopped",
            error=f"{type(exc).__name__}: {exc}",
            updated_at=time.time(),
        )

        raise

    finally:
        if cap is not None:
            cap.release()

        _clear_frame()

        existing_state = get_live_state()

        update_state(
            running=False,
            phase="stopped",
            hand_detected=False,
            landmarks=[],
            gesture=(
                "Tracking failed"
                if existing_state.get("error")
                else "Tracking stopped"
            ),
            confidence=None,
            updated_at=time.time(),
        )


if __name__ == "__main__":
    run()