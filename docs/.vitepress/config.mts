import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "fr-FR",
  title: "SGDF Notes de Frais",
  description: "Documentation du projet SGDF Notes de Frais",
  base: "/sgdf-notes-de-frais/",
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Accueil", link: "/" },
      { text: "Utilisation", link: "/guide/usage" },
      { text: "Technique", link: "/technical/local-installation" },
    ],
    sidebar: [
      {
        text: "Utilisateur",
        items: [
          { text: "Introduction", link: "/" },
          { text: "Vue d'ensemble", link: "/overview" },
          { text: "Guide d'utilisation", link: "/guide/usage" },
        ],
      },
      {
        text: "Déploiement",
        collapsed: true,
        items: [
          {
            text: "Installation locale",
            link: "/technical/local-installation",
          },
          { text: "Configuration", link: "/technical/configuration" },
          {
            text: "Variables d'environnement",
            link: "/technical/environment-variables",
          },
          { text: "Déploiement Vercel", link: "/technical/vercel" },
          { text: "Déploiement Docker", link: "/technical/docker" },
          { text: "Dépannage", link: "/technical/troubleshooting" },
          {
            text: "Méta documentation VitePress",
            link: "/technical/vitepress-docs",
          },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/yipfram/sgdf-notes-de-frais",
      },
    ],
  },
  sitemap: {
    hostname: "https://yipfram.github.io/sgdf-notes-de-frais/",
    lastmodDateOnly: false,
  },
});
