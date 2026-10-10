import asyncio
import secrets
import threading

import uvicorn
from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import mouse_control_copy

app = FastAPI()

API_KEY = "HM-local-2026-change-this-key"

EXTENSION_ID = "blmgefakpnglhlpginljcljddahjbeoi"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        f"chrome-extension://{EXTENSION_ID}",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["X-HandMouse-Key", "Content-Type"],
)

tracking_thread = None
lock = threading.Lock()


def check_key(provided: str):
    if not secrets.compare_digest(provided or "", API_KEY):
        raise HTTPException(status_code=401, detail="Invalid API key")


def is_tracking() -> bool:
    return tracking_thread is not None and tracking_thread.is_alive()


@app.get("/")
def home():
    return {"message": "HandMouse server is running"}


@app.get("/status")
def status(x_handmouse_key: str = Header(default="")):
    check_key(x_handmouse_key)
    data = mouse_control_copy.get_live_state()
    data["tracking"] = is_tracking()
    return data


@app.get("/live-data")
def live_data(x_handmouse_key: str = Header(default="")):
    check_key(x_handmouse_key)
    return mouse_control_copy.get_live_state()


@app.get("/video-feed")
async def video_feed(request: Request, key: str = Query(default="")):
    # <img> tags cannot send custom headers, so the key
    # is passed as a query parameter for this route only.
    check_key(key)

    async def frames():
        last_id = -1

        while not await request.is_disconnected():
            frame_id, jpeg = mouse_control_copy.get_latest_frame()

            if jpeg is None or frame_id == last_id:
                await asyncio.sleep(0.02)
                continue

            last_id = frame_id

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
            )

            await asyncio.sleep(0.01)

    return StreamingResponse(
        frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-store"},
    )


@app.post("/start")
def start(x_handmouse_key: str = Header(default="")):
    global tracking_thread

    check_key(x_handmouse_key)

    with lock:
        if is_tracking():
            return {
                "message": "HandMouse is already running",
                "tracking": True,
            }

        tracking_thread = threading.Thread(
            target=mouse_control_copy.run,
            daemon=True,
        )
        tracking_thread.start()

    return {"message": "HandMouse started", "tracking": True}


@app.post("/stop")
def stop(x_handmouse_key: str = Header(default="")):
    check_key(x_handmouse_key)
    mouse_control_copy.stop()
    return {"message": "Stop requested", "tracking": is_tracking()}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)