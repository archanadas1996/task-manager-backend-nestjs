export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string | null;
  project_id: number | null;
  assigned_to: number | null;
  created_at: Date | null;
}
