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
import InventoryListPage from './pages/InventoryListPage';
import TransferListPage from './pages/TransferListPage';
import ReceiptListPage from './pages/ReceiptListPage';
import CustomerLogPage from './pages/CustomerLogPage';

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
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <InventoryListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transfers" 
              element={
                <ProtectedRoute>
                  <TransferListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/receipts" 
              element={
                <ProtectedRoute>
                  <ReceiptListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-log" 
              element={
                <ProtectedRoute>
                  <CustomerLogPage />
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
