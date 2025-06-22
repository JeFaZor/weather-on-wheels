import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlacesPage from './components/PlacesPage';
import CreatePage from './components/CreatePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PlacesPage />} />
          <Route path="/create" element={<CreatePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;