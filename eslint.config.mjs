import coreWebVitalsConfig from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: [
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**',
    ],
  },
  ...coreWebVitalsConfig,
]

export default config
