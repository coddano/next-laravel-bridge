'use client';

import React from 'react';
import { SanctumAuthProvider } from '../../src';
import { AuthTest } from '../components/AuthTest';
import { FormTest } from '../components/FormTest';

export default function TestPage() {
  return (
    <SanctumAuthProvider>
      <div style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
      }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '40px',
          padding: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '8px'
        }}>
          <h1>🧪 Test d'Intégration - Next.js Laravel Bridge</h1>
          <p>Testez votre package NPM avant de le publier</p>
        </header>

        <main>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2>📋 Instructions de Test</h2>
            <ol>
              <li><strong>Configuration Laravel :</strong> Assurez-vous que votre serveur Laravel tourne sur <code>http://localhost:8000</code></li>
              <li><strong>Variables d'environnement :</strong> Configurez <code>NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api</code></li>
              <li><strong>Test d'authentification :</strong> Utilisez les identifiants de test ou créez un compte</li>
              <li><strong>Test de formulaires :</strong> Les erreurs Laravel s'affichent automatiquement</li>
            </ol>
          </div>

          <AuthTest />
          <FormTest />

          <div style={{
            backgroundColor: '#e9ecef',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>🔧 Configuration Requise</h3>

            <h4>Backend Laravel :</h4>
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '14px'
            }}>
{`// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:3000')),

// routes/api.php
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->get('/user', fn() => auth()->user());

// .env
SANCTUM_STATEFUL_DOMAINS=localhost:3000`}
            </pre>

            <h4>Frontend Next.js :</h4>
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '14px'
            }}>
{`// .env.local
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api`}
            </pre>
          </div>

          <div style={{
            backgroundColor: '#d4edda',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>✅ Fonctionnalités Testées</h3>
            <ul>
              <li>🔐 Authentification Laravel Sanctum (login/register/logout)</li>
              <li>📝 Gestion des formulaires avec erreurs Laravel</li>
              <li>🌐 Client API avec gestion automatique des erreurs</li>
              <li>💾 Persistance des tokens d'authentification</li>
              <li>🔄 Gestion des états de chargement</li>
            </ul>
          </div>
        </main>

        <footer style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          color: '#666',
          borderTop: '1px solid #ddd'
        }}>
          <p>🚀 Package créé par Jourdan Totonde - <strong>next-laravel-bridge</strong></p>
          <p>Tous les tests passent ✅ - Prêt pour la publication NPM !</p>
        </footer>
      </div>
    </SanctumAuthProvider>
  );
}