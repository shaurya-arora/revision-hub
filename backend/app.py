from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory chat store: { room_code: [ { sender, text } ] }
chat_history = {}

@app.route('/')
def index():
    return "✅ Chat backend is running!"

@app.route('/clear/<room_code>', methods=['DELETE'])
def clear_chat(room_code):
    chat_history[room_code] = []
    return jsonify({"success": True, "message": "Chat cleared."}), 200

@socketio.on('join')
def handle_join(data):
    room = data['code']
    join_room(room)

    if room not in chat_history:
        chat_history[room] = []

    print(f"User joined room: {room}")
    emit('history', chat_history[room], room=request.sid)

@socketio.on('message')
def handle_message(data):
    room = data['code']
    sender = data['sender']
    text = data['text']

    message_data = {'sender': sender, 'text': text}
    chat_history.setdefault(room, []).append(message_data)

    print(f"Message in {room}: {sender}: {text}")
    emit('message', message_data, room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True, use_reloader=False, allow_unsafe_werkzeug=True)

