import { CoreCompany as Company } from '../index';

export function isCompany(obj: unknown): obj is Company {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Company).id === 'string' &&
    typeof (obj as Company).tenantId === 'string' &&
    typeof (obj as Company).name === 'string'
  );
}

export function createDefaultCompany(partial: Partial<Company>): Company {
  return {
    id: partial.id || '',
    tenantId: partial.tenantId || '',
    name: partial.name || '',
    ...partial,
  };
}
