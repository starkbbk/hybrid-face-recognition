import cv2
import threading
import time
import numpy as np
import base64
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

@socketio.on('video_frame')
def handle_video_frame(data):
    global registration_target, registration_state, registration_start_time
    
    # data is expected to be a dict with key 'image' containing base64 encoded jpeg
    image_data = data.get('image')
    if not image_data:
        return

    # Decode base64 image
    try:
        # Remove header if present (e.g., "data:image/jpeg;base64,")
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return
            
    except Exception as e:
        print(f"Error decoding frame: {e}")
        return

    # Process frame
    faces = recognizer.detect_faces(frame)
    if not faces:
        faces = []

    # Check if we are in registration mode
    if registration_target:
        if registration_state == 'countdown':
            elapsed = time.time() - registration_start_time
            remaining = 3 - elapsed
            if remaining > 0:
                socketio.emit('registration_feedback', {'message': f"Wait {int(remaining)+1} sec..."})
            else:
                registration_state = 'capturing'
                socketio.emit('registration_feedback', {'message': "Capturing..."})
        
        elif registration_state == 'capturing':
            # For registration, always detect faces
            if not faces: # If detect_faces was skipped or failed above, try again explicitly if needed (though we detected already)
                 pass # We already detected earlier
            
            success, message, embedding, thumbnail = attempt_capture(frame, faces)
            
            if success:
                print("Checking for duplicates...")
                recognizer.reload_users()
                
                is_duplicate = False
                duplicate_name = ""
                new_emb = np.array(embedding)
                
                for u_name, u_data in recognizer.users.items():
                    db_emb = np.array(u_data['deep'])
                    score = np.dot(new_emb, db_emb)
                    # print(f"Comparing with {u_name}: score={score:.4f}")
                    
                    if score > 0.55:
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
                    save_user_embedding(registration_target, embedding, [], thumbnail)
                    
                    socketio.emit('registration_feedback', {'message': "Stored in DB"})
                    
                    socketio.emit('registration_status', {'status': 'success', 'name': registration_target})
                    
                    recognizer.reload_users()
                    registration_target = None
                    registration_state = 'idle'
            else:
                if time.time() - registration_start_time > 15:
                    socketio.emit('registration_status', {'status': 'failed', 'error': 'Timeout: ' + message})
                    registration_target = None
                    registration_state = 'idle'
                else:
                    socketio.emit('registration_feedback', {'message': f"Capturing... {message}"})
        
        # Also process for recognition during registration (optional, but good for feedback)
        # recognizer.process_faces(frame, faces) 
        # Actually, maybe we only want to show recognition boxes if NOT strictly capturing?
        # Let's show them always.
        results = recognizer.process_and_return(frame, faces)
    else:
        results = recognizer.process_and_return(frame, faces)
    
    # Emit results back to client
    socketio.emit('recognition_results', results)


import os

def run_system():
    # Start API
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting API server on 0.0.0.0:{port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=False)

