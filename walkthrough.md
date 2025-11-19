# Hybrid Face AI Walkthrough

## Overview
This project is a fully local face recognition system with a Python Flask backend and a React (Vite) frontend. It uses `insightface` for face recognition and `sqlite3` for data storage.

## Prerequisites
- Python 3.10+
- Node.js & npm
- Webcam

## Installation

1. **Backend Setup**
   It is recommended to use a virtual environment to avoid conflicts:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Frontend Setup**
   ```bash
   cd dashboard
   npm install
   ```

## Running the Application

1. **Start the Backend**
   Open a terminal in the project root:
   ```bash
   python3 run.py
   ```
   This will:
   - Initialize the SQLite database.
   - Load the InsightFace model (downloads on first run).
   - Start the camera stream.
   - Start the Flask-SocketIO server on port 5001.

2. **Start the Frontend**
   Open another terminal, **navigate to the dashboard folder**, and start the server:
   ```bash
   cd dashboard
   npm run dev
   ```
   Open the URL shown (usually `http://localhost:5173`).

## Usage Guide

### Dashboard
- **Register User**: Enter a name and click "Start Registration". Look at the camera. The system will capture your face and save it.
- **Live Events**: Shows real-time recognition events with Fusion Score and Liveness Score.

### Users
- View all registered users.
- **Update**: Re-capture a user's face.
- **Delete**: Remove a user from the database.

### Live Camera
- View the raw MJPEG stream from the backend.

### Logs
- View historical recognition events.

## Troubleshooting
- **Camera not opening**: Ensure no other application is using the webcam.
- **Model download fails**: Ensure you have an internet connection for the first run to download `buffalo_l`.
- **CORS errors**: Ensure the backend is running on port 5000 and frontend on 5173 (or update `api.js`).
