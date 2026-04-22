import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, AdminRoute, SubscriberRoute } from './components/shared/ProtectedRoute';
import Navbar from './components/shared/Navbar';

import Home from './pages/Home';
import { LoginPage, RegisterPage } from './pages/Auth';
import Subscribe from './pages/Subscribe';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admin';
import Charities from './pages/Charities';
import { CharityDetail } from './pages/CharityDetail';
import Draws from './pages/Draws';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/charities" element={<Charities />} />
            <Route path="/charities/:id" element={<CharityDetail />} />
            <Route path="/draws" element={<Draws />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3500}
            theme="dark"
            toastStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
