import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dealers from './components/Dealers/Dealers';
import Dealer from './components/Dealers/Dealer';
import PostReview from './components/Dealers/PostReview';
import SearchCars from './components/Dealers/SearchCars';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/dealers" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dealers" element={<Dealers />} />
        <Route path="/dealer/:id" element={<Dealer />} />
        <Route path="/postreview/:id" element={<PostReview />} />
        <Route path="/searchcars/:id" element={<SearchCars />} />
      </Routes>
    </div>
  );
}

export default App;
