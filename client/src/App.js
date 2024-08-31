import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import BlogPage from './components/BlogPage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if token exists

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminPage /> : <LoginPage />}
        />
        <Route path="/posts/:slug" element={<BlogPage />} />
      </Routes>
    </Router>
  );
};

export default App;
