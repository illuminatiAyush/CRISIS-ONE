export interface User {
    id?: string;
    username?: string;
    email?: string;
    role: "admin" | "citizen" | "volunteer" | "coordinator" | "agency";
  }