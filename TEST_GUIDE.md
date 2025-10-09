# 🚀 Guide de Test Rapide - Next.js Laravel Bridge

## Vue d'ensemble

Votre package `next-laravel-bridge` est maintenant **prêt pour les tests** ! Ce guide vous explique comment le tester avec votre projet Next.js existant.

## ✅ Prérequis

- **Package construit** : `npm run build` ✅
- **Tests unitaires** : `npm test` (32/32 réussis) ✅
- **Projet Laravel** : Configuré avec Sanctum (guide fourni)

## 🧪 Test avec votre Projet Next.js

### Étape 1 : Installation dans votre Projet

```bash
# Dans votre projet Next.js
cd votre-projet-next

# Installer votre package local (en développement)
npm install /chemin/vers/next-laravel
```

### Étape 2 : Configuration de Base

Dans votre `_app.tsx` ou `layout.tsx` :

```tsx
import { SanctumAuthProvider } from 'next-laravel-bridge';

export default function App({ Component, pageProps }) {
  return (
    <SanctumAuthProvider>
      <Component {...pageProps} />
    </SanctumAuthProvider>
  );
}
```

Dans votre `.env.local` :

```env
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api
```

### Étape 3 : Test d'Authentification

```tsx
import { useAuth } from 'next-laravel-bridge';

export default function TestAuth() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      <p>Connecté: {isAuthenticated ? 'Oui' : 'Non'}</p>
      {user && <p>Bonjour {user.name}!</p>}

      <button onClick={() => login({
        email: 'test@example.com',
        password: 'password'
      })}>
        Se connecter
      </button>

      <button onClick={logout}>
        Se déconnecter
      </button>
    </div>
  );
}
```

### Étape 4 : Test de Formulaire

```tsx
import { useLaravelForm, LaravelForm, Field, ErrorMessage } from 'next-laravel-bridge';

export default function TestForm() {
  const form = useLaravelForm({
    initialValues: { name: '', email: '' },
    onSubmit: async (values) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = await response.json();
        throw error; // Erreurs Laravel gérées automatiquement
      }
    }
  });

  return (
    <LaravelForm>
      <Field name="name" errors={form.errors} touched={form.touched}>
        <input
          name="name"
          value={form.values.name}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
        <ErrorMessage name="name" errors={form.errors} touched={form.touched} />
      </Field>

      <button onClick={form.handleSubmit}>
        Envoyer
      </button>
    </LaravelForm>
  );
}
```

## 🛠️ Projet de Test Complet

Un projet de test complet est disponible dans `test-integration/` :

```bash
# Lancer le projet de test
cd test-integration
npm install
npm run dev
```

Puis ouvrez `http://localhost:3000/test` pour voir :
- ✅ Test d'authentification en temps réel
- ✅ Test de formulaires avec erreurs Laravel
- ✅ Interface de débogage complète

## 🔧 Configuration Laravel Requise

### Installation Sanctum
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Configuration
```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:3000')),

// routes/api.php
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->get('/user', fn() => auth()->user());
```

## 📋 Checklist de Test

- [ ] **Build** : `npm run build` fonctionne ✅
- [ ] **Tests** : `npm test` passe (32/32) ✅
- [ ] **Authentification** : Login/logout fonctionne
- [ ] **Formulaires** : Erreurs Laravel s'affichent
- [ ] **API** : Requêtes HTTP fonctionnelles
- [ ] **Types** : Pas d'erreurs TypeScript

## 🚨 Dépannage

### Erreur : "Module not found"
```bash
# Réinstaller les dépendances
npm install

# Rebuild le package
npm run build
```

### Erreur : "CORS policy"
- Configurez CORS côté Laravel
- Vérifiez les domaines autorisés dans Sanctum

### Erreur : "Authentification échoue"
- Vérifiez la configuration Sanctum
- Testez l'API Laravel directement avec Postman/curl

## 📈 Résultats Attendus

Après configuration correcte :

1. **Authentification** :
   - ✅ Connexion réussie avec stockage du token
   - ✅ Persistance de la session
   - ✅ Déconnexion propre

2. **Formulaires** :
   - ✅ Erreurs Laravel affichées automatiquement
   - ✅ Validation côté client + serveur
   - ✅ États de chargement gérés

3. **API** :
   - ✅ Requêtes automatiques avec tokens
   - ✅ Gestion des erreurs 401/422
   - ✅ Refresh automatique des tokens

## 🎯 Prochaines Étapes

1. **Testez** avec votre projet Next.js existant
2. **Ajustez** la configuration selon vos besoins
3. **Préparez** la publication NPM
4. **Documentez** vos cas d'usage spécifiques

## 💬 Support

- 📖 [Documentation complète](./docs/API.md)
- 🔧 [Configuration Laravel](./docs/LARAVEL_SETUP.md)
- 🚀 [Publication NPM](./docs/PUBLISHING.md)

**Votre package est prêt pour les tests !** 🎉

Quelle partie souhaitez-vous tester en premier ?