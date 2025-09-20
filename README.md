# SGDF Notes de Frais

Application web mobile-first pour la gestion des notes de frais du groupe SGDF La Guillotière.

## Fonctionnalités

- 📸 **Capture de justificatifs** : Prise de photo ou import de fichiers
- 🔍 **OCR automatique** : Détection automatique des montants sur les justificatifs
- 📝 **Saisie des informations** : Date, branche SGDF, montant et description
- 🏷️ **Renommage automatique** : Génération du nom de fichier au format `YYYY-MM-DD - Branche - Montant.jpg`
- 💾 **Téléchargement local** : Sauvegarde et copie du fichier renommé sur votre appareil
- 📧 **Email pré-rempli** : Génération automatique d'un email avec les informations (vous attachez manuellement le fichier téléchargé)

## Branches SGDF supportées

- Louveteaux
- Jeannettes
- Scouts
- Guides
- Pionniers-Caravelles

## Technologies utilisées

- **Next.js 15** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le design responsive
- **Tesseract.js** pour l'OCR côté client
- **pnpm** comme gestionnaire de paquets
- **Deployment** : Compatible Vercel (serverless)

## Développement

```bash
# Installation des dépendances
pnpm install

# Lancement en mode développement
pnpm dev

# Build de production
pnpm build

# Lancement en production
pnpm start
```

## Utilisation

1. **Capturer un justificatif** : Utilisez l'appareil photo ou importez un fichier
2. **Vérifier les informations** : L'OCR tente de détecter automatiquement le montant
3. **Compléter le formulaire** : Saisissez la date, la branche, le montant et la description
4. **Télécharger** : Le fichier est automatiquement renommé et téléchargé sur votre appareil
5. **Copier et envoyer** : Un email pré-rempli s'ouvre, attachez manuellement le fichier téléchargé

## Déploiement

L'application est conçue pour fonctionner entièrement côté client (pas de base de données) et est compatible avec les plateformes serverless comme Vercel.

## Caractéristiques techniques

- ✅ **Mobile-first** : Interface optimisée pour smartphones
- ✅ **Traitement côté client** : Pas de dépendance serveur pour l'OCR
- ✅ **Français** : Interface entièrement en français
- ✅ **Offline-ready** : Fonctionne sans connexion internet
- ✅ **Sécurisé** : Aucune donnée stockée sur le serveur
- ✅ **Copie locale** : Les fichiers sont téléchargés directement sur votre appareil