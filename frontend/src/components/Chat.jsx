import React, { useEffect, useRef, useState } from "react";
import { Container, Form, Button, ListGroup } from "react-bootstrap";
import { io } from "socket.io-client";
import axios from "axios";

// Only one socket instance
const socket = io("https://revision-hub.onrender.com", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  autoConnect: false, // we’ll manually connect
});

const Chat = ({ code, username }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const joinedRoom = useRef(false);
  const listenersBound = useRef(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Join room only once
    if (!joinedRoom.current) {
      console.log("📡 Joining room:", code);
      socket.emit("join", { code });
      joinedRoom.current = true;
    }

    // Bind listeners only once
    if (!listenersBound.current) {
      socket.on("connect", () => {
        console.log("✅ Connected to backend socket:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("❌ Socket connection failed:", err.message);
      });

      socket.on("history", (messages) => {
        console.log("📜 Received chat history:", messages);
        setChat(messages);
      });

      socket.on("message", (data) => {
        console.log("📥 New message received:", data);
        setChat((prev) => [...prev, data]);
      });

      listenersBound.current = true;
    }

    return () => {
      // Optional: don't disconnect entirely unless navigating away from app
    };
  }, [code]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const payload = { code, sender: username, text: message };
      console.log("📤 Sending message:", payload);
      socket.emit("message", payload);
      setMessage("");
    }
  };

  const handleClear = async () => {
    if (window.confirm("Clear all messages?")) {
      await axios.delete(`https://revision-hub.onrender.com/clear/${code}`);
      setChat([]);
      console.log("🧹 Chat cleared.");
    }
  };

  return (
    <Container className="py-4">
      <h2>Chat Room: {code}</h2>
      <Button variant="danger" className="mb-3" onClick={handleClear}>
        Clear Chat
      </Button>
      <ListGroup className="mb-3">
        {chat.length === 0 && <ListGroup.Item>No messages yet.</ListGroup.Item>}
        {chat.map((msg, idx) => (
          <ListGroup.Item key={idx}>
            <strong>{msg.sender}:</strong> {msg.text}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Form onSubmit={handleSend}>
        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button className="mt-2" type="submit">
          Send
        </Button>
      </Form>
    </Container>
  );
};

export default Chat;
