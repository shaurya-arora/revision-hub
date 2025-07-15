// src/components/Chat.jsx
import React, { useEffect, useState } from "react";
import { Container, Form, Button, ListGroup } from "react-bootstrap";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("https://revision-hub.onrender.com");

const Chat = ({ code, username }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.emit("join", { code });

    socket.on("history", (messages) => setChat(messages));
    socket.on("message", (data) => setChat((prev) => [...prev, data]));

    return () => {
      socket.off("message");
      socket.off("history");
    };
  }, [code]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", { code, sender: username, text: message });
      setMessage("");
    }
  };

  const handleClear = async () => {
    if (window.confirm("Clear all messages?")) {
      await axios.delete(`https://revision-hub.onrender.com/clear/${code}`);
      setChat([]);
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
