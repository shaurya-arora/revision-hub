// src/App.jsx
import React, { useState } from "react";
import Home from "./components/Home";
import Login from "./components/Login";
import Chat from "./components/Chat";

function App() {
  const [stage, setStage] = useState("home");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");

  const handleCodeSubmit = (enteredCode) => {
    setCode(enteredCode);
    setStage("login");
  };

  const handleLogin = (name) => {
    setUsername(name);
    setStage("chat");
  };

  return (
    <div className="App">
      {stage === "home" && <Home onCodeSubmit={handleCodeSubmit} />}
      {stage === "login" && <Login onLogin={handleLogin} />}
      {stage === "chat" && <Chat code={code} username={username} />}
    </div>
  );
}

export default App;
