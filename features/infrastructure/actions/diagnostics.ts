"use server";

import { getHestiaConfig, getKumoConfig } from './config';
import { listWebDomains } from '../api/hestia';
import { getSystemServicesAction } from './monitoring';
import { listContactsAction } from '@/features/marketing';

export interface DiagnosticResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'not_configured';
  message: string;
  latency?: number;
  details?: Record<string, unknown>;
}

/**
 * Diagnostic action to check connectivity with all infrastructure services
 */
export async function runInfrastructureDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // 1. Test HestiaCP
  try {
    const start = Date.now();
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';
    await listWebDomains(config, user);
    results.push({
      service: 'HestiaCP (Infrastructure)',
      status: 'healthy',
      message: 'Successfully connected and listed domains',
      latency: Date.now() - start
    });
  } catch (error: unknown) {
    results.push({
      service: 'HestiaCP (Infrastructure)',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Failed to connect to HestiaCP',
    });
  }

  // 2. Test KumoMTA (Basic API Check)
  try {
    const config = getKumoConfig();
    const response = await fetch(`${config.apiBaseUrl}/api/inject/v1`, {
        method: 'OPTIONS', // Just checking endpoint existence
        cache: 'no-store'
    });
    
    results.push({
        service: 'KumoMTA (SMTP)',
        status: response.ok || response.status === 401 || response.status === 405 ? 'healthy' : 'unhealthy',
        message: `API endpoint reached (Status: ${response.status})`,
    });
  } catch {
    results.push({
      service: 'KumoMTA (SMTP)',
      status: 'unhealthy',
      message: 'Failed to reach KumoMTA API',
    });
  }

  // 3. Test Mautic
  try {
    const start = Date.now();
    const result = await listContactsAction({ limit: 1 });
    
    if (result.success) {
      results.push({
        service: 'Mautic (Marketing)',
        status: 'healthy',
        message: 'Successfully connected to Mautic API',
        latency: Date.now() - start
      });
    } else {
      results.push({
        service: 'Mautic (Marketing)',
        status: 'unhealthy',
        message: result.error || 'Mautic API error',
        latency: Date.now() - start
      });
    }
  } catch {
    results.push({
      service: 'Mautic (Marketing)',
      status: 'unhealthy',
      message: 'Failed to reach Mautic API',
    });
  }

  // 4. Test System Services
  try {
    const start = Date.now();
    const result = await getSystemServicesAction();
    if (result.success) {
      const runningCount = result.data.filter(s => s.state === 'running').length;
      results.push({
        service: 'System Services',
        status: 'healthy',
        message: `${runningCount}/${result.data.length} services running`,
        latency: Date.now() - start
      });
    } else {
      results.push({
        service: 'System Services',
        status: 'unhealthy',
        message: result.error || 'Failed to fetch system services',
        latency: Date.now() - start
      });
    }
  } catch {
    results.push({
      service: 'System Services',
      status: 'unhealthy',
      message: 'Monitoring error',
    });
  }

  return results;
}
