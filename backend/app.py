from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, emit
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Directory to store room chat logs
CHAT_DIR = "chat_logs"
os.makedirs(CHAT_DIR, exist_ok=True)

# In-memory cache: { room_code: [messages] }
chat_history = {}

# Helper functions
def get_chat_file(code):
    return os.path.join(CHAT_DIR, f"{code}.json")

def load_chat_history(code):
    path = get_chat_file(code)
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return []

def save_chat_history(code, messages):
    with open(get_chat_file(code), 'w') as f:
        json.dump(messages, f)

# Routes
@app.route('/')
def index():
    return "✅ Chat backend is running!"

@app.route('/clear/<room_code>', methods=['DELETE'])
def clear_chat(room_code):
    chat_history[room_code] = []
    save_chat_history(room_code, [])
    return jsonify({"success": True, "message": "Chat cleared."}), 200

# Socket events
@socketio.on('join')
def handle_join(data):
    room = data['code']
    join_room(room)
    chat_history[room] = load_chat_history(room)
    print(f"📡 User joined room: {room}")
    emit('history', chat_history[room], room=request.sid)

@socketio.on('message')
def handle_message(data):
    room = data['code']
    sender = data['sender']
    text = data['text']

    message_data = {'sender': sender, 'text': text}
    chat_history.setdefault(room, []).append(message_data)
    save_chat_history(room, chat_history[room])

    print(f"💬 Message in {room}: {sender}: {text}")
    emit('message', message_data, room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True, use_reloader=False, allow_unsafe_werkzeug=True)
