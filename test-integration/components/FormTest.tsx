'use client';

import React from 'react';
import { useLaravelForm, LaravelForm, Field, ErrorMessage } from '../../src';

interface TestFormData {
  name: string;
  email: string;
  message: string;
}

export const FormTest: React.FC = () => {
  const form = useLaravelForm<TestFormData>({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    onSubmit: async (values) => {
      try {
        // Simulation d'une requête API
        const response = await fetch('http://localhost:8000/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          console.log('✅ Formulaire envoyé avec succès');
          form.reset();
        } else {
          const error = await response.json();
          throw error;
        }
      } catch (error: any) {
        console.error('❌ Erreur de formulaire:', error);
        // Les erreurs Laravel sont automatiquement gérées par le hook
      }
    },
  });

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px 0' }}>
      <h2>📝 Test de Formulaire avec Erreurs Laravel</h2>

      <LaravelForm>
        <Field name="name" errors={form.errors} touched={form.touched}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Nom :
          </label>
          <input
            type="text"
            name="name"
            value={form.values.name}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder="Votre nom"
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              border: form.errors.name && form.touched.name ? '2px solid red' : '1px solid #ccc',
            }}
          />
          <ErrorMessage
            name="name"
            errors={form.errors}
            touched={form.touched}
          />
        </Field>

        <Field name="email" errors={form.errors} touched={form.touched}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Email :
          </label>
          <input
            type="email"
            name="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder="votre.email@example.com"
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              border: form.errors.email && form.touched.email ? '2px solid red' : '1px solid #ccc',
            }}
          />
          <ErrorMessage
            name="email"
            errors={form.errors}
            touched={form.touched}
          />
        </Field>

        <Field name="message" errors={form.errors} touched={form.touched}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Message :
          </label>
          <textarea
            name="message"
            value={form.values.message}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder="Votre message..."
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              border: form.errors.message && form.touched.message ? '2px solid red' : '1px solid #ccc',
            }}
          />
          <ErrorMessage
            name="message"
            errors={form.errors}
            touched={form.touched}
          />
        </Field>

        <button
          type="submit"
          onClick={form.handleSubmit}
          disabled={form.isSubmitting}
          style={{
            padding: '10px 20px',
            backgroundColor: form.isSubmitting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: form.isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {form.isSubmitting ? '⏳ Envoi en cours...' : '📤 Envoyer le formulaire'}
        </button>
      </LaravelForm>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>💡 Conseils de test :</strong></p>
        <ul>
          <li>Essayez d'envoyer le formulaire vide pour voir les erreurs Laravel</li>
          <li>Utilisez un email déjà existant pour tester les erreurs de validation</li>
          <li>Vérifiez la console pour voir les logs de débogage</li>
        </ul>
      </div>
    </div>
  );
};