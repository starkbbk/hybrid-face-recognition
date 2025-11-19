from flask import Flask, request, jsonify, Response
from flask_socketio import SocketIO
from flask_cors import CORS
from .db import get_users, get_all_users, save_user_embedding, delete_user, get_thumbnail
from .event_bus import attach_socketio, get_events
from .camera_stream import generate_stream, pause_camera, resume_camera

import threading
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Attach socket to event bus
attach_socketio(socketio)

import uuid
from functools import wraps

# Simple in-memory token storage
VALID_TOKENS = set()
ADMIN_USER = "admin"
ADMIN_PASS = "password123"

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token.replace('Bearer ', '') not in VALID_TOKENS:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/auth/login', methods=['POST'])
def route_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username == ADMIN_USER and password == ADMIN_PASS:
        token = str(uuid.uuid4())
        VALID_TOKENS.add(token)
        return jsonify({'token': token})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/auth/logout', methods=['POST'])
def route_logout():
    token = request.headers.get('Authorization')
    if token:
        clean_token = token.replace('Bearer ', '')
        if clean_token in VALID_TOKENS:
            VALID_TOKENS.remove(clean_token)
    return jsonify({'status': 'logged_out'})

@app.route('/users', methods=['GET'])
@require_auth
def route_get_users():
    return jsonify(get_users())

@app.route('/users_full', methods=['GET'])
@require_auth
def route_get_users_full():
    return jsonify(get_all_users())

@app.route('/register', methods=['POST'])
@require_auth
def route_register():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Name required'}), 400
    
    # Import locally to avoid circular import issues at top level if any
    from .main import start_registration
    start_registration(name)
    
    return jsonify({'status': 'Registration started', 'name': name})

@app.route('/update_user', methods=['POST'])
@require_auth
def route_update_user():
    # Same as register for now
    return route_register()

@app.route('/delete_user', methods=['POST'])
@require_auth
def route_delete_user():
    data = request.json
    name = data.get('name')
    if name:
        delete_user(name)
        return jsonify({'status': 'deleted'})
    return jsonify({'error': 'Name required'}), 400

@app.route('/rename_user', methods=['POST'])
@require_auth
def route_rename_user():
    data = request.json
    old_name = data.get('old_name')
    new_name = data.get('new_name')
    
    if not old_name or not new_name:
        return jsonify({'error': 'Both old_name and new_name are required'}), 400
        
    from .db import rename_user
    if rename_user(old_name, new_name):
        return jsonify({'status': 'renamed'})
    else:
        return jsonify({'error': 'Name already exists or invalid'}), 400

@app.route('/update_access', methods=['POST'])
@require_auth
def route_update_access():
    data = request.json
    name = data.get('name')
    start = data.get('start')
    end = data.get('end')
    
    if not name or not start or not end:
        return jsonify({'error': 'Name, start, and end times required'}), 400
        
    from .db import update_access_rules
    if update_access_rules(name, start, end):
        return jsonify({'status': 'updated'})
    else:
        return jsonify({'error': 'Failed to update'}), 400

@app.route('/thumbnail/<name>', methods=['GET'])
# Thumbnails might be public or protected? Let's protect them to be safe, but frontend needs token.
# Actually, for <img> tags, adding headers is hard. Let's leave thumbnails public for now for simplicity.
def route_thumbnail(name):
    data = get_thumbnail(name)
    if data:
        return Response(data, mimetype='image/jpeg')
    return "Not found", 404

@app.route('/stream', methods=['GET'])
# Stream is also hard to protect with headers in standard <img> tag.
# We can leave it public or use a query param token.
# For "Admin panel feel", protecting the dashboard data is most important.
def route_stream():
    return Response(generate_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/events', methods=['GET'])
@require_auth
def route_events():
    return jsonify(get_events())
