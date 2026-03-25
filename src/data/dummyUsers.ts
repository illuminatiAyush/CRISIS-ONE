export type Role = "admin" | "citizen" | "volunteer" | "coordinator" | "agency";

export interface DummyUser {
  email: string;
  password: string;
  role: Role;
}

export const dummyUsers: DummyUser[] = [
  { email: "admin@gmail.com", password: "Admin@123", role: "admin" },
  { email: "citizen@gmail.com", password: "Citizen@123", role: "citizen" },
  {
    email: "volunteer@gmail.com",
    password: "Volunteer@123",
    role: "volunteer",
  },
  {
    email: "coordinator@gmail.com",
    password: "Coordinator@123",
    role: "coordinator",
  },

  // agencies
  { email: "agency@gmail.com", password: "Agency@123", role: "agency" }, // for Gov agency
  {
    email: "healthcare.agency@gmail.com",
    password: "Healthcare@123",
    role: "agency",
  },
  { email: "ngo.agency@gmail.com", password: "Ngo@123", role: "agency" },
  {
    email: "volunteer.organization.agency@gmail.com",
    password: "VolunteerOrg@123",
    role: "agency",
  },
  {
    email: "infrastructure.agency@gmail.com",
    password: "Infrastructure@123",
    role: "agency",
  },
];
