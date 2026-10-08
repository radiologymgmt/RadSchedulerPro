import { Specialty, UserRole } from '../types';

export function formatPersonName(name: string, role?: UserRole, title?: string): string {
  if (!name) return 'Provider';
  if (name === 'NO_RAD_NEEDED') return 'No Radiologist Needed';

  // If already prefixed with Dr.
  const cleanName = name.replace(/^Dr\.\s+/i, '').replace(/,\s*(MD|DO|MBBS|PhD|FACR|RPA-C|RRA|NP).*$/i, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);

  if (role === 'CHIEF') {
    const lastName = parts[parts.length - 1] || cleanName;
    return `Dr. ${lastName}${title ? `, ${title}` : ', MD (Chief of Radiology)'}`;
  }

  if (role === 'ATTENDING_RAD') {
    const lastName = parts[parts.length - 1] || cleanName;
    return `Dr. ${lastName}${title ? `, ${title}` : ', MD'}`;
  }

  if (role === 'ADVANCED_PRACTITIONER') {
    return `${cleanName}${title ? `, ${title}` : ', RPA-C'}`;
  }

  if (role === 'ADMIN') {
    return `${cleanName}${title ? `, ${title}` : ' (Admin)'}`;
  }

  return `${cleanName}${title ? `, ${title}` : ''}`;
}

export function parseISODate(isoStr: string): Date {
  if (!isoStr) return new Date();
  const parts = isoStr.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

export function formatISODate(d: Date): string {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysISO(isoStr: string, numDays: number): string {
  const d = parseISODate(isoStr);
  d.setDate(d.getDate() + numDays);
  return formatISODate(d);
}

export function getMondayISO(isoStr: string): string {
  const d = parseISODate(isoStr);
  const dow = d.getDay();
  const diff = d.getDate() - dow + (dow === 0 ? -6 : 1);
  d.setDate(diff);
  return formatISODate(d);
}

export function formatDateWithDay(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseISODate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

export function formatMonthYear(monthStr: string): string {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  const y = parts[0];
  const m = parseInt(parts[1], 10) - 1;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[m]} ${y}`;
}

export function getSpecialtyColor(spec: Specialty): {
  bg: string;
  text: string;
  border: string;
  indicator: string;
} {
  switch (spec) {
    case 'Neuro':
      return { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200', indicator: '#7c3aed' };
    case 'Body':
      return { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', indicator: '#0284c7' };
    case 'MSK':
      return { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', indicator: '#d97706' };
    case 'PET':
      return { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', indicator: '#dc2626' };
    case 'Breast':
      return { bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-200', indicator: '#0d9488' };
    case 'Breast MRI':
      return { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', indicator: '#4f46e5' };
    case 'Interventional':
      return { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', indicator: '#059669' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', indicator: '#8eb9dd' };
  }
}
