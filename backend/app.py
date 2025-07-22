import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, emit
import os
import json
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

CHAT_DIR = "chat_logs"
os.makedirs(CHAT_DIR, exist_ok=True)
chat_history = {}

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

@app.route('/')
def index():
    return "✅ Chat backend is running!"

@app.route('/clear/<room_code>', methods=['DELETE'])
def clear_chat(room_code):
    room_code = room_code.strip().lower()  # ✅ normalize
    chat_history[room_code] = []
    save_chat_history(room_code, [])
    return jsonify({"success": True, "message": "Chat cleared."}), 200

@socketio.on('join')
def handle_join(data):
    room = data['code'].strip().lower()  # ✅ normalize
    join_room(room)
    if room not in chat_history:
        chat_history[room] = load_chat_history(room)
    print(f"📡 User joined room: {room} (SID: {request.sid})")
    emit('history', chat_history[room], to=request.sid)

@socketio.on('message')
def handle_message(data):
    room = data['code'].strip().lower()  # ✅ normalize
    sender = data['sender']
    text = data['text']
    timestamp = datetime.now().strftime("%b %d, %H:%M")  # ✅ readable format

    message_data = {
        'sender': sender,
        'text': text,
        'timestamp': timestamp
    }

    chat_history.setdefault(room, []).append(message_data)
    save_chat_history(room, chat_history[room])
    print(f"💬 [{timestamp}] Message in {room}: {sender}: {text}")
    emit('message', message_data, room=room)

@socketio.on('typing')
def handle_typing(data):
    room = data['code'].strip().lower()
    sender = data['sender']
    emit('typing', {'sender': sender}, room=room, include_self=False)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000)
