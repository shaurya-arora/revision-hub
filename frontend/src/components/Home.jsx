// src/components/Home.jsx
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";

const Home = ({ onCodeSubmit }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = input.trim();
    if (/^\d{6}$/.test(code)) {
      onCodeSubmit(code);
    } else {
      alert("Enter a valid 6-digit room code.");
    }
  };

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">GCSE Revision Hub</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Search for a subject or enter room code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Form.Group>
        <Button className="mt-3" type="submit">
          Enter
        </Button>
      </Form>
    </Container>
  );
};

export default Home;
