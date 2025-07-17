import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";

const Home = ({ setUsername }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && code.trim()) {
      setUsername(name);
      navigate(`/chat/${code}`);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">📘 Revision Resource Lookup</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="nameInput" className="mb-3">
          <Form.Label>Your Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="codeInput" className="mb-3">
          <Form.Label>Search Topic</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. differentiation, cell biology..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          🔍 Search
        </Button>
      </Form>
    </Container>
  );
};

export default Home;
