import cv2
import threading
import time
import numpy as np
from .recognition import recognizer
from .api import app, socketio
from .register import attempt_capture
from .db import save_user_embedding

# Registration state
registration_target = None
registration_start_time = 0
registration_state = 'idle' # idle, countdown, capturing

def start_registration(name):
    global registration_target, registration_start_time, registration_state
    registration_target = name
    registration_start_time = time.time()
    registration_state = 'countdown'

def camera_loop():
    global registration_target, registration_state
    print("Starting camera loop...")
    cap = cv2.VideoCapture(0)
    
    while True:
        if not cap.isOpened():
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                print("Failed to reopen camera")
                time.sleep(1)
                continue
            print("Camera resumed")

        ret, frame = cap.read()
        if ret:
            # Single inference
            faces = recognizer.detect_faces(frame)
            
            # Check if we are in registration mode
            if registration_target:
                if registration_state == 'countdown':
                    elapsed = time.time() - registration_start_time
                    remaining = 3 - elapsed
                    if remaining > 0:
                        # Throttle updates slightly or just send (socketio handles it reasonably well)
                        socketio.emit('registration_feedback', {'message': f"Wait {int(remaining)+1} sec..."})
                    else:
                        registration_state = 'capturing'
                        socketio.emit('registration_feedback', {'message': "Capturing..."})
                
                elif registration_state == 'capturing':
                    # Try to capture
                    success, message, embedding, thumbnail = attempt_capture(frame, faces)
                    
                    if success:
                        # Check for duplicates
                        print("Checking for duplicates...")
                        recognizer.reload_users() # Ensure we have latest users
                        
                        is_duplicate = False
                        duplicate_name = ""
                        new_emb = np.array(embedding)
                        
                        # Use the recognizer's cached users
                        for u_name, u_data in recognizer.users.items():
                            db_emb = np.array(u_data['deep'])
                            score = np.dot(new_emb, db_emb)
                            print(f"Comparing with {u_name}: score={score:.4f}")
                            
                            if score > 0.55: # Threshold for duplicate detection
                                is_duplicate = True
                                duplicate_name = u_name
                                print(f"Duplicate found: {u_name}")
                                break
                        
                        if is_duplicate:
                            socketio.emit('registration_status', {'status': 'failed', 'error': f'Already registered as {duplicate_name}'})
                            registration_target = None
                            registration_state = 'idle'
                        else:
                            socketio.emit('registration_feedback', {'message': "Captured! Storing in DB..."})
                            # Save to DB
                            save_user_embedding(registration_target, embedding, [], thumbnail)
                            
                            socketio.emit('registration_feedback', {'message': "Stored in DB"})
                            time.sleep(0.5) # Short delay to let user see "Stored"
                            
                            socketio.emit('registration_status', {'status': 'success', 'name': registration_target})
                            
                            # Force reload users immediately
                            recognizer.reload_users()
                            registration_target = None
                            registration_state = 'idle'
                    else:
                        # Timeout logic (15s total including countdown)
                        if time.time() - registration_start_time > 15:
                            socketio.emit('registration_status', {'status': 'failed', 'error': 'Timeout: ' + message})
                            registration_target = None
                            registration_state = 'idle'
                        else:
                            socketio.emit('registration_feedback', {'message': f"Capturing... {message}"})
                
                # Still process faces for events/visuals
                recognizer.process_faces(frame, faces)
            else:
                recognizer.process_faces(frame, faces)
        
        # Yield to other threads (important for Flask/SocketIO)
        time.sleep(0.01)

def run_system():
    # Start camera thread
    cam_thread = threading.Thread(target=camera_loop, daemon=True)
    cam_thread.start()
    
    # Start API
    print("Starting API server on 0.0.0.0:5001")
    socketio.run(app, host='0.0.0.0', port=5001, debug=False)
