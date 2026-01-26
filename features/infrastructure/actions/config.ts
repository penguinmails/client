import { HestiaConfig } from '../types/hestia';
import { KumoApiConfig } from '../types/kumo';

/**
 * Gets the base hostname for all backend services
 */
const getBaseHostname = () => process.env.SERVER_HOSTNAME || '';

/**
 * Gets shared admin credentials
 */
const getAdminCredentials = () => ({
  username: process.env.SERVER_ADMIN_USER || 'admin',
  password: process.env.SERVER_ADMIN_PASSWORD || '',
});

/**
 * Gets HestiaCP configuration
 */
export const getHestiaConfig = (): HestiaConfig => {
  const { username, password } = getAdminCredentials();
  return {
    hostname: getBaseHostname(),
    port: parseInt(process.env.HESTIA_PORT || '8083', 10),
    username,
    password,
  };
};

/**
 * Gets KumoMTA configuration
 */
export const getKumoConfig = (): KumoApiConfig => {
  const { username, password } = getAdminCredentials();
  const hostname = getBaseHostname();
  const port = process.env.KUMO_PORT || '8025';
  
  return {
    apiBaseUrl: process.env.KUMO_API_URL || `https://${hostname}:${port}`,
    username,
    password,
    senderEmail: process.env.KUMO_SENDER_EMAIL || `admin@${hostname}`,
  };
};

/**
 * Gets Mautic configuration for Phase 3
 */
export const getMauticConfig = () => {
  const { username, password } = getAdminCredentials();
  const hostname = getBaseHostname();
  
  return {
    baseUrl: process.env.MAUTIC_BASE_URL || `https://mtc.${hostname}`,
    username,
    password,
  };
};

/**
 * Gets BillManager configuration
 */
export const getBillManagerConfig = () => {
  return {
    url: process.env.BILLMANAGER_URL || '',
    port: parseInt(process.env.BILLMANAGER_PORT || '1500', 10),
    username: process.env.BILLMANAGER_USERNAME || '',
    password: process.env.BILLMANAGER_PASSWORD || '',
  };
};
