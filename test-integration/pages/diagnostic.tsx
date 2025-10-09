'use client';

import React, { useState } from 'react';
import { SimpleAuthTest } from '../components/SimpleAuthTest';

export default function DiagnosticPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [results, setResults] = useState<{[key: number]: string}>({});

  const updateResult = (step: number, result: string) => {
    setResults(prev => ({ ...prev, [step]: result }));
  };

  const steps = [
    {
      id: 1,
      title: "Vérification de l'installation du package",
      action: async () => {
        try {
          // Test d'import direct
          const module = await import('../../../next-laravel/src');
          updateResult(1, `✅ Import réussi - Composants disponibles: ${Object.keys(module).length}`);
          return true;
        } catch (error) {
          updateResult(1, `❌ Erreur d'import: ${error.message}`);
          return false;
        }
      }
    },
    {
      id: 2,
      title: "Test du build du package",
      action: async () => {
        try {
          // Vérifier si le dossier dist existe
          const fs = await import('fs');
          const path = '../../../next-laravel/dist';

          if (fs.existsSync(path)) {
            const files = fs.readdirSync(path);
            updateResult(2, `✅ Build trouvé - Fichiers: ${files.join(', ')}`);
            return true;
          } else {
            updateResult(2, `❌ Dossier dist non trouvé`);
            return false;
          }
        } catch (error) {
          updateResult(2, `❌ Erreur de vérification: ${error.message}`);
          return false;
        }
      }
    },
    {
      id: 3,
      title: "Test des dépendances React",
      action: async () => {
        try {
          const react = await import('react');
          const reactDom = await import('react-dom');

          updateResult(3, `✅ React ${react.version}, ReactDOM ${reactDom.version}`);
          return true;
        } catch (error) {
          updateResult(3, `❌ Erreur React: ${error.message}`);
          return false;
        }
      }
    }
  ];

  const runDiagnostic = async () => {
    for (const step of steps) {
      setCurrentStep(step.id);
      await step.action();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
    }
  };

  return (
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
        <h1>🔧 Page de Diagnostic - Next.js Laravel Bridge</h1>
        <p>Cette page va diagnostiquer le problème étape par étape</p>
      </header>

      <main>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2>🚀 Diagnostic Automatique</h2>
          <button
            onClick={runDiagnostic}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            🔍 Lancer le Diagnostic Complet
          </button>

          <div style={{ display: 'grid', gap: '10px' }}>
            {steps.map(step => (
              <div
                key={step.id}
                style={{
                  padding: '15px',
                  backgroundColor: currentStep === step.id ? '#e3f2fd' : '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  borderLeft: `4px solid ${results[step.id] ? '#28a745' : '#007bff'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Étape {step.id}:</strong>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: results[step.id] ? '#d4edda' : '#fff3cd',
                    color: results[step.id] ? '#155724' : '#856404'
                  }}>
                    {results[step.id] ? 'Terminée' : 'En attente'}
                  </span>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <strong>{step.title}</strong>
                </div>
                {results[step.id] && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: results[step.id].includes('❌') ? '#f8d7da' : '#d4edda',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}>
                    {results[step.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <SimpleAuthTest />

        <div style={{
          backgroundColor: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3>🔧 Solutions Possibles</h3>

          <h4>Si l'import échoue :</h4>
          <ol>
            <li><strong>Rebuild le package :</strong> <code>cd chemin/vers/next-laravel && npm run build</code></li>
            <li><strong>Réinstalle les dépendances :</strong> <code>cd votre-projet-next && rm -rf node_modules && npm install</code></li>
            <li><strong>Vérifie les chemins :</strong> Assure-toi que le chemin vers next-laravel est correct</li>
          </ol>

          <h4>Si React a des problèmes :</h4>
          <ol>
            <li><strong>Vérifie les versions :</strong> <code>npm list react react-dom next</code></li>
            <li><strong>Nettoie le cache :</strong> <code>rm -rf .next && npm run dev</code></li>
          </ol>
        </div>

        <div style={{
          backgroundColor: '#d1ecf1',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3>📋 Commandes de Réparation</h3>

          <h4>1. Réparation Complète :</h4>
          <pre style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
{`# Dans le dossier du package
cd chemin/vers/next-laravel
npm run build

# Dans votre projet Next.js
cd votre-projet-next
rm -rf node_modules .next
npm install
npm install /chemin/vers/next-laravel/dist`}
          </pre>

          <h4>2. Test Rapide :</h4>
          <pre style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
{`# Vérifier le build
ls -la chemin/vers/next-laravel/dist/

# Vérifier l'installation
npm list next-laravel-bridge`}
          </pre>
        </div>
      </main>

      <footer style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        color: '#666',
        borderTop: '1px solid #ddd'
      }}>
        <p>🔧 Outil de diagnostic créé par Jourdan Totonde</p>
        <p>Package : <strong>next-laravel-bridge</strong></p>
      </footer>
    </div>
  );
}