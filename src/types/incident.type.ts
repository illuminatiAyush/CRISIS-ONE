export interface Incident {
  id?: string;
  user_id?: string;
  description: string;
  lat: number | string; // can accept string from form
  lng: number | string;
  img_url?: string;
  status?: string;
  severity_level: string;
  category?: string;
  estimated_people_affected?: number | string;
  agencies_assigned?: string[];
  created_at?: Date;
}
