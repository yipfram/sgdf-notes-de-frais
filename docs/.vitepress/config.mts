import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "fr-FR",
  title: "SGDF Notes de Frais",
  description: "Documentation du projet SGDF Notes de Frais",
  base: "/",
  lastUpdated: true,
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "https://treso.romain-rochas.fr/favicon.ico",
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: "Guide d’utilisation", link: "/guide/usage" },
      { text: "À propos", link: "/about" },
    ],
    sidebar: [
      {
        text: "Utilisateur",
        items: [
          { text: "Découvrir l’outil", link: "/" },
          { text: "Guide d'utilisation", link: "/guide/usage" },
          { text: "Configurer un groupe", link: "/guide/groupes" },
          { text: "Les e-mails de justificatifs", link: "/guide/e-mails" },
          { text: "À propos", link: "/about" },
        ],
      },
      {
        text: "Déploiement",
        collapsed: true,
        items: [
          { text: "Vue d'ensemble", link: "/technical/overview" },
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
    hostname: "https://sgdf.rrchs.fr",
    lastmodDateOnly: false,
  },
});
