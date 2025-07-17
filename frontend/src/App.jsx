import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Chat from "./Chat";

const App = () => {
  const [username, setUsername] = useState("");

  return (
    <Routes>
      <Route path="/" element={<Home setUsername={setUsername} />} />
      <Route
        path="/chat/:code"
        element={username ? <Chat username={username} /> : <Navigate to="/" />}
      />
    </Routes>
  );
};

export default App;
