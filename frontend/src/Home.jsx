import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";

const Home = ({ setUsername }) => {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !search.trim()) return;
    setUsername(name.trim());
    navigate(`/chat/${search.trim()}`);
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-4">
        <h1>📚 Revision Hub</h1>
        <p className="text-muted">Search topics, past papers, mark schemes & more.</p>
      </div>

      <Form onSubmit={handleSubmit} className="mb-5">
        <Row className="justify-content-center">
          <Col md={3} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Col>
          <Col md={5} className="mb-2">
            <Form.Control
              type="text"
              placeholder="e.g. a-level-chem-2019"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md="auto">
            <Button type="submit">Search</Button>
          </Col>
        </Row>
      </Form>

      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>📄 Past Papers</Card.Title>
              <Card.Text>Explore a wide range of past papers for all subjects and boards.</Card.Text>
              <Button variant="outline-primary" disabled>Coming Soon</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>📝 Mark Schemes</Card.Title>
              <Card.Text>Quick access to marking guides to evaluate your answers effectively.</Card.Text>
              <Button variant="outline-primary" disabled>Coming Soon</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>📚 Flashcards</Card.Title>
              <Card.Text>Study with Quizlets and curated flashcard decks by topic.</Card.Text>
              <Button variant="outline-primary" disabled>Coming Soon</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
