export type Role = "admin" | "citizen" | "volunteer" | "coordinator" | "agency";

export const roles: {
  id: Role;
  title: string;
  description: string;
}[] = [


    {
      id: "admin",
      title: "Administrator",
      description: "Manage operations, users, and reports",
    },
    {
      id: "citizen",
      title: "Citizen",
      description: "Report incidents and view incident reports",
    },
    {
      id: "volunteer",
      title: "Volunteer",
      description: "Assist during crises and relief operations",
    },
    {
      id: "coordinator",
      title: "Coordinator",
      description: "Manage the volunteer during crises assign tasks and manage resources.",
    },
    {
      id: "agency",
      title: "Agency",
      description: "Manage the coordinator and resources during cirses",
    },
  ];
