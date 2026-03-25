export const roleEmailHTML = ({ profile, role, email }: {profile: any, role: string, email: string}) => {
  return `
         <h2>Welcome to ${profile.agency_name}</h2>
    <p>Hello ${email},</p>
    <p>You have been added as a <strong>${role}</strong> in ${profile.agency_name}.</p>
    <p>You can now log in and start collaborating.</p>
    <br/>
    <p>Thanks,<br/>${profile.agency_name} Team</p>
    `;
};
