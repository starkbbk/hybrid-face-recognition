import cv2
import threading
import time
from PIL import Image
import io

# Global latest frame with lock
latest_frame = None
frame_lock = threading.Lock()

def update_frame_system(frame):
    global latest_frame
    with frame_lock:
        latest_frame = frame.copy()

def generate_stream():
    while True:
        with frame_lock:
            if latest_frame is None:
                # Send black placeholder
                img = Image.new('RGB', (640, 480), color='black')
            else:
                # Convert BGR to RGB
                img = Image.fromarray(cv2.cvtColor(latest_frame, cv2.COLOR_BGR2RGB))
        
        # Encode as JPEG
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        frame_bytes = buf.getvalue()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.03) # Approx 30 FPS

# Camera control
camera_paused = False

def pause_camera():
    global camera_paused
    camera_paused = True

def resume_camera():
    global camera_paused
    camera_paused = False

