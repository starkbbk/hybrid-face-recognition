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

@app.route('/users', methods=['GET'])
def route_get_users():
    return jsonify(get_users())

@app.route('/users_full', methods=['GET'])
def route_get_users_full():
    return jsonify(get_all_users())

@app.route('/register', methods=['POST'])
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
def route_update_user():
    # Same as register for now
    return route_register()

@app.route('/delete_user', methods=['POST'])
def route_delete_user():
    data = request.json
    name = data.get('name')
    if name:
        delete_user(name)
        return jsonify({'status': 'deleted'})
    return jsonify({'error': 'Name required'}), 400

@app.route('/rename_user', methods=['POST'])
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

@app.route('/thumbnail/<name>', methods=['GET'])
def route_thumbnail(name):
    data = get_thumbnail(name)
    if data:
        return Response(data, mimetype='image/jpeg')
    return "Not found", 404

@app.route('/stream', methods=['GET'])
def route_stream():
    return Response(generate_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/events', methods=['GET'])
def route_events():
    return jsonify(get_events())
