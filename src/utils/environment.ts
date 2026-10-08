export interface AppEnvironment {
  id: 'DEV' | 'SHARED';
  name: string;
  shortLabel: string;
  tagline: string;
  url: string;
  description: string;
  targetAudience: string;
  purpose: string;
  badgeStyle: {
    bg: string;
    border: string;
    text: string;
    dot: string;
  };
}

export const AI_STUDIO_DEV_URL = 'https://ais-dev-7264pk2quqrh5fvfgrjgfc-545804907308.us-east1.run.app';
export const AI_STUDIO_SHARED_URL = 'https://ais-pre-7264pk2quqrh5fvfgrjgfc-545804907308.us-east1.run.app';

export const ENVIRONMENTS: Record<'DEV' | 'SHARED', AppEnvironment> = {
  DEV: {
    id: 'DEV',
    name: 'Development Environment',
    shortLabel: 'DEV INSTANCE',
    tagline: 'Active Live Workspace',
    url: AI_STUDIO_DEV_URL,
    description: 'Continuous prompt-driven code iteration, component refinement, algorithmic scheduling tuning, and active code modifications.',
    targetAudience: 'Software Engineers, System Administrators & Technical Operations',
    purpose: 'Rapid prototyping and immediate live rebuilds without affecting external stakeholder testing.',
    badgeStyle: {
      bg: 'bg-[#1b253b]',
      border: 'border-[#38bdf8]/40',
      text: 'text-[#38bdf8]',
      dot: 'bg-[#38bdf8]'
    }
  },
  SHARED: {
    id: 'SHARED',
    name: 'Shared Clinical Testing Environment',
    shortLabel: 'CLINICAL PREVIEW',
    tagline: 'Protected Stakeholder Testbed',
    url: AI_STUDIO_SHARED_URL,
    description: 'Stable distribution instance intended for team review, physician schedule validation, absence approvals, and conflict drill testing.',
    targetAudience: 'Clinical Managers, Lead Radiologists, Section Chiefs & Scheduling Coordinators',
    purpose: 'User acceptance testing (UAT) insulated from in-flight developer prompts and ongoing code changes.',
    badgeStyle: {
      bg: 'bg-[#142e23]',
      border: 'border-[#34d399]/40',
      text: 'text-[#34d399]',
      dot: 'bg-[#34d399]'
    }
  }
};

export function detectEnvironment(): 'DEV' | 'SHARED' {
  if (typeof window === 'undefined') return 'DEV';

  // 1. Query parameter override (e.g. ?env=shared or ?env=dev)
  try {
    const params = new URLSearchParams(window.location.search);
    const paramEnv = params.get('env')?.toUpperCase();
    if (paramEnv === 'SHARED' || paramEnv === 'PRE') return 'SHARED';
    if (paramEnv === 'DEV') return 'DEV';
  } catch {
    // Ignore URL parse errors
  }

  // 2. Local storage simulation override
  try {
    const sim = localStorage.getItem('rad_simulated_env');
    if (sim === 'SHARED' || sim === 'DEV') return sim;
  } catch {
    // Ignore storage errors
  }

  // 3. Hostname inspection
  const host = window.location.hostname.toLowerCase();
  if (host.includes('ais-pre')) return 'SHARED';
  if (host.includes('ais-dev')) return 'DEV';

  return 'DEV';
}

export function setSimulatedEnvironment(env: 'DEV' | 'SHARED' | null): void {
  if (typeof window === 'undefined') return;
  if (env === null) {
    localStorage.removeItem('rad_simulated_env');
  } else {
    localStorage.setItem('rad_simulated_env', env);
  }
}
