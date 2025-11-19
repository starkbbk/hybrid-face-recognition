import time

# In-memory event storage
_events = []
MAX_EVENTS = 500
_socketio = None

def attach_socketio(socketio_instance):
    global _socketio
    _socketio = socketio_instance

def push_event(event: dict):
    global _events
    # Add timestamp if not present
    if 'timestamp' not in event:
        event['timestamp'] = time.time()
        
    _events.insert(0, event)
    if len(_events) > MAX_EVENTS:
        _events = _events[:MAX_EVENTS]
        
    if _socketio:
        _socketio.emit('face_event', event)

def get_events() -> list:
    return _events
