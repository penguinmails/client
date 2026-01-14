import { CompanyInfo, Company } from "../model/types";

// Mapping Functions
export function mapCompanyInfoToCompany(companyInfo: CompanyInfo): Company {
  return {
    id: companyInfo.id,
    tenantId: companyInfo.tenantId,
    name: companyInfo.name,
    email: companyInfo.email,
  };
}
