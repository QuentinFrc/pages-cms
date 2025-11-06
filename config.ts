export const siteConfig = {
  name: "Deeev CMS",
  description: "The No-Hassle CMS for GitHub",
  metadata: {
    title: {
      template: "%s | Deeev CMS",
      default: "Deeev CMS",
    },
  },
  assets: {
    logo: {
      src: "/images/email-logo.png",
      alt: "Deeev CMS logo",
    },
    emailLogo: "/images/email-logo.png",
  },
  links: {
    website: "https://pagescms.org",
    docs: "https://pagescms.org/docs",
    github: "https://github.com/pages-cms/pages-cms",
    terms: "https://pagescms.org/terms",
    privacy: "https://pagescms.org/privacy",
  },
} as const;

export type SiteConfig = typeof siteConfig;
