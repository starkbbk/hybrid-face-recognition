import eventlet
eventlet.monkey_patch()
from backend.main import run_system

if __name__ == "__main__":
    run_system()
