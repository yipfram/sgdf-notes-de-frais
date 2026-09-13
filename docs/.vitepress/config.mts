import { defineConfig } from "vitepress";

const urlDocumentation = "https://scouticket.fr";
const imagePartage = `${urlDocumentation}/og-scouticket.png`;

const metadonneesPages: Record<string, { titre: string; description: string }> =
  {
    "index.md": {
      titre: "Envoyez vos justificatifs dès que vous les avez",
      description:
        "Scouticket aide les groupes scouts à centraliser leurs justificatifs et notes de frais : photos ou PDF envoyés immédiatement à la trésorerie, avec une copie pour chaque membre.",
    },
    "about.md": {
      titre: "À propos",
      description:
        "Découvrez Scouticket, l’outil gratuit et open source qui simplifie la gestion des justificatifs des groupes scouts.",
    },
    "guide/usage.md": {
      titre: "Envoyer un justificatif",
      description:
        "Apprenez à photographier ou importer un justificatif et à l’envoyer à la trésorerie avec Scouticket.",
    },
    "guide/groupes.md": {
      titre: "Configurer un groupe",
      description:
        "Configurez la trésorerie, les unités et les invitations de votre groupe scout dans Scouticket.",
    },
    "guide/e-mails.md": {
      titre: "Les e-mails de justificatifs",
      description:
        "Comprenez les informations, pièces jointes et copies envoyées par Scouticket après chaque note de frais.",
    },
    "technical/overview.md": {
      titre: "Vue d’ensemble technique",
      description:
        "Architecture, fonctionnalités et choix techniques de Scouticket : Next.js, Clerk, SMTP et PWA.",
    },
    "technical/local-installation.md": {
      titre: "Installation locale",
      description:
        "Installez et lancez Scouticket en local pour contribuer au projet ou l’adapter à votre groupe.",
    },
    "technical/configuration.md": {
      titre: "Configuration",
      description:
        "Configurez Scouticket pour l’authentification, l’envoi d’e-mails et le déploiement de l’application.",
    },
    "technical/environment-variables.md": {
      titre: "Variables d’environnement",
      description:
        "Référence des variables d’environnement nécessaires pour configurer Scouticket en toute sécurité.",
    },
    "technical/docker.md": {
      titre: "Déploiement Docker",
      description:
        "Déployez Scouticket avec Docker pour héberger l’application dans votre propre environnement.",
    },
    "technical/troubleshooting.md": {
      titre: "Dépannage",
      description:
        "Résolvez les problèmes fréquents d’installation, de configuration et d’envoi d’e-mails de Scouticket.",
    },
    "technical/vitepress-docs.md": {
      titre: "Documentation VitePress",
      description:
        "Découvrez l’organisation et les conventions de rédaction de la documentation Scouticket avec VitePress.",
    },
  };

export default defineConfig({
  lang: "fr-FR",
  title: "Scouticket",
  description:
    "Documentation du projet Scouticket, application de gestion de justificatifs et de notes de frais pour les scouts",
  base: "/",
  lastUpdated: true,
  head: [
    ["meta", { property: "og:site_name", content: "Scouticket" }],
    ["meta", { property: "og:locale", content: "fr_FR" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "script",
      {
        defer: "",
        src: "https://analytics.scouticket.fr/script.js",
        "data-website-id": "65c3c4c1-8db5-4f98-b57e-79dc22cc6910",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        href: "https://scouticket.fr/favicon.ico",
      },
    ],
  ],
  transformPageData(pageData) {
    const metadonnees = metadonneesPages[pageData.relativePath];
    if (!metadonnees) return;

    const chemin =
      pageData.relativePath === "index.md"
        ? "/"
        : `/${pageData.relativePath.replace(/\.md$/, ".html")}`;
    const urlCanonique = new URL(chemin, urlDocumentation).toString();
    const titre = `${metadonnees.titre} | Scouticket`;

    pageData.frontmatter.title = metadonnees.titre;
    pageData.frontmatter.description = metadonnees.description;
    pageData.description = metadonnees.description;
    pageData.frontmatter.head = [
      ...(pageData.frontmatter.head ?? []),
      ["link", { rel: "canonical", href: urlCanonique }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:title", content: titre }],
      [
        "meta",
        { property: "og:description", content: metadonnees.description },
      ],
      ["meta", { property: "og:url", content: urlCanonique }],
      ["meta", { property: "og:image", content: imagePartage }],
      ["meta", { property: "og:image:width", content: "1730" }],
      ["meta", { property: "og:image:height", content: "909" }],
      ["meta", { name: "twitter:title", content: titre }],
      [
        "meta",
        { name: "twitter:description", content: metadonnees.description },
      ],
      ["meta", { name: "twitter:image", content: imagePartage }],
    ];
  },
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
    hostname: "https://scouticket.fr",
    lastmodDateOnly: false,
  },
});
