import importlib
import os
import time
import threading
import traceback

try:
    cv2 = importlib.import_module("cv2")
except ModuleNotFoundError as exc:
    if exc.name != "cv2":
        raise
    cv2 = None

try:
    pyautogui = importlib.import_module("pyautogui")
except ModuleNotFoundError as exc:
    if exc.name != "pyautogui":
        raise
    pyautogui = None

try:
    mp = importlib.import_module("mediapipe")
except ModuleNotFoundError as exc:
    if exc.name != "mediapipe":
        raise
    mp = None

from voice_typing import start_voice_typing


# --------------------------------------------------
# SHARED STATE
# --------------------------------------------------

stop_event = threading.Event()
state_lock = threading.Lock()
frame_lock = threading.Lock()
settings_lock = threading.Lock()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

live_state = {
    "running": False,
    "phase": "stopped",
    "hand_detected": False,
    "landmarks": [],
    "gesture": "Waiting for gesture",
    "confidence": None,

    # Face and head data exposed to the existing frontend.
    "face_detected": False,
    "head_yaw": 0.0,
    "head_pitch": 0.0,
    "head_direction": "CENTER",
    "head_vertical": "CENTER",

    # Camera diagnostics.
    "brightness": None,
    "frame_count": 0,

    "error": None,
    "updated_at": None,
}


# --------------------------------------------------
# SETTINGS
# Existing frontend calibration/settings interface.
# --------------------------------------------------

settings = {
    "yaw_threshold": 0.12,
    "yaw_center": 0.0,
    "pitch_center": 0.0,
    "sensitivity": 6,
    "smoothing": 60,
    "head_actions": True,
    "cursor_control": True,
}


# A camera image with average brightness below this
# value is considered black during webcam startup.
BLACK_LIMIT = 6.0


# Latest annotated JPEG frame streamed to the web UI.
_latest_jpeg = None
_latest_frame_id = 0


# Disable PyAutoGUI's default delay when available.
if pyautogui is not None:
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


# --------------------------------------------------
# SHARED STATE HELPERS
# --------------------------------------------------

def update_state(**updates):
    with state_lock:
        live_state.update(updates)


def get_live_state():
    with state_lock:
        return dict(live_state)


def apply_settings(**updates):
    """Update only known settings without replacing the settings dict."""
    with settings_lock:
        for key, value in updates.items():
            if key in settings and value is not None:
                settings[key] = value


def get_settings():
    with settings_lock:
        return dict(settings)


def get_latest_frame():
    """Return (frame_id, jpeg_bytes) for the web stream."""
    with frame_lock:
        return _latest_frame_id, _latest_jpeg


def _publish_frame(frame):
    global _latest_jpeg, _latest_frame_id

    ok, buffer = cv2.imencode(
        ".jpg",
        frame,
        [cv2.IMWRITE_JPEG_QUALITY, 70],
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
    """Request that the tracking loop stop."""
    stop_event.set()


# --------------------------------------------------
# DRAWING
# --------------------------------------------------

def draw_hand(frame, landmarks):
    height, width = frame.shape[:2]

    points = [
        (int(p.x * width), int(p.y * height))
        for p in landmarks
    ]

    # OpenCV uses BGR color ordering.
    for a, b in HAND_CONNECTIONS:
        cv2.line(
            frame,
            points[a],
            points[b],
            (99, 255, 184),
            2,
        )

    for index, point in enumerate(points):
        if index == 8:
            cv2.circle(
                frame,
                point,
                6,
                (249, 232, 103),
                -1,
            )
            cv2.circle(
                frame,
                point,
                6,
                (255, 255, 255),
                1,
            )
        else:
            cv2.circle(
                frame,
                point,
                3,
                (255, 255, 255),
                -1,
            )


# --------------------------------------------------
# RULE-BASED GESTURE CLASSIFIER
# This is a heuristic classifier, not an ML model.
# MediaPipe provides the 21 hand landmarks.
# --------------------------------------------------

def classify_gesture(landmarks):
    finger_pairs = [
        (8, 6),      # Index
        (12, 10),    # Middle
        (16, 14),    # Ring
        (20, 18),    # Little
    ]

    fingers_up = [
        landmarks[tip].y < landmarks[pip].y
        for tip, pip in finger_pairs
    ]

    index_up, middle_up, ring_up, little_up = fingers_up

    # Simple thumb-extension heuristic.
    thumb_extended = (
        abs(landmarks[4].x - landmarks[2].x) > 0.08
    )

    if not any(fingers_up) and not thumb_extended:
        return "Fist"

    if all(fingers_up):
        return "Open Palm"

    if (
        index_up
        and middle_up
        and not ring_up
        and not little_up
    ):
        return "Peace"

    if (
        index_up
        and not middle_up
        and not ring_up
        and not little_up
    ):
        return "Point"

    if thumb_extended and not any(fingers_up):
        return "Thumbs Up"

    return "Unknown"


# --------------------------------------------------
# CAMERA
#
# Retains the old multi-backend startup logic:
# - DirectShow
# - Media Foundation
# - Automatic backend
# - Camera warm-up
# - Black-frame detection
# - Dark-but-working fallback
# --------------------------------------------------

def _backends():
    if os.name == "nt":
        return [
            cv2.CAP_DSHOW,
            cv2.CAP_MSMF,
            cv2.CAP_ANY,
        ]

    return [cv2.CAP_ANY]


def _warm_up(cap, tries=30):
    """
    Read frames during camera startup.

    Return the first acceptable brightness, or the best
    brightness seen if the image remains dark. Return None
    if no frame could be read.
    """
    best = None

    for _ in range(tries):
        if stop_event.is_set():
            return best

        ok, frame = cap.read()

        if ok and frame is not None:
            mean = float(frame[::8, ::8].mean())

            best = (
                mean
                if best is None
                else max(best, mean)
            )

            if mean > BLACK_LIMIT:
                return mean

        time.sleep(0.03)

    return best


def _open(backend):
    cap = cv2.VideoCapture(0, backend)

    if not cap.isOpened():
        cap.release()
        return None

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    return cap


def open_camera(attempts=4, delay=0.5):
    """
    Open the webcam using multiple backends.

    Prefer a backend producing a visible image. If all
    readable backends produce dark frames, retry the first
    backend that successfully opened and returned frames.
    """
    dark_backend = None

    for _ in range(attempts):
        for backend in _backends():
            if stop_event.is_set():
                return None

            cap = _open(backend)

            if cap is None:
                continue

            brightness = _warm_up(cap)

            if stop_event.is_set():
                cap.release()
                return None

            if (
                brightness is not None
                and brightness > BLACK_LIMIT
            ):
                return cap

            # Opened but produced a dark/unreadable image.
            cap.release()

            if (
                brightness is not None
                and dark_backend is None
            ):
                dark_backend = backend

        if dark_backend is not None:
            break

        time.sleep(delay)

    if (
        dark_backend is not None
        and not stop_event.is_set()
    ):
        return _open(dark_backend)

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
        face_detected=False,
        head_yaw=0.0,
        head_pitch=0.0,
        head_direction="CENTER",
        head_vertical="CENTER",
        brightness=None,
        frame_count=0,
        error=None,
        updated_at=time.time(),
    )

    cap = None

    try:
        # ------------------------------------------
        # DEPENDENCY CHECKS
        # ------------------------------------------

        if pyautogui is None:
            raise RuntimeError(
                "PyAutoGUI is not installed in this Python "
                "environment. Install it with: "
                "python -m pip install pyautogui"
            )

        if mp is None:
            raise RuntimeError(
                "MediaPipe is not installed in this Python "
                "environment. Install it with: "
                "python -m pip install mediapipe"
            )

        if cv2 is None:
            raise RuntimeError(
                "OpenCV is not installed in this Python "
                "environment. Install it with: "
                "python -m pip install opencv-python"
            )

        # ------------------------------------------
        # MODEL PATHS
        # ------------------------------------------

        hand_model_path = os.path.join(
            BASE_DIR,
            "hand_landmarker.task",
        )

        face_model_path = os.path.join(
            BASE_DIR,
            "face_landmarker.task",
        )

        if not os.path.isfile(hand_model_path):
            raise FileNotFoundError(
                f"Hand model not found: {hand_model_path}"
            )

        if not os.path.isfile(face_model_path):
            raise FileNotFoundError(
                f"Face model not found: {face_model_path}"
            )

        # ------------------------------------------
        # MEDIAPIPE CONFIGURATION
        # ------------------------------------------

        BaseOptions = mp.tasks.BaseOptions
        RunningMode = mp.tasks.vision.RunningMode

        hand_options = (
            mp.tasks.vision.HandLandmarkerOptions(
                base_options=BaseOptions(
                    model_asset_path=hand_model_path,
                ),
                running_mode=RunningMode.VIDEO,
                num_hands=1,
            )
        )

        face_options = (
            mp.tasks.vision.FaceLandmarkerOptions(
                base_options=BaseOptions(
                    model_asset_path=face_model_path,
                ),
                running_mode=RunningMode.VIDEO,
                num_faces=1,
            )
        )

        screen_width, screen_height = pyautogui.size()

        # ------------------------------------------
        # CURSOR SMOOTHING
        # ------------------------------------------

        smooth_x, smooth_y = 0.0, 0.0

        # ------------------------------------------
        # HEAD LEFT/RIGHT CLICK CONFIGURATION
        # ------------------------------------------

        last_head_click_time = 0.0
        head_click_delay = 0.8
        previous_head_turn = "CENTER"
        head_turn_threshold = 0.12

        # ------------------------------------------
        # HEAD UP/DOWN SCROLL CONFIGURATION
        # ------------------------------------------

        previous_head_vertical = "CENTER"
        last_scroll_time = 0.0
        scroll_repeat_delay = 0.15
        scroll_step = 120

        # Preserve the old calibration duration.
        calibration_frames = 45

        # Improved threshold and confirmation from the
        # new version. Require consecutive frames to
        # reduce accidental scrolling from small movements.
        pitch_threshold = 0.07
        pitch_confirm_frames = 3
        pitch_samples = []
        pitch_baseline = None
        up_count = 0
        down_count = 0

        # ------------------------------------------
        # FRAME TRACKING
        # ------------------------------------------

        frame_number = 0
        failed_reads = 0

        update_state(
            phase="opening-camera",
            updated_at=time.time(),
        )

        cap = open_camera()

        if cap is None:
            if stop_event.is_set():
                return

            raise RuntimeError(
                "Could not open webcam. Close other apps "
                "(including browser tabs) using the camera "
                "and try again."
            )

        update_state(
            phase="loading-models",
            updated_at=time.time(),
        )

        # ------------------------------------------
        # TRACKING MODELS
        # ------------------------------------------

        with mp.tasks.vision.HandLandmarker.create_from_options(
    hand_options
) as detector, mp.tasks.vision.FaceLandmarker.create_from_options(
    face_options
) as face_detector:
            update_state(
                phase="running",
                updated_at=time.time(),
            )

            while cap.isOpened() and not stop_event.is_set():
                success, frame = cap.read()

                if not success:
                    failed_reads += 1

                    if failed_reads > 30:
                        raise RuntimeError(
                            "Could not read a webcam frame."
                        )

                    time.sleep(0.03)
                    continue

                failed_reads = 0

                # Take a thread-safe snapshot of settings
                # for this frame.
                cfg = get_settings()

                # --------------------------------------
                # MIRROR CAMERA IMAGE
                # --------------------------------------

                frame = cv2.flip(frame, 1)

                # Update brightness periodically.
                if frame_number % 15 == 0:
                    update_state(
                        brightness=round(
                            float(frame[::8, ::8].mean()),
                            1,
                        ),
                    )

                rgb = cv2.cvtColor(
                    frame,
                    cv2.COLOR_BGR2RGB,
                )

                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB,
                    data=rgb,
                )

                timestamp = frame_number * 33
                frame_number += 1

                result = detector.detect_for_video(
                    mp_image,
                    timestamp,
                )

                face_result = face_detector.detect_for_video(
                    mp_image,
                    timestamp,
                )

                # --------------------------------------
                # HEAD POSE
                #
                # head_yaw: numeric left/right value
                # head_pitch: numeric face-pose value
                # head_direction: LEFT/RIGHT/CENTER
                # head_vertical: UP/DOWN/CENTER/CALIBRATING
                #
                # These names and types are kept compatible
                # with the existing frontend.
                # --------------------------------------

                head_turn = "CENTER"
                head_vertical = "CENTER"

                face_found = False
                yaw = 0.0
                pitch = 0.0

                if face_result.face_landmarks:
                    face = face_result.face_landmarks[0]

                    nose = face[1]

                    eye_mid_x = (
                        face[33].x + face[263].x
                    ) / 2

                    eye_mid_y = (
                        face[33].y + face[263].y
                    ) / 2

                    eye_distance = abs(
                        face[263].x - face[33].x
                    )

                    # ----------------------------------
                    # NUMERIC YAW AND PITCH
                    # Used by the existing calibration UI.
                    # ----------------------------------

                    if eye_distance > 0:
                        face_found = True

                        yaw = (
                            nose.x - eye_mid_x
                        ) / eye_distance

                        pitch = (
                            nose.y - eye_mid_y
                        ) / eye_distance

                        # Apply the existing configurable
                        # yaw center and threshold.
                        turn_value = (
                            yaw - cfg["yaw_center"]
                        )

                        effective_yaw_threshold = max(
                            0.01,
                            abs(cfg["yaw_threshold"]),
                        )

                        if (
                            turn_value
                            < -effective_yaw_threshold
                        ):
                            head_turn = "LEFT"

                        elif (
                            turn_value
                            > effective_yaw_threshold
                        ):
                            head_turn = "RIGHT"

                    # ----------------------------------
                    # UP/DOWN HEAD PITCH
                    #
                    # Calibrate a neutral baseline first.
                    # Use normalized face height and require
                    # consecutive frames for activation.
                    # ----------------------------------

                    face_height = (
                        face[152].y - face[10].y
                    )

                    if face_height > 0:
                        pitch_raw = (
                            nose.y - eye_mid_y
                        ) / face_height

                        # Respect the existing calibration
                        # setting without changing its meaning.
                        effective_pitch_baseline = (
                            pitch_baseline
                            if pitch_baseline is not None
                            else None
                        )

                        if effective_pitch_baseline is None:
                            pitch_samples.append(pitch_raw)

                            head_vertical = "CALIBRATING"

                            if (
                                len(pitch_samples)
                                >= calibration_frames
                            ):
                                pitch_baseline = (
                                    sum(pitch_samples)
                                    / len(pitch_samples)
                                )

                                up_count = 0
                                down_count = 0

                                head_vertical = "CENTER"

                        else:
                            delta = (
                                pitch_raw - pitch_baseline
                            )

                            # Looking up moves the nose up
                            # in the image, so delta is negative.
                            if delta < -pitch_threshold:
                                up_count += 1
                                down_count = 0

                            elif delta > pitch_threshold:
                                down_count += 1
                                up_count = 0

                            else:
                                up_count = 0
                                down_count = 0

                                head_vertical = "CENTER"

                                # Slowly adapt the baseline
                                # when the head is neutral.
                                pitch_baseline += (
                                    (
                                        pitch_raw
                                        - pitch_baseline
                                    ) * 0.01
                                )

                            if (
                                up_count
                                >= pitch_confirm_frames
                            ):
                                head_vertical = "UP"

                            elif (
                                down_count
                                >= pitch_confirm_frames
                            ):
                                head_vertical = "DOWN"

                            elif (
                                up_count
                                < pitch_confirm_frames
                                and down_count
                                < pitch_confirm_frames
                            ):
                                head_vertical = "CENTER"

                # --------------------------------------
                # PUBLISH HEAD STATE
                # --------------------------------------

                update_state(
                    face_detected=face_found,
                    head_yaw=round(yaw, 4),
                    head_pitch=round(pitch, 4),
                    head_direction=head_turn,
                    head_vertical=head_vertical,
                    frame_count=frame_number,
                    updated_at=time.time(),
                )

                current_time = time.time()

                # --------------------------------------
                # HEAD LEFT/RIGHT ACTIONS
                #
                # Preserve configurable head actions,
                # click cooldown, and voice typing.
                # --------------------------------------

                if (
                    cfg["head_actions"]
                    and head_turn != "CENTER"
                    and previous_head_turn == "CENTER"
                    and (
                        current_time - last_head_click_time
                        >= head_click_delay
                    )
                ):
                    if head_turn == "LEFT":
                        pyautogui.click(button="left")

                        try:
                            start_voice_typing()

                        except Exception:
                            print(
                                "Voice typing could not start:"
                            )
                            traceback.print_exc()

                    elif head_turn == "RIGHT":
                        pyautogui.click(button="right")

                    last_head_click_time = current_time

                previous_head_turn = head_turn

                # --------------------------------------
                # HEAD UP/DOWN CONTINUOUS SCROLLING
                #
                # Preserve the existing setting that
                # enables/disables all head actions.
                # --------------------------------------

                if (
                    cfg["head_actions"]
                    and head_vertical in ("UP", "DOWN")
                ):
                    if (
                        head_vertical
                        != previous_head_vertical
                    ):
                        # Scroll immediately upon entering
                        # a confirmed UP/DOWN state.
                        last_scroll_time = 0.0

                    if (
                        current_time - last_scroll_time
                        >= scroll_repeat_delay
                    ):
                        pyautogui.scroll(
                            scroll_step
                            if head_vertical == "UP"
                            else -scroll_step
                        )

                        last_scroll_time = current_time

                previous_head_vertical = head_vertical

                # --------------------------------------
                # HAND DETECTION AND GESTURE CLASSIFICATION
                # --------------------------------------

                if result.hand_landmarks:
                    landmarks = result.hand_landmarks[0]

                    prediction = classify_gesture(
                        landmarks
                    )

                    # Landmarks match the mirrored image
                    # sent to the frontend.
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

                    # ----------------------------------
                    # CURSOR MOVEMENT
                    # Preserve existing cursor toggle,
                    # sensitivity and smoothing settings.
                    # ----------------------------------

                    if (
                        cfg["cursor_control"]
                        and prediction in (
                            "Point",
                            "Peace",
                            "Open Palm",
                        )
                    ):
                        finger = landmarks[8]

                        # Higher sensitivity means a smaller
                        # hand movement covers more of the
                        # screen.
                        span = max(
                            0.25,
                            min(
                                1.0,
                                1.06
                                - cfg["sensitivity"] * 0.077,
                            ),
                        )

                        margin = (1.0 - span) / 2

                        x = max(
                            0.0,
                            min(
                                1.0,
                                (finger.x - margin) / span,
                            ),
                        )

                        y = max(
                            0.0,
                            min(
                                1.0,
                                (finger.y - margin) / span,
                            ),
                        )

                        target_x = int(
                            x * (screen_width - 1)
                        )

                        target_y = int(
                            y * (screen_height - 1)
                        )

                        # Higher smoothing percentage means
                        # slower, steadier cursor movement.
                        alpha = (
                            0.08
                            + 0.6
                            * (
                                1 - cfg["smoothing"] / 100
                            )
                        )

                        if smooth_x == 0 and smooth_y == 0:
                            smooth_x = target_x
                            smooth_y = target_y

                        else:
                            smooth_x += (
                                target_x - smooth_x
                            ) * alpha

                            smooth_y += (
                                target_y - smooth_y
                            ) * alpha

                        pyautogui.moveTo(
                            int(smooth_x),
                            int(smooth_y),
                        )

                    draw_hand(frame, landmarks)

                else:
                    update_state(
                        hand_detected=False,
                        landmarks=[],
                        gesture="No hand detected",
                        confidence=None,
                        updated_at=time.time(),
                    )

                # --------------------------------------
                # STREAM FRAME TO WEB FRONTEND
                # --------------------------------------

                # Keep cv2.imshow() out of the server thread.
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
        # ------------------------------------------
        # CLEANUP
        # Preserve the old shutdown behavior.
        # ------------------------------------------

        if cap is not None:
            cap.release()

        _clear_frame()

        existing_state = get_live_state()

        update_state(
            running=False,
            phase="stopped",
            hand_detected=False,
            face_detected=False,
            landmarks=[],
            gesture=(
                "Tracking failed"
                if existing_state.get("error")
                else "Tracking stopped"
            ),
            confidence=None,
            head_pitch=0.0,
            head_vertical="CENTER",
            brightness=None,
            updated_at=time.time(),
        )


if __name__ == "__main__":
    run()
