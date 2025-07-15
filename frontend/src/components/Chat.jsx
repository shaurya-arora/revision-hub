// src/components/Chat.jsx
import React, { useEffect, useState } from "react";
import { Container, Form, Button, ListGroup } from "react-bootstrap";
import { io } from "socket.io-client";
import axios from "axios";

// Connect once globally
const socket = io("https://revision-hub.onrender.com", {
  transports: ["websocket"], // Force WebSocket for better performance
  reconnectionAttempts: 5,
});

const Chat = ({ code, username }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    console.log("📡 Joining room:", code);
    socket.emit("join", { code });

    const handleConnect = () => {
      console.log("✅ Connected to backend socket:", socket.id);
    };

    const handleConnectError = (err) => {
      console.error("❌ Socket connection failed:", err.message);
    };

    const handleHistory = (messages) => {
      console.log("📜 Received chat history:", messages);
      setChat(messages);
    };

    const handleMessage = (data) => {
      console.log("📥 New message received:", data);
      setChat((prev) => [...prev, data]);
    };

    // Register listeners
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("history", handleHistory);
    socket.on("message", handleMessage);

    // Cleanup on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("history", handleHistory);
      socket.off("message", handleMessage);
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
