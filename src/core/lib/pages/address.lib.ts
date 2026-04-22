import { siteConfig } from '@/core/config/site.config';

export function getCompanyAddressText() {
  const { address } = siteConfig.company;

  return `〒${address.postalCode} ${address.addressRegion}${address.addressLocality}${address.streetAddress}`;
}
