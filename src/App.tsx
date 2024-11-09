import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Users from './pages/Users';
import Authors from './pages/Authors';
import Loans from './pages/Loans';
import Backups from './pages/Backups'; // Importe o novo componente de Backups
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="users" element={<Users />} />
          <Route path="authors" element={<Authors />} />
          <Route path="loans" element={<Loans />} />
          <Route path="backups" element={<Backups />} /> {/* Adicione esta linha para a rota de Backups */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
