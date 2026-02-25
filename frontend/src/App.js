import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Welcome to FN Furniture Inventory System</div>} />
        {/* Routes to be added */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
