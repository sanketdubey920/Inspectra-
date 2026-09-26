import { User } from '../types';

/**
 * Resolves the appropriate dashboard/workspace destination based on user role and context
 * - Beneficiary / Citizen -> /feedback (Beneficiary Portal & Grievance Dashboard)
 * - PMU Field Inspector   -> /inspector/inspections (Inspector Mobile Workspace)
 * - Supported Institution -> /institutes/:id or /institute/attendance (Institution Portal)
 * - Department Official   -> /dashboard (Government Executive Oversight Dashboard)
 */
export const getDashboardRoute = (user: User | null, currentPath?: string): string => {
  if (!user) {
    if (currentPath?.startsWith('/feedback')) return '/feedback';
    if (currentPath?.startsWith('/institutes')) return '/institutes';
    if (currentPath?.startsWith('/inspector')) return '/inspector/inspections';
    if (currentPath?.startsWith('/institute')) return '/institute/attendance';
    return '/dashboard';
  }

  switch (user.role) {
    case 'beneficiary':
      return '/feedback';
    case 'inspection_officer':
      return '/inspector/inspections';
    case 'institute_representative':
      return user.institute_id ? `/institutes/${user.institute_id}` : '/institute/attendance';
    case 'department_official':
    default:
      return '/dashboard';
  }
};

/**
 * Returns localized label for the dashboard navigation button
 */
export const getDashboardLabel = (user: User | null, language: 'en' | 'hi' = 'en'): string => {
  if (!user) {
    return language === 'hi' ? 'डैशबोर्ड' : 'Dashboard';
  }

  switch (user.role) {
    case 'beneficiary':
      return language === 'hi' ? 'लाभार्थी डैशबोर्ड' : 'Beneficiary Dashboard';
    case 'inspection_officer':
      return language === 'hi' ? 'निरीक्षक डैशबोर्ड' : 'Inspector Dashboard';
    case 'institute_representative':
      return language === 'hi' ? 'संस्थान डैशबोर्ड' : 'Institute Dashboard';
    case 'department_official':
    default:
      return language === 'hi' ? 'विभागीय डैशबोर्ड' : 'Government Dashboard';
  }
};
