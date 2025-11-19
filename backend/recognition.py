import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
from .db import get_users
from .event_bus import push_event
from .camera_stream import update_frame_system
import time

class HybridRecognizer:
    def __init__(self):
        # Load InsightFace model
        # providers=['CPUExecutionProvider'] ensures we use CPU
        self.app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        self.users = {}
        self.reload_users()
        self.last_reload = time.time()

    def reload_users(self):
        self.users = get_users()
        print(f"Loaded {len(self.users)} users from DB")

    def detect_faces(self, frame):
        return self.app.get(frame)

    def process_faces(self, frame, faces):
        # Periodically reload users
        if time.time() - self.last_reload > 10:
            self.reload_users()
            self.last_reload = time.time()

        # Create a copy to draw on so we don't modify the original frame used for other things if any
        # But here we can just modify 'frame' or a copy. 
        # Since 'frame' comes from cap.read(), modifying it is fine if we don't need clean one later.
        # But let's use a copy for the stream to be safe.
        annotated_frame = frame.copy()

        if faces:
            for face in faces:
                embedding = face.embedding
                norm = np.linalg.norm(embedding)
                if norm != 0:
                    embedding = embedding / norm

                best_score = 0
                best_name = "Unknown"

                for name, data in self.users.items():
                    db_emb = np.array(data['deep'])
                    score = np.dot(embedding, db_emb)
                    if score > best_score:
                        best_score = score
                        best_name = name

                threshold = 0.45
                if best_score < threshold:
                    best_name = "Unknown"
                    report_score = 0.0
                else:
                    report_score = float(best_score)

                # Draw bounding box
                bbox = face.bbox.astype(int)
                cv2.rectangle(annotated_frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
                
                # Draw name background
                text = f"{best_name} ({report_score:.2f})"
                (text_w, text_h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
                cv2.rectangle(annotated_frame, (bbox[0], bbox[1] - 20), (bbox[0] + text_w, bbox[1]), (0, 255, 0), -1)
                cv2.putText(annotated_frame, text, (bbox[0], bbox[1] - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)

                # Push event
                # Simulate liveness based on detection score and some randomness
                # In a real system, this would use a liveness model (e.g. SilentFaceAntiSpoofing)
                import random
                base_liveness = float(face.det_score) if hasattr(face, 'det_score') else 0.9
                liveness = min(0.99, max(0.1, base_liveness - random.uniform(0.0, 0.1)))
                
                # Access Control Logic
                from datetime import datetime
                now = datetime.now()
                current_time = now.strftime("%H:%M")
                
                status = "UNKNOWN"
                if best_name != "Unknown":
                    user_data = self.users.get(best_name, {})
                    allowed_start = user_data.get('allowed_start', '00:00')
                    allowed_end = user_data.get('allowed_end', '23:59')
                    
                    if allowed_start <= current_time <= allowed_end:
                        status = "VERIFIED"
                    else:
                        status = "DENIED"
                
                event = {
                    'name': best_name,
                    'fusion_score': report_score,
                    'liveness_score': liveness,
                    'timestamp': time.time(),
                    'status': status,
                    'zone': 'Main Gate'
                }
                push_event(event)
        
        # Update the system frame with the annotated one
        update_frame_system(annotated_frame)

    def recognize(self, frame):
        faces = self.detect_faces(frame)
        self.process_faces(frame, faces)

# Global instance to be used by main
recognizer = HybridRecognizer()
