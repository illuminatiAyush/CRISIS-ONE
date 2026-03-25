import { User } from "./user.type";

export interface AuthState {
  user: any | null; // Supabase Auth user
  profile: User | any;
  status: "idle" | "loading" | "authenticated" | "error";
  error?: string;
}
