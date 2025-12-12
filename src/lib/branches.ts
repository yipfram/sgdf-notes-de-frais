// Central branch definitions & colors
// Colors provided by user request
export const BRANCH_COLORS: Record<string, string> = {
  // 'Pionniers-Caravelles': '#E30613',
  'Scouts': '#0072CE',
  'Guides': '#0072CE',
  'Louveteaux': '#F28C00',
  'Jeannettes': '#F28C00',
  'Compagnons': '#00A19A',
  'Farfadets': '#6CC24A',
  'Groupe': '#1E3A8A',
  'Piok Saône': '#EB1B2A',
  'Piok Rhône': '#D20510'
}

// Ordered list for UI (follows form ordering pattern)
export const BRANCHES_BY_AGE = [
  'Farfadets',
  'Louveteaux',
  'Jeannettes',
  'Scouts',
  'Guides',
  'Piok Saône',
  'Piok Rhône',
  'Compagnons',
  'Groupe',
] as const

export const ALL_BRANCHES = Object.keys(BRANCH_COLORS)

export function getBranchColor(branch: string, fallback = '#1E3A8A') {
  return BRANCH_COLORS[branch] || fallback
}