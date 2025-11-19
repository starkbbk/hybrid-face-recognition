# Hybrid Face AI

A real-time hybrid face recognition system combining a Python backend with a modern React dashboard. This project uses InsightFace for high-accuracy face detection and recognition, coupled with a liveness detection mechanism.

## Features

- **Real-time Face Recognition**: High-performance face detection and recognition using InsightFace (Buffalo_L model).
- **Liveness Detection**: Prevents spoofing attacks by analyzing face liveness.
- **Interactive Dashboard**: A modern, responsive React-based UI for monitoring the live feed and managing users.
- **User Registration**: Easy-to-use interface for registering new users with their face data.
- **Live Events**: Real-time logging of recognition events with fusion scores and liveness confidence.
- **Hybrid Architecture**: Combines the raw power of Python for AI processing with the interactivity of a web-based frontend.

## Tech Stack

- **Backend**: Python, Flask, Flask-SocketIO, InsightFace, ONNX Runtime
- **Frontend**: React, Vite, Socket.IO Client, CSS Modules
- **Communication**: WebSocket (Socket.IO) for real-time data transfer

## Prerequisites

- Python 3.8+
- Node.js 16+
- Webcam

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/starkbbk/hybrid-face-recognition.git
    cd hybrid-face-recognition
    ```

2.  **Backend Setup:**
    It is recommended to use a virtual environment.
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Frontend Setup:**
    ```bash
    cd dashboard
    npm install
    cd ..
    ```

## Usage

1.  **Start the System:**
    The project includes a helper script to run both the backend and frontend simultaneously.
    ```bash
    # Make sure your virtual environment is activated
    python3 run.py
    ```

2.  **Access the Dashboard:**
    Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal).

3.  **Register a User:**
    - Go to the Dashboard.
    - Enter a name in the "Register User" box.
    - Click "Start Registration".
    - Look at the camera for a few seconds until the system captures your face.

4.  **Live Recognition:**
    - Once registered, the system will recognize you in the "Live Feed" and "Live Events" section.

## Project Structure

```
hybrid-face-recognition/
├── backend/             # Python backend code
│   ├── main.py          # Flask server and Socket.IO events
│   ├── recognition.py   # Face recognition logic
│   └── ...
├── dashboard/           # React frontend code
│   ├── src/             # Source files
│   └── ...
├── run.py               # Script to launch both backend and frontend
├── requirements.txt     # Python dependencies
└── README.md            # Project documentation
```

## License

[MIT](LICENSE)
