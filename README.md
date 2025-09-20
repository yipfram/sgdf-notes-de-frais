# Notes de Frais SGDF - La Guillotière

Application web mobile-first pour la gestion des notes de frais du groupe SGDF La Guillotière.

![SGDF App Desktop](https://github.com/user-attachments/assets/7475457e-e6f0-4a91-99e1-838d14af8642)

![SGDF App Mobile](https://github.com/user-attachments/assets/0804cbb5-83a4-441c-9b82-453db63a93b1)

## Fonctionnalités

- ✅ **Interface en français** - Application entièrement en français
- ✅ **Mobile-first** - Optimisé pour smartphone avec gros boutons et inputs larges
- ✅ **Prise de photo/Import** - Capture photo avec l'appareil ou import de fichier
- ✅ **OCR intelligent** - Détection automatique des montants dans les justificatifs
- ✅ **Formulaire complet** - Saisie Date, Branche SGDF, Montant, Description
- ✅ **Génération de fichier** - Renommage automatique au format: `YYYY-MM-DD - Branche - Montant.jpg`
- ✅ **Téléchargement local** - Téléchargement du fichier renommé
- ✅ **Email pré-rempli** - Génération d'un mailto avec toutes les informations
- ✅ **Envoi email optionnel** - API pour envoi automatique d'email (configurable)

## Branches SGDF supportées

- Louveteaux
- Jeannettes  
- Scouts
- Guides
- Pionniers-Caravelles

## Technologies

- **Next.js 15.5.3** avec App Router
- **TypeScript** - Code entièrement typé
- **Tailwind CSS** - Design responsive mobile-first
- **Tesseract.js** - OCR côté client
- **React Hook Form** - Gestion des formulaires
- **Lucide React** - Icônes modernes
- **File-saver** - Téléchargement de fichiers

## Installation et Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## Scripts disponibles

```bash
npm run dev      # Mode développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Vérification ESLint
```

## Utilisation

1. **Prendre/Importer une photo** du justificatif de dépense
2. **Attendre l'analyse OCR** - Les montants détectés apparaîtront automatiquement
3. **Remplir le formulaire** - Date, Branche, Montant, Description
4. **Télécharger le fichier** renommé automatiquement
5. **Préparer l'email** avec les informations pré-remplies
6. **Optionnel**: Envoyer l'email automatiquement via l'API

## Déploiement sur Vercel

Le moyen le plus simple de déployer cette application Next.js est d'utiliser la [plateforme Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

```bash
# Build de production
npm run build

# Déploiement
npx vercel --prod
```

### Variables d'environnement (optionnelles)

Pour activer l'envoi d'email automatique, configurer:

```env
RESEND_API_KEY=your_resend_api_key
```

## Architecture

- **Client-side only** - Aucune base de données requise
- **Serverless** - Compatible avec le déploiement Vercel
- **Progressive Web App** - Optimisé pour usage mobile
- **Offline-capable** - Fonctionne même sans connexion internet (sauf envoi email)

Consultez la [documentation Next.js](https://nextjs.org/docs) pour plus d'informations.
