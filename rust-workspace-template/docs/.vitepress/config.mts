import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Rust Workspace Template",
  description: "A production-ready Rust workspace template for multi-crate CLI/library projects",
  lang: "en-US",
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  ],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API Reference", link: "/api/overview" },
      {
        text: "More",
        items: [
          { text: "Changelog", link: "/changelog" },
          { text: "Contributing", link: "/contributing" },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          collapsed: false,
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Project Structure", link: "/guide/project-structure" },
            { text: "Development", link: "/guide/development" },
            { text: "Release", link: "/guide/release" },
            { text: "Publishing", link: "/guide/publishing" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/overview" },
            { text: "CLI Crate", link: "/api/cli" },
            { text: "Core Crate", link: "/api/core" },
            { text: "Config Crate", link: "/api/config" },
            { text: "Utils Crate", link: "/api/utils" },
            { text: "Macros Crate", link: "/api/macros" },
          ],
        },
      ],
      "/": [
        {
          text: "Introduction",
          items: [{ text: "Overview", link: "/" }],
        },
        {
          text: "Guide",
          collapsed: false,
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Project Structure", link: "/guide/project-structure" },
            { text: "Development", link: "/guide/development" },
            { text: "Release", link: "/guide/release" },
            { text: "Publishing", link: "/guide/publishing" },
          ],
        },
        {
          text: "Architecture",
          collapsed: false,
          items: [
            { text: "Overview", link: "/architecture" },
          ],
        },
        {
          text: "API Reference",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/overview" },
            { text: "CLI Crate", link: "/api/cli" },
            { text: "Core Crate", link: "/api/core" },
            { text: "Config Crate", link: "/api/config" },
            { text: "Utils Crate", link: "/api/utils" },
            { text: "Macros Crate", link: "/api/macros" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/your-org/your-repo" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present",
    },

    outline: {
      label: "On This Page",
    },

    docFooter: {
      prev: "Previous",
      next: "Next",
    },

    lastUpdatedText: "Last Updated",
  },
});
