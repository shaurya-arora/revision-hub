import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./Home";
import Chat from "./Chat";

const App = () => {
  const [username, setUsername] = useState("");

  return (
    <Router basename="/revision-hub">
      <Routes>
        <Route
          path="/"
          element={<Home setUsername={setUsername} />}
        />
        <Route
          path="/chat/:code"
          element={username ? <Chat username={username} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
