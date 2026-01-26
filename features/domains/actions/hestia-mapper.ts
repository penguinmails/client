import { HestiaWebDomainCollection } from '../../infrastructure/types/hestia';
import { Domain } from '../types';

/**
 * Maps Hestia domain collection to our internal Domain interface
 */
export const mapHestiaDomainsToInternal = (
  hestiaDomains: HestiaWebDomainCollection
): Domain[] => {
  return Object.entries(hestiaDomains).map(([domainName, data], index) => {
    return {
      id: index + 1, // Hestia doesn't give numeric IDs via this API, using index as temporary ID
      domain: domainName,
      status: data.STATUS === 'active' ? 'VERIFIED' : 'SUSPENDED',
      createdAt: data.DATE ? new Date(`${data.DATE} ${data.TIME}`).toISOString() : new Date().toISOString(),
      records: {
        spf: 'pending', // Will be determined by actual DNS record lookup
        dkim: 'pending',
        dmarc: 'pending',
        mx: 'pending'
      },
      // Hestia-specific metadata
      ip: data.IP,
      php: data.PHP,
      ssl: data.SSL === 'yes'
    } as Domain;
  });
};
