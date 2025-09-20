export interface ExpenseFormData {
  date: string;
  branch: string;
  amount: string;
  description: string;
  imageFile?: File;
}

export const SGDF_BRANCHES = [
  'Louveteaux',
  'Jeannettes',
  'Scouts',
  'Guides',
  'Pionniers-Caravelles',
] as const;

export type SGDFBranch = typeof SGDF_BRANCHES[number];