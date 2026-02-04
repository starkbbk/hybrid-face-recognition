import insightface
import os

# This script is used to pre-download the models during the build phase
# so that the application doesn't time out trying to download them on startup.

def download_models():
    print("Pre-downloading InsightFace models...")
    # Initialize the app to trigger download
    # We use the same model name as in recognition.py
    app = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=0, det_size=(640, 640))
    print("Download complete!")

if __name__ == "__main__":
    download_models()
