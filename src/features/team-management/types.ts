export type MemberRole = "owner" | "admin" | "member";
export type MemberStatus = "pending" | "active";

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string | null;
  invited_email: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
}
