import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Universal Agent',
  description: '通用型 Agent Runtime，支持多模型、多工具、插件化 Skill 系统',
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'CLI', link: '/guide/cli' },
      { text: 'Architecture', link: '/guide/architecture' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'CLI', link: '/guide/cli' },
          { text: 'Architecture', link: '/guide/architecture' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/example/universal-agent' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present',
    },
    search: {
      provider: 'local',
    },
  },
})
