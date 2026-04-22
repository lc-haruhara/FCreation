/** :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * サイトの基本情報を管理
 *:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: */
export const siteConfig = {
  site: {
    name: import.meta.env.PUBLIC_SITE_NAME,
    url: import.meta.env.PUBLIC_SITE_URL,
    description: import.meta.env.PUBLIC_SITE_DESCRIPTION,
    tagline: import.meta.env.PUBLIC_SITE_TAGLINE,
    defaultOgImage: import.meta.env.PUBLIC_DEFAULT_OG_IMAGE,
    titleSeparator: import.meta.env.PUBLIC_TITLE_SEPARATOR,
    googleTagManagerId: import.meta.env.PUBLIC_GOOGLE_TAG_MANAGER_ID,
  },

  company: {
    name: import.meta.env.PUBLIC_COMPANY_NAME,
    tel: import.meta.env.PUBLIC_COMPANY_TEL,
    email: import.meta.env.PUBLIC_COMPANY_EMAIL,

    address: {
      postalCode: import.meta.env.PUBLIC_COMPANY_POSTAL_CODE,
      addressRegion: import.meta.env.PUBLIC_COMPANY_ADDRESS_REGION,
      addressLocality: import.meta.env.PUBLIC_COMPANY_ADDRESS_LOCALITY,
      streetAddress: import.meta.env.PUBLIC_COMPANY_STREET_ADDRESS,
    },
  },
} as const;
