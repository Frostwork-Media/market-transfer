'use client';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../components/Home';
import NewPage from '../components/NewPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-page" element={<NewPage />} />
      </Routes>
    </Router>
  );
};

export default App;

