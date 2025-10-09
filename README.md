# Next.js Laravel Bridge

Un package NPM complet qui facilite l'intégration entre Next.js et Laravel, offrant des solutions prêtes à l'emploi pour l'authentification, la gestion des formulaires et la configuration API.

## Fonctionnalités

### 🔐 Authentification Laravel Sanctum
- Provider React pour la gestion de l'état d'authentification
- Hook `useAuth` pour les opérations de connexion/déconnexion
- Gestion automatique des tokens CSRF
- Refresh automatique des tokens d'accès

### 📝 Gestion des Formulaires
- Hook `useLaravelForm` pour la gestion des formulaires
- Affichage automatique des erreurs de validation Laravel
- Mapping intelligent des erreurs vers les champs de formulaire
- Support pour les validations complexes

### 🌐 Configuration API Centralisée
- Client API configuré pour Laravel
- Intercepteurs pour la gestion des erreurs et tokens
- Configuration flexible des endpoints
- Support pour les environnements multiples

## Installation

```bash
npm install next-laravel-bridge
```

## Configuration Rapide

### 1. Configuration de l'API

```typescript
// Dans votre projet Next.js
import { LaravelApiClient } from 'next-laravel-bridge';

const apiClient = new LaravelApiClient({
  baseURL: process.env.NEXT_PUBLIC_LARAVEL_API_URL,
});
```

### 2. Configuration de l'Authentification

```tsx
// pages/_app.tsx ou providers/AuthProvider.tsx
import { SanctumAuthProvider } from 'next-laravel-bridge';

export default function App({ Component, pageProps }) {
  return (
    <SanctumAuthProvider>
      <Component {...pageProps} />
    </SanctumAuthProvider>
  );
}
```

### 3. Utilisation dans un composant

```tsx
import { useAuth } from 'next-laravel-bridge';

export default function LoginForm() {
  const { login, isLoading, user } = useAuth();

  const handleSubmit = async (credentials) => {
    try {
      await login(credentials);
      // Redirection automatique en cas de succès
    } catch (error) {
      // Gestion des erreurs automatique
    }
  };

  return (
    // Votre formulaire
  );
}
```

## Structure du Package

```
src/
├── auth/           # Système d'authentification
├── api/           # Client API et configuration
├── forms/         # Gestion des formulaires
├── hooks/         # Hooks utilitaires
└── utils/         # Utilitaires et constantes
```

## Scripts Disponibles

```bash
npm run build      # Construire le package
npm run dev        # Développement avec watch
npm run test       # Lancer les tests
npm run lint       # Vérification du code
```

## Configuration Laravel Requise

Assurez-vous que votre application Laravel a les middlewares appropriés configurés :

```php
// Dans app/Http/Kernel.php
protected $middlewareGroups = [
    'web' => [
        // ...
    ],
    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // ...
    ],
];
```

## Support

Pour plus d'informations et d'exemples, consultez la [documentation complète](./docs/API.md).

## Licence

MIT