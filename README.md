# SGDF Notes de Frais

Application web mobile-first pour la gestion des notes de frais du groupe SGDF La Guillotière.

## Fonctionnalités

- 📸 **Capture de justificatifs** : Prise de photo ou import de fichiers
- 📝 **Saisie des informations** : Date, branche SGDF, montant, type et description
- ✉️ **Envoi email automatique** : Transmission à la trésorerie + copie à l'utilisateur avec la photo en pièce jointe
- 🏷️ **Nom de fichier structuré** : `YYYY-MM-DD - Branche - Type - Montant.jpg`
- 📲 **Installation PWA** : Ajout possible à l'écran d'accueil (Android / iOS / Desktop)
- ⚡ **Mode hors ligne partiel** : Consultation et préparation possible sans réseau (l'envoi nécessite la connexion)
- 🔔 **Bannière d'installation** : Invitation A2HS personnalisée
- 🌙 **Affichage plein écran** : Expérience proche d'une application native

## PWA & Expérience Mobile

L'application est maintenant une **Progressive Web App** :

| Capacité | Détails |
|----------|---------|
| Installation | Icône sur écran d'accueil + splash screen natif |
| Service Worker | Cache Shell applicatif + stratégie network-first pour API |
| Offline | Formulaire utilisable, image conservée en mémoire, envoi différé impossible (pas de queue persistée) |
| Icônes | Logo SGDF bleu & blanc (maskable) |
| Performance | Stratégie *stale-while-revalidate* pour actifs statiques |
| Sécurité | Toujours via HTTPS (caméra + SW) |

> Limitation actuelle : pas encore de stockage local durable des brouillons. Si la page est rechargée hors ligne, la note en cours est perdue.

## Branches SGDF supportées

# SGDF Notes de Frais

Application web mobile-first pour la gestion des notes de frais du groupe SGDF La Guillotière.

## Fonctionnalités principales

- 📸 **Capture de justificatifs** : prise de photo ou import de fichiers depuis le mobile ou le bureau
- 📝 **Saisie guidée** : l'utilisateur saisit manuellement la date, la branche, le montant et la description
- ✉️ **Envoi email automatique** : transmission à la trésorerie + copie à l'utilisateur avec la photo en pièce jointe
- 🏷️ **Nom de fichier structuré** : `YYYY-MM-DD - Branche - Montant.jpg`
- 📲 **Installation PWA** : ajout possible à l'écran d'accueil (Android / iOS / Desktop)
- ⚡ **Mode hors ligne partiel** : consultation et préparation possible sans réseau (l'envoi nécessite la connexion)


## PWA & expérience mobile

L'application est une Progressive Web App (PWA) optimisée pour mobile :

| Capacité | Détails |
|----------|---------|
| Installation | Icône / raccourci sur l'écran d'accueil + splash screen |
| Service Worker | Cache applicatif + stratégies runtime pour ressources statiques |
| Offline | Le formulaire est utilisable tant que l'onglet reste ouvert ; l'envoi exige une connexion |
| Icônes | `SGDF_symbole_RVB.png` & `SGDF_symbole_blanc.png` |
| Performance | Stratégie *stale-while-revalidate* pour actifs statiques |
| Sécurité | HTTPS recommandé (obligatoire en production pour l'accès caméra) |

> Limitation actuelle : pas de stockage persistant des brouillons. Un rafraîchissement hors ligne efface l'état courant.

## Branches SGDF supportées

- Farfadets
- Louveteaux
- Jeannettes
- Scouts
- Guides
- Pionniers-Caravelles
- Compagnons

## Technologies utilisées

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Clerk** (authentification)
- **Nodemailer / Gmail SMTP** (envoi d'emails côté serveur)
- **PWA** (manifest + service worker)

## Développement (quickstart)

```bash
# Installer les dépendances
pnpm install

# Lancer en développement
pnpm dev

# Build pour production
pnpm build

# Lancer en production (si déployé localement)
pnpm start
```

## Utilisation

1. Se connecter via Clerk
2. Capturer ou importer la photo du justificatif
3. Saisir la date, la branche, le montant et la description
4. Envoyer : un email est généré côté serveur et envoyé à la trésorerie et à l'utilisateur
5. Installer l'application sur l'écran d'accueil pour un accès rapide

## Mode hors ligne

| Action | Disponible hors ligne | Notes |
|--------|-----------------------|-------|
| Ouvrir l'app (déjà chargée) | ✅ | Cache applicatif |
| Capturer une photo | ✅ | Fonctionnalité native du navigateur |
| Envoi email | ❌ | Nécessite le réseau |
| Préparation formulaire | ✅ | Reste en mémoire tant que l'onglet est ouvert |

## Améliorations possibles

- Stockage IndexedDB des notes en attente
- File d'envoi automatique quand le réseau est rétabli
- Page historique locale
- Compression d'image côté client

## Déploiement

Fonctionne bien sur Vercel ou toute plateforme supportant les API routes Next.js. Assurez-vous de définir les variables d'environnement (voir `SETUP.md`). HTTPS est requis pour l'accès caméra en production.

## Caractéristiques techniques

- ✅ Mobile-first
- ✅ PWA installable
- ✅ Envoi d'email via serveur (SMTP)
- ✅ Partiel hors ligne
- 🔐 Aucune donnée persistée côté serveur (hors emails envoyés)

## Sécurité & confidentialité

- Aucune base de données
- Les justificatifs ne sont pas stockés côté serveur en dehors de l'email envoyé lors de la soumission
- Authentification obligatoire via Clerk

---

Pour toute amélioration ou besoin spécifique (ex: sauvegarde locale des brouillons), ouvrir une issue ou proposer une PR.