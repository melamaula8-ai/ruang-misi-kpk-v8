import { TeamIdentity } from '../types';

export interface TeamIdentityValidationErrors {
  teamName?: string;
  schoolName?: string;
  members: Record<number, string>;
}

export function getTeamIdentityValidationErrors(
  team: TeamIdentity
): TeamIdentityValidationErrors {
  const errors: TeamIdentityValidationErrors = { members: {} };

  if (!team.teamName.trim()) {
    errors.teamName = 'Nama kelompok wajib diisi.';
  }

  if (!team.schoolName.trim()) {
    errors.schoolName = 'Nama sekolah wajib diisi.';
  }

  if (team.members.length < 3) {
    errors.members[-1] = 'Pilih setidaknya 3 anggota kelompok.';
  }

  team.members.forEach((member, index) => {
    if (!member.name.trim()) {
      errors.members[index] = `Nama anggota ${index + 1} wajib diisi.`;
    }
  });

  return errors;
}

export function isTeamIdentityComplete(team: TeamIdentity): boolean {
  const errors = getTeamIdentityValidationErrors(team);
  return !errors.teamName && !errors.schoolName && Object.keys(errors.members).length === 0;
}
