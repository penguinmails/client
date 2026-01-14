import { CoreTenant as Tenant } from '../index';

export function isTenant(obj: unknown): obj is Tenant {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Tenant).id === 'string' &&
    typeof (obj as Tenant).name === 'string' &&
    typeof (obj as Tenant).created === 'string'
  );
}
export function createDefaultTenant(partial: Partial<Tenant>): Tenant {
  return {
    id: partial.id || '',
    name: partial.name || '',
    created: partial.created || new Date().toISOString(),
    ...partial,
  };
}
