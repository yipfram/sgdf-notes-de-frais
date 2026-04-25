import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'fr-FR',
  title: 'SGDF Notes de Frais',
  description: 'Documentation du projet SGDF Notes de Frais',
  base: '/sgdf-notes-de-frais/',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Accueil', link: '/' },
      { text: 'Utilisation', link: '/guide/usage' },
      { text: 'Déploiement', link: '/deploy/application' },
      { text: 'GitHub Pages', link: '/deploy/github-pages' }
    ],
    sidebar: [
      {
        text: 'Démarrage',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Vue d’ensemble', link: '/overview' }
        ]
      },
      {
        text: 'Guide',
        items: [
          { text: 'Utilisation', link: '/guide/usage' },
          { text: 'Installation locale', link: '/guide/local-installation' }
        ]
      },
      {
        text: 'Déploiement',
        items: [
          { text: 'Déploiement applicatif', link: '/deploy/application' },
          { text: 'Déployer la documentation (GitHub Pages)', link: '/deploy/github-pages' }
        ]
      },
      {
        text: 'Référence',
        items: [
          { text: 'Configuration', link: '/configuration' },
          { text: 'Dépannage', link: '/troubleshooting/index' },
          { text: 'Méta documentation VitePress', link: '/meta/vitepress-docs' },
          { text: 'Roadmap', link: '/roadmap' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yipfram/sgdf-notes-de-frais' }
    ]
  }
})
