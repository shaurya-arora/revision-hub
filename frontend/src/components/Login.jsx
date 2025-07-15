// src/components/Login.jsx
import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";

const Login = ({ onLogin }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <Container className="py-4">
      <h2>Enter Your Name</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Button className="mt-2" type="submit">
          Continue
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
