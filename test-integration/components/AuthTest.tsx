'use client';

import React, { useState } from 'react';
import { useAuth } from '../../src';

export const AuthTest: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
  const [credentials, setCredentials] = useState({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  });

  const handleLogin = async () => {
    try {
      await login({
        email: credentials.email,
        password: credentials.password,
      });
      console.log('✅ Connexion réussie !');
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        password_confirmation: credentials.password,
      });
      console.log('✅ Inscription réussie !');
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('✅ Déconnexion réussie !');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
    }
  };

  if (isLoading) {
    return <div>🔄 Chargement...</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px 0' }}>
      <h2>🧪 Test d'Authentification</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>État actuel :</h3>
        <p>Connecté : {isAuthenticated ? '✅ Oui' : '❌ Non'}</p>
        {user && (
          <div>
            <p>Utilisateur : {user.name}</p>
            <p>Email : {user.email}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test de connexion :</h3>
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
          style={{ marginRight: '10px' }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleLogin} style={{ marginRight: '10px' }}>
          🔐 Tester Login
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test d'inscription :</h3>
        <input
          type="text"
          placeholder="Nom"
          value={credentials.name}
          onChange={(e) => setCredentials(prev => ({ ...prev, name: e.target.value }))}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleRegister} style={{ marginRight: '10px' }}>
          📝 Tester Register
        </button>
      </div>

      {isAuthenticated && (
        <div>
          <button onClick={handleLogout}>
            🚪 Tester Logout
          </button>
        </div>
      )}
    </div>
  );
};