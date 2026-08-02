export interface ApiKey {
  id: string;
  company_id: string;
  key: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
}
