import cv2
import numpy as np
import time
from insightface.app import FaceAnalysis
from .db import save_user_embedding
import io
from PIL import Image
from .recognition import recognizer

def attempt_capture(frame, faces):
    if len(faces) == 0:
        return False, "No face detected", None, None
    
    if len(faces) > 1:
        return False, "Multiple faces detected", None, None
    
    if len(faces) == 1:
        face = faces[0]
        embedding = face.embedding
        norm = np.linalg.norm(embedding)
        if norm != 0:
            embedding = embedding / norm
        
        # Create thumbnail
        bbox = face.bbox.astype(int)
        x1, y1, x2, y2 = bbox
        # Add some padding
        h, w, _ = frame.shape
        pad_w = int((x2 - x1) * 0.2)
        pad_h = int((y2 - y1) * 0.2)
        x1 = max(0, x1 - pad_w)
        y1 = max(0, y1 - pad_h)
        x2 = min(w, x2 + pad_w)
        y2 = min(h, y2 + pad_h)
        
        face_img = frame[y1:y2, x1:x2]
        if face_img.size == 0:
            face_img = frame # Fallback

        # Convert to RGB for Pillow
        face_img_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(face_img_rgb)
        # Resize to save space
        pil_img.thumbnail((200, 200))
        
        buf = io.BytesIO()
        pil_img.save(buf, format='JPEG', quality=85)
        thumbnail_bytes = buf.getvalue()

        return True, "Success", embedding.tolist(), thumbnail_bytes
    
    return False, "Unknown error", None, None

