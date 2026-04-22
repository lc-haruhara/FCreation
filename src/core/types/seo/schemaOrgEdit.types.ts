export type SchemaOrgAreaServedEdit = {
  type: 'City' | 'AdministrativeArea';
  name: string;
};

export type SchemaOrgOpeningHoursEdit = {
  dayOfWeek: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
  opens: string;
  closes: string;
};

export type SchemaOrgEntityType =
  | 'Organization'
  | 'Company'
  | 'LocalBusiness'
  | 'Store'
  | 'Person'
  | 'SoftwareApplication';

export type SchemaOrgSoftwareEdit = {
  /**
   * ソフトウェア名（アプリ名 / サービス名）
   */
  name: string;
  /**
   * 説明（任意）。未指定なら site.description を使う想定。
   */
  description?: string;
  /**
   * カテゴリ（任意）。例: "BusinessApplication", "DeveloperApplication", "FinanceApplication" 等。
   */
  applicationCategory?: string;
  /**
   * 動作環境（任意）。例: "Web", "iOS", "Android", "Windows" 等。
   */
  operatingSystem?: string | string[];
  /**
   * 料金（任意）。無料なら "0" など。未指定なら offers を出しません。
   */
  price?: string;
  /**
   * 通貨（任意）。例: "JPY", "USD"
   */
  priceCurrency?: string;
};

export type SchemaOrgCompanyEdit = {
  /**
   * 事業者タイプ（案件に合わせて選択）
   * - 会社: "Company" / "Organization"
   * - 店舗: "LocalBusiness" / "Store"
   * - 個人: "Person"
   */
  entityType: SchemaOrgEntityType;
  name: string;
  telephone: string;
  priceRange?: string;
  logoPath: string;
  imagePath: string;
  address?: {
    postalCode: string;
    addressRegion: string;
    addressLocality: string;
    streetAddress: string;
    addressCountry: string;
  };
  geo?: {
    latitude: string;
    longitude: string;
  };
  areaServed?: SchemaOrgAreaServedEdit[];
  openingHours?: SchemaOrgOpeningHoursEdit;
  sameAs: string[];
};

export type SchemaOrgEdit = {
  language: string;
  breadcrumbHomeLabel: string;
  company: SchemaOrgCompanyEdit;
  /**
   * entityType が "SoftwareApplication" の場合に使う編集データ
   */
  software?: SchemaOrgSoftwareEdit;
};
