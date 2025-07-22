// TypingIndicator.jsx
import React from "react";
import { Spinner } from "react-bootstrap";

const TypingIndicator = ({ sender }) => {
  if (!sender) return null;

  return (
    <div className="text-muted mb-2">
      <Spinner animation="grow" size="sm" className="me-1" />
      <em>{sender} is typing...</em>
    </div>
  );
};

export default TypingIndicator;
