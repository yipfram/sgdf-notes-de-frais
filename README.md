# SGDF Notes de Frais

Application web mobile-first pour la gestion des notes de frais du groupe SGDF La Guillotière.

## Fonctionnalités

- 📸 **Capture de justificatifs** : Prise de photo ou import de fichiers
- 🔍 **OCR automatique** : Détection automatique des montants sur les justificatifs
- 📝 **Saisie des informations** : Date, branche SGDF, montant et description
- 🏷️ **Renommage automatique** : Génération du nom de fichier au format `YYYY-MM-DD - Branche - Montant.jpg`
- 💾 **Téléchargement local** : Sauvegarde du fichier renommé
- 📧 **Email pré-rempli** : Génération automatique d'un email avec les informations

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
- **Deployment** : Compatible Vercel (serverless)

## Développement

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Build de production
npm run build

# Lancement en production
npm start
```

## Utilisation

1. **Capturer un justificatif** : Utilisez l'appareil photo ou importez un fichier
2. **Vérifier les informations** : L'OCR tente de détecter automatiquement le montant
3. **Compléter le formulaire** : Saisissez la date, la branche, le montant et la description
4. **Télécharger** : Le fichier est automatiquement renommé et téléchargé
5. **Envoyer par email** : Un email pré-rempli s'ouvre avec toutes les informations

## Déploiement

L'application est conçue pour fonctionner entièrement côté client (pas de base de données) et est compatible avec les plateformes serverless comme Vercel.

## Caractéristiques techniques

- ✅ **Mobile-first** : Interface optimisée pour smartphones
- ✅ **Traitement côté client** : Pas de dépendance serveur pour l'OCR
- ✅ **Français** : Interface entièrement en français
- ✅ **Offline-ready** : Fonctionne sans connexion internet
- ✅ **Sécurisé** : Aucune donnée stockée sur le serveur