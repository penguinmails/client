import { CompanySettings } from "../model/types";

export function createDefaultCompanySettings(): CompanySettings {
  return {
    allowMemberInvites: true,
    autoApproveMembers: true,
    notifyOnNewMember: true,
  };
}
