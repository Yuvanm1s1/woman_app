import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper

app = Flask(__name__)
CORS(app)  # Allow React to communicate with this server

# 1. Load the Whisper model on startup
# Options: "tiny", "base", "small", "medium", "large"
print("⏳ Loading Whisper Model (this may take a moment)...")
model = whisper.load_model("base")
print("✅ Model Loaded!")

# Ensure temp folder exists
UPLOAD_FOLDER = './temp_audio'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 2. Save the file temporarily
    file_path = os.path.join(UPLOAD_FOLDER, "input.wav")
    audio_file.save(file_path)

    try:
        # 3. Run Whisper on the file
        print("🎤 Processing audio...")
        result = model.transcribe(file_path)
        text = result['text']
        print(f"📝 Result: {text}")

        # Clean up (optional)
        # os.remove(file_path)

        return jsonify({'text': text})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     app.run(port=5001, debug=True)

if __name__ == '__main__':
    # Turn off debug mode to stop auto-reloading
    app.run(port=5001, debug=False)