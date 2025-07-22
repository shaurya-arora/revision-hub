import React, { useEffect, useState, useRef } from "react";
import { Container, Form, Button, ListGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "https://revision-chat-backend.fly.dev";

const Chat = ({ username }) => {
  const { code } = useParams();
  const normalizedCode = code.trim().toLowerCase(); // ✅ consistent room name

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typingUser, setTypingUser] = useState(""); // ✅ New state
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to backend socket:", socket.id);
      socket.emit("join", { code: normalizedCode });
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

    socket.on("typing", (data) => {
      if (data.sender !== username) {
        setTypingUser(data.sender);
        setTimeout(() => setTypingUser(""), 2000); // Clear after 2s
      }
    });

    return () => {
      socket.disconnect();
      console.log("👋 Disconnected from socket");
    };
  }, [normalizedCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current?.connected) {
        console.log("🔁 Periodic room re-join");
        socketRef.current.emit("join", { code: normalizedCode });
      }
    }, 30000); // every 30s

    return () => clearInterval(interval);
  }, [normalizedCode]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const msg = {
      code: normalizedCode,
      sender: username,
      text: message,
    };
    socketRef.current.emit("message", msg);
    setMessage("");
    setTypingUser("");
  };

  const handleTyping = () => {
    socketRef.current.emit("typing", { code: normalizedCode, sender: username });
  };

  const handleClear = async () => {
    await axios.delete(`${SOCKET_URL}/clear/${normalizedCode}`);
    setChat([]);
  };

  return (
    <Container className="py-4">
      <h2>Chat Room: {normalizedCode}</h2>
      <Button variant="danger" className="mb-3" onClick={handleClear}>
        Clear Chat
      </Button>

      <ListGroup className="mb-3">
        {chat.map((msg, idx) => (
          <ListGroup.Item key={idx}>
            <strong>{msg.sender}</strong>{" "}
            <small className="text-muted">[{msg.timestamp || "???"}]</small>:{" "}
            {msg.text}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {typingUser && (
        <div className="text-muted mb-2">
          <em>{typingUser} is typing...</em>
        </div>
      )}
      
      <Form onSubmit={handleSend}>
        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping(); // ✅ Emit typing
          }}
        />
        <Button className="mt-2" type="submit">
          Send
        </Button>
      </Form>
    </Container>
  );
};

export default Chat;
