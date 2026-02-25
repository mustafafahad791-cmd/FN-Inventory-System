import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import BranchListPage from './pages/BranchListPage';
import ItemListPage from './pages/ItemListPage';
import EntryTemplateListPage from './pages/EntryTemplateListPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/branches" 
              element={
                <ProtectedRoute>
                  <BranchListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/items" 
              element={
                <ProtectedRoute>
                  <ItemListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/entry-templates" 
              element={
                <ProtectedRoute>
                  <EntryTemplateListPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
