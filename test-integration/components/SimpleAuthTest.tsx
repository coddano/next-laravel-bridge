'use client';

import React, { useState } from 'react';

// Version simplifiée SANS import du package pour diagnostiquer
export const SimpleAuthTest: React.FC = () => {
  const [status, setStatus] = useState('En attente de test...');

  const testImport = async () => {
    try {
      setStatus('🔄 Tentative d\'import...');

      // Test simple : vérifier si le package est installé
      try {
        // Essaie d'importer depuis node_modules
        const module = await import('next-laravel-bridge');
        setStatus('✅ Import réussi depuis node_modules !');
        console.log('Module importé:', module);
        return;
      } catch (error1) {
        console.log('Erreur 1:', error1.message);
      }

      // Si ça échoue, teste l'import relatif
      try {
        const module = await import('../../../next-laravel/src');
        setStatus('✅ Import réussi depuis le dossier source !');
        console.log('Module importé:', module);
        return;
      } catch (error2) {
        console.log('Erreur 2:', error2.message);
      }

      // Dernière tentative : import du dist
      try {
        const module = await import('../../../next-laravel/dist/index.js');
        setStatus('✅ Import réussi depuis le dossier dist !');
        console.log('Module importé:', module);
        return;
      } catch (error3) {
        console.log('Erreur 3:', error3.message);
      }

      setStatus('❌ Toutes les méthodes d\'import ont échoué');

    } catch (error) {
      setStatus('❌ Erreur générale: ' + error.message);
      console.error('Erreur générale:', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px 0' }}>
      <h2>🔧 Test de Diagnostic</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>État :</h3>
        <p style={{
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {status}
        </p>
      </div>

      <button
        onClick={testImport}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        🔍 Tester l'Import du Package
      </button>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <h4>📋 Instructions :</h4>
        <ol>
          <li>Cliquez sur "Tester l'Import du Package"</li>
          <li>Vérifiez le résultat dans l'état ci-dessus</li>
          <li>Vérifiez la console pour plus de détails</li>
        </ol>
      </div>
    </div>
  );
};