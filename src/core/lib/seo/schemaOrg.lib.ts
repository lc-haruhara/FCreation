import { site } from '@/core/lib/seo/siteEnv.lib';
import type { SchemaGraphDocument } from '@/core/types/seo/schemaOrg.types';
import type { SchemaOrgEdit } from '@/core/types/seo/schemaOrgEdit.types';

/**
 * schema.org（JSON-LD）の生成ロジック。
 *
 * - 案件ごとの入力値は `core/config/schema.org.edit.ts` に寄せる
 * - ここは `@graph` の「構造」を管理する層（type/id/Breadcrumb/WebSite/company 等）
 * - `SearchAction` は要件上不要なため出力しない
 */

const DEFAULT_SITE_URL = 'https://example.com';

function baseUrl() {
  // `site.url`（PUBLIC_SITE_URL）が未設定の時でも動くようにフォールバックを持たせています。
  return site.url ?? DEFAULT_SITE_URL;
}

function absoluteUrl(pathOrUrl: string) {
  // edit 側で "/logo.svg" のようなパス指定でもOKにし、ここで絶対URLへ正規化します。
  if (!pathOrUrl) return pathOrUrl;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) return `${baseUrl()}${pathOrUrl}`;
  return `${baseUrl()}/${pathOrUrl}`;
}

export function homeJsonLd(edit: SchemaOrgEdit): SchemaGraphDocument[] {
  // トップページ用の JSON-LD（schema.org）を生成します。
  // ここは「サイト全体の代表」として WebSite を定義する用途も兼ねます。
  const url = `${baseUrl()}/`;
  const { company } = edit;
  const isPerson = company.entityType === 'Person';
  const isSoftware = company.entityType === 'SoftwareApplication';
  const entityType: string = (isSoftware ? 'Organization' : company.entityType) as string;

  return [
    {
      '@context': 'https://schema.org',
      '@graph': [
        // ページ情報
        {
          '@type': 'CollectionPage',
          '@id': url,
          url,
          name: site.name,
          isPartOf: { '@id': `${baseUrl()}/#website` },
          description: site.description,
          breadcrumb: { '@id': `${baseUrl()}/#breadcrumb` },
          inLanguage: edit.language,
        },
        // WebPage を明示（要求仕様: { "@type": "WebPage", "name": "...", "url": "..." }）
        {
          '@type': 'WebPage',
          name: site.name,
          url,
        },
        // パンくず
        {
          '@type': 'BreadcrumbList',
          '@id': `${baseUrl()}/#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: edit.breadcrumbHomeLabel,
              item: url,
            },
          ],
        },
        // サイト情報（SearchAction は要件上出力しない）
        {
          '@type': 'WebSite',
          '@id': `${baseUrl()}/#website`,
          url,
          name: site.name,
          description: site.description,
          inLanguage: edit.language,
        },
        // 会社情報（案件で埋める値は edit 側に寄せる）
        {
          '@type': entityType,
          '@id': `${baseUrl()}/#company`,
          name: company.name,
          url,
          logo: absoluteUrl(company.logoPath),
          image: absoluteUrl(company.imagePath),
          telephone: company.telephone,
          ...(isPerson || isSoftware ? {} : { priceRange: company.priceRange }),
          ...(!isPerson && !isSoftware && company.address
            ? {
                address: {
                  '@type': 'PostalAddress',
                  postalCode: company.address.postalCode,
                  addressRegion: company.address.addressRegion,
                  addressLocality: company.address.addressLocality,
                  streetAddress: company.address.streetAddress,
                  addressCountry: company.address.addressCountry,
                },
              }
            : {}),
          ...(!isPerson && !isSoftware && company.geo
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: company.geo.latitude,
                  longitude: company.geo.longitude,
                },
              }
            : {}),
          ...(!isPerson && !isSoftware && company.areaServed?.length
            ? {
                areaServed: company.areaServed.map((a) => ({
                  '@type': a.type,
                  name: a.name,
                })),
              }
            : {}),
          ...(!isPerson && !isSoftware && company.openingHours
            ? {
                openingHoursSpecification: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: company.openingHours.dayOfWeek,
                  opens: company.openingHours.opens,
                  closes: company.openingHours.closes,
                },
              }
            : {}),
          sameAs: company.sameAs,
        },
        ...(isSoftware
          ? [
              {
                '@type': 'SoftwareApplication',
                '@id': `${baseUrl()}/#software`,
                name: edit.software?.name ?? site.name,
                description: edit.software?.description ?? site.description,
                applicationCategory: edit.software?.applicationCategory,
                operatingSystem: edit.software?.operatingSystem,
                url,
                provider: { '@id': `${baseUrl()}/#company` },
                ...(edit.software?.price && edit.software?.priceCurrency
                  ? {
                      offers: {
                        '@type': 'Offer',
                        price: edit.software.price,
                        priceCurrency: edit.software.priceCurrency,
                        url,
                      },
                    }
                  : {}),
              },
            ]
          : []),
      ],
    },
  ];
}

export type PageJsonLdParams = {
  type: PageSchemaType;
  path: string;
  name: string;
  description?: string;
  edit: SchemaOrgEdit;
  /**
   * mainEntity として company（#company）を参照したい場合に true
   */
  includeMainEntityCompany?: boolean;
};

export type PageSchemaType =
  | 'WebPage'
  | 'ContactPage'
  | 'AboutPage'
  | 'CollectionPage'
  | 'FAQPage'
  | 'SearchResultsPage';

export function pageJsonLd(params: PageJsonLdParams): SchemaGraphDocument[] {
  // 固定ページ向けの JSON-LD を生成します。
  // - ページ種別（ContactPage/FAQPage 等）は `params.type` で制御
  // - Breadcrumb / company は共通で併記する
  // - WebSite（#website）の実体定義はトップページ側で行い、下層は `isPartOf` で参照のみ
  const url = absoluteUrl(params.path);
  const edit = params.edit;
  const { company } = edit;
  const isPerson = company.entityType === 'Person';
  const isSoftware = company.entityType === 'SoftwareApplication';
  const entityType: string = (isSoftware ? 'Organization' : company.entityType) as string;
  const breadcrumbId = `${baseUrl()}/#breadcrumb${params.path === '/' ? '' : params.path}`;
  const companyId = `${baseUrl()}/#company`;

  return [
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': params.type,
          '@id': url,
          name: params.name,
          url,
          ...(params.description ? { description: params.description } : {}),
          inLanguage: edit.language,
          isPartOf: { '@id': `${baseUrl()}/#website` },
          breadcrumb: { '@id': breadcrumbId },
          ...(params.includeMainEntityCompany ? { mainEntity: { '@id': companyId } } : {}),
        },
        // パンくず（home → current）
        {
          '@type': 'BreadcrumbList',
          '@id': breadcrumbId,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: edit.breadcrumbHomeLabel,
              item: `${baseUrl()}/`,
            },
            ...(params.path === '/'
              ? []
              : [
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: params.name,
                    item: url,
                  },
                ]),
          ],
        },
        // サイト情報（SearchAction は要件上出力しない）
        ...(params.path === '/'
          ? [
              {
                '@type': 'WebSite',
                '@id': `${baseUrl()}/#website`,
                url: `${baseUrl()}/`,
                name: site.name,
                description: site.description,
                inLanguage: edit.language,
              },
            ]
          : []),
        // 会社情報
        {
          '@type': entityType,
          '@id': companyId,
          name: company.name,
          url: `${baseUrl()}/`,
          logo: absoluteUrl(company.logoPath),
          image: absoluteUrl(company.imagePath),
          telephone: company.telephone,
          ...(isPerson || isSoftware ? {} : { priceRange: company.priceRange }),
          ...(!isPerson && !isSoftware && company.address
            ? {
                address: {
                  '@type': 'PostalAddress',
                  postalCode: company.address.postalCode,
                  addressRegion: company.address.addressRegion,
                  addressLocality: company.address.addressLocality,
                  streetAddress: company.address.streetAddress,
                  addressCountry: company.address.addressCountry,
                },
              }
            : {}),
          ...(!isPerson && !isSoftware && company.geo
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: company.geo.latitude,
                  longitude: company.geo.longitude,
                },
              }
            : {}),
          ...(!isPerson && !isSoftware && company.areaServed?.length
            ? {
                areaServed: company.areaServed.map((a) => ({
                  '@type': a.type,
                  name: a.name,
                })),
              }
            : {}),
          ...(!isPerson && !isSoftware && company.openingHours
            ? {
                openingHoursSpecification: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: company.openingHours.dayOfWeek,
                  opens: company.openingHours.opens,
                  closes: company.openingHours.closes,
                },
              }
            : {}),
          sameAs: company.sameAs,
        },
        ...(isSoftware
          ? [
              {
                '@type': 'SoftwareApplication',
                '@id': `${baseUrl()}/#software`,
                name: edit.software?.name ?? site.name,
                description: edit.software?.description ?? site.description,
                applicationCategory: edit.software?.applicationCategory,
                operatingSystem: edit.software?.operatingSystem,
                url: `${baseUrl()}/`,
                provider: { '@id': `${baseUrl()}/#company` },
                ...(edit.software?.price && edit.software?.priceCurrency
                  ? {
                      offers: {
                        '@type': 'Offer',
                        price: edit.software.price,
                        priceCurrency: edit.software.priceCurrency,
                        url: `${baseUrl()}/`,
                      },
                    }
                  : {}),
              },
            ]
          : []),
      ],
    },
  ];
}
