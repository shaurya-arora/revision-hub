import React, { useEffect, useState, useRef } from "react";
import { Container, Form, Button, ListGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "https://revision-chat-backend.fly.dev";

const Chat = ({ username }) => {
  const { code } = useParams();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to backend socket:", socket.id);
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
    socket.on("typing", ({ sender }) => {
      setTypingUser(sender);
    });

    socket.on("stop_typing", () => {
      setTypingUser(null);
    });

    return () => {
      socket.disconnect();
      console.log("👋 Disconnected from socket");
    };
  }, [code]);

  // 🔄 Periodic re-join to stay in sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current?.connected) {
        console.log("🔁 Periodic room re-join");
        socketRef.current.emit("join", { code });
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [code]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const msg = { code, sender: username, text: message };
    socketRef.current.emit("message", msg);
    setMessage("");
  };

  const handleClear = async () => {
    await axios.delete(`${SOCKET_URL}/clear/${code}`);
    setChat([]);
  };

  return (
    <Container className="py-4">
      <h2>Chat Room: {code}</h2>
      <Button variant="danger" className="mb-3" onClick={handleClear}>
        Clear Chat
      </Button>
      {typingUser && (
        <div className="text-muted mb-2">
          <em>{typingUser} is typing...</em>
        </div>
      )}

      <ListGroup className="mb-3">
        {chat.map((msg, idx) => (
          <ListGroup.Item key={idx}>
            <strong>{msg.sender}</strong>{" "}
            <small className="text-muted">[{msg.timestamp}]</small>: {msg.text}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Form onSubmit={handleSend}>
        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            const val = e.target.value;
            setMessage(val);

            if (!isTyping) {
              setIsTyping(true);
              socketRef.current.emit("typing", { code, sender: username });
            }

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              socketRef.current.emit("stop_typing", { code });
            }, 1000); // stops after 1 second idle
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
