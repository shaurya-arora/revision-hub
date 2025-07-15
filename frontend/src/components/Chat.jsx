// src/components/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import { Container, Form, Button, ListGroup } from "react-bootstrap";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "https://revision-hub.onrender.com";

const Chat = ({ code, username }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const socketRef = useRef(null);

  // Connect socket on mount
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to backend socket:", socket.id);
      console.log("📡 Joining room:", code);
      socket.emit("join", { code });
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

    return () => {
      socket.disconnect();
      console.log("👋 Disconnected from socket");
    };
  }, [code]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const msg = { code, sender: username, text: message };
      console.log("📤 Sending message:", msg);
      socketRef.current.emit("message", msg);
      setMessage("");
    }
  };

  const handleClear = async () => {
    if (window.confirm("Clear all messages?")) {
      await axios.delete(`${SOCKET_URL}/clear/${code}`);
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
