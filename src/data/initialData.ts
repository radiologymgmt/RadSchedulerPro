import { 
  StaffUser, 
  ClinicalSite, 
  Workstation, 
  Shift, 
  LeaveRequest, 
  ComplianceRule, 
  NotificationRule, 
  NotificationTemplate,
  PtoAccrual,
  RisBacklogItem,
  RoleDefinition,
  ClinicalSpecialty,
  ShiftWindow,
  SystemSettings,
  AbsenceCategory,
  ShiftSwapRequest,
  ClinicianCredential,
  CustomStaffField,
  RotationTemplate,
  SmtpWebhookConfig
} from '../types';

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'CHIEF',
    name: 'Department Chief / Medical Director',
    category: 'LEADERSHIP',
    badgeColor: '#f59e0b',
    description: 'Clinical physician leader with executive decision-making, staff governance, and clinical interpreting authority.',
    permissions: {
      canAccessAdminCenter: true,
      canManageUsers: true,
      canPublishSchedule: true,
      canApproveLeave: true,
      canSuperviseContrast: true,
      canPerformProcedures: true,
      canOverrideCompliance: true,
      canEditWorkstations: true,
      canManageSites: true,
      canConfigureSystem: true
    }
  },
  {
    id: 'ADMIN',
    name: 'Systems & Operations Administrator',
    category: 'OPERATIONS',
    badgeColor: '#8eb9dd',
    description: 'Technical, operations, and IT administration. Manages platform setup, data backups, and user credentials.',
    permissions: {
      canAccessAdminCenter: true,
      canManageUsers: true,
      canPublishSchedule: true,
      canApproveLeave: true,
      canSuperviseContrast: false,
      canPerformProcedures: false,
      canOverrideCompliance: true,
      canEditWorkstations: true,
      canManageSites: true,
      canConfigureSystem: true
    }
  },
  {
    id: 'MANAGER',
    name: 'Clinical Scheduling Coordinator',
    category: 'OPERATIONS',
    badgeColor: '#a855f7',
    description: 'Administrative scheduler overseeing daily shift coverage, leave approvals, and roster balance.',
    permissions: {
      canAccessAdminCenter: true,
      canManageUsers: false,
      canPublishSchedule: true,
      canApproveLeave: true,
      canSuperviseContrast: false,
      canPerformProcedures: false,
      canOverrideCompliance: true,
      canEditWorkstations: true,
      canManageSites: false,
      canConfigureSystem: false
    }
  },
  {
    id: 'ATTENDING_RAD',
    name: 'Staff Attending Radiologist (MD/DO)',
    category: 'CLINICAL',
    badgeColor: '#38bdf8',
    description: 'Board-certified interpreting physician responsible for final diagnostic reports and contrast supervision.',
    permissions: {
      canAccessAdminCenter: false,
      canManageUsers: false,
      canPublishSchedule: false,
      canApproveLeave: false,
      canSuperviseContrast: true,
      canPerformProcedures: true,
      canOverrideCompliance: false,
      canEditWorkstations: false,
      canManageSites: false,
      canConfigureSystem: false
    }
  },
  {
    id: 'ADVANCED_PRACTITIONER',
    name: 'Advanced Practitioner (RPA / NP)',
    category: 'CLINICAL',
    badgeColor: '#34d399',
    description: 'Credentialed Registered Radiologist Assistant or Nurse Practitioner performing procedures and preliminary reviews.',
    permissions: {
      canAccessAdminCenter: false,
      canManageUsers: false,
      canPublishSchedule: false,
      canApproveLeave: false,
      canSuperviseContrast: true,
      canPerformProcedures: true,
      canOverrideCompliance: false,
      canEditWorkstations: false,
      canManageSites: false,
      canConfigureSystem: false
    }
  },
  {
    id: 'FELLOW_RESIDENT',
    name: 'Clinical Fellow / Resident',
    category: 'TRAINEE',
    badgeColor: '#fb7185',
    description: 'Post-graduate trainee physician interpreting studies under direct or indirect attending supervision.',
    permissions: {
      canAccessAdminCenter: false,
      canManageUsers: false,
      canPublishSchedule: false,
      canApproveLeave: false,
      canSuperviseContrast: false,
      canPerformProcedures: false,
      canOverrideCompliance: false,
      canEditWorkstations: false,
      canManageSites: false,
      canConfigureSystem: false
    }
  }
];

export const DEFAULT_SPECIALTIES: ClinicalSpecialty[] = [
  { id: 'Body', name: 'Body', code: 'BDY', color: '#38bdf8', description: 'Abdominal, pelvic & cross-sectional CT/MRI', rvuWeight: 1.2 },
  { id: 'Neuro', name: 'Neuro', code: 'NR', color: '#a855f7', description: 'Brain, spine, head & neck MRI/CT', rvuWeight: 1.4 },
  { id: 'MSK', name: 'MSK', code: 'MSK', color: '#34d399', description: 'Musculoskeletal MRI, CT & sports injury', rvuWeight: 1.1 },
  { id: 'Breast', name: 'Breast', code: 'BRS', color: '#ec4899', description: 'Mammography, 3D tomosynthesis & ultrasound', rvuWeight: 1.3 },
  { id: 'Breast MRI', name: 'Breast MRI', code: 'BMRI', color: '#f43f5e', description: 'High-risk screening breast MRI & biopsies', rvuWeight: 1.6 },
  { id: 'Interventional', name: 'Interventional', code: 'IR', color: '#f97316', description: 'Vascular & non-vascular image-guided procedures', rvuWeight: 1.8 },
  { id: 'PET', name: 'PET', code: 'PET', color: '#eab308', description: 'PET/CT oncology & nuclear medicine', rvuWeight: 1.5 }
];

export const DEFAULT_SHIFT_WINDOWS: ShiftWindow[] = [
  { id: 'day-early', label: 'Day Shift (07:30 - 16:00)', hours: '07:30 - 16:00', category: 'DAY', rvuEstimate: 50 },
  { id: 'day-standard', label: 'Standard Day (08:00 - 17:00)', hours: '08:00 - 17:00', category: 'DAY', rvuEstimate: 55 },
  { id: 'day-mid', label: 'Mid Day (08:30 - 17:00)', hours: '08:30 - 17:00', category: 'MID', rvuEstimate: 52 },
  { id: 'swing', label: 'Evening Swing (12:00 - 21:00)', hours: '12:00 - 21:00', category: 'SWING', rvuEstimate: 60 },
  { id: 'night', label: 'Night Call (16:00 - 23:00)', hours: '16:00 - 23:00', category: 'NIGHT', rvuEstimate: 65, isUndesirableSlot: true },
  { id: 'sat-morning', label: 'Saturday Outpatient Clinic (08:00 - 13:00)', hours: '08:00 - 13:00', category: 'WEEKEND', rvuEstimate: 35, isUndesirableSlot: true },
  { id: 'flex', label: 'Flexible / Unscheduled Pool', hours: 'Flexible Pool', category: 'FLEX', rvuEstimate: 40 },
  { id: 'dark', label: 'Site Dark / No Coverage', hours: 'Site Dark / No Coverage', category: 'DAY', rvuEstimate: 0 }
];

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  practiceName: 'RadScheduler Pro — Outpatient Radiology Associates',
  departmentChief: 'Dr. Gregory Vance, MD, FACR',
  adminContactEmail: 'radiologymgmt@gmail.com',
  defaultTheme: 'light',
  timezone: 'America/New_York',
  strictComplianceMode: false,
  fatigueLimitDays: 5,
  requireContrastSupervision: true,
  requireMqsaForMammo: true,
  requireApSupervision: true,
  defaultAnnualPto: 30,
  defaultAnnualCme: 10,
  maxConcurrentLeave: 2
};

export const INITIAL_MODALITIES: string[] = [
  'Cross-Sectional CT & MRI',
  'Neuro MRI & Neuro CT',
  'PET/CT Oncology & Theranostics',
  'Mammography & 3D Tomosynthesis',
  'Breast MRI & Stereotactic Biopsy',
  'MSK MRI, Extremity CT & Plain Film',
  'Fluoroscopy & Arthrography (AP/Rad)',
  'Minor Procedures & Lumbar Puncture (AP/Rad)',
  'Emergency & Inpatient Stat Reads',
  'Diagnostic Ultrasound & Vascular'
];

export const INITIAL_MONITOR_PROFILES: string[] = [
  'Dual Barco Coronis 5MP Mammo (FDA Certified)',
  'Dual Barco Nio 3MP Diagnostic Color',
  'Dual EIZO RadiForce 6MP Multi-Modality',
  'Home Rig: Dual 4K FDA-Cleared Medical Displays',
  'Single Clinical Review Display 2MP'
];

export const INITIAL_USERS: StaffUser[] = [
  {
    id: 'CHIEF-001',
    name: 'Dr. Gregory Vance, MD, FACR',
    title: 'MD, FACR',
    role: 'CHIEF',
    specialties: ['Body', 'Neuro'],
    primarySite: 'MAIN',
    email: 'chief.radiology@hospital.org',
    certContrast: true,
    isMqsaQualified: true,
    isArchived: false,
    fte: 1.0,
    dailyRvuTarget: 60,
    allocatedAnnualPto: 30,
    allocatedAnnualCme: 10
  },
  {
    id: 'ADMIN-001',
    name: 'Radiology Operations Administrator',
    title: 'MHA',
    role: 'ADMIN',
    specialties: ['Body'],
    primarySite: 'MAIN',
    email: 'radiologymgmt@gmail.com',
    certContrast: false,
    isArchived: false,
    fte: 1.0,
    allocatedAnnualPto: 25,
    allocatedAnnualCme: 5
  }
];

export const INITIAL_SITES: Record<string, ClinicalSite> = {
  MAIN: {
    id: 'MAIN',
    name: 'Main Clinical Imaging Center',
    label: 'MAIN',
    slots: 4,
    openWeekends: false,
    requiresContrast: true,
    modalities: [
      'Cross-Sectional CT & MRI',
      'Mammography & 3D Tomosynthesis',
      'Emergency & Inpatient Stat Reads',
      'Diagnostic Ultrasound & Vascular'
    ]
  }
};

export const INITIAL_WORKSTATIONS: Workstation[] = [
  {
    id: 'WS-MAIN-01',
    site: 'MAIN',
    room: 'Primary Diagnostic Reading Pod 1',
    monitorType: 'Dual Barco Nio 3MP Diagnostic Color',
    isHome: false,
    currentRadId: null
  }
];

export const INITIAL_SHIFTS: Shift[] = [];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_RULES: ComplianceRule[] = [
  {
    id: 'rule-supervision-main',
    name: 'Main Facility On-Site Contrast Supervision',
    type: 'SITE_SUPERVISION',
    target: 'MAIN',
    minCount: 1,
    days: 'WEEKDAYS'
  }
];

export const INITIAL_ROUTING_RULES: NotificationRule[] = [
  {
    id: 'route-prod-1',
    name: 'Critical Staffing Shortfall Alert',
    trigger: 'SHORTFALL_FLAGGED',
    site: 'ALL',
    recipients: 'radiologymgmt@gmail.com',
    enabled: true
  },
  {
    id: 'route-prod-2',
    name: 'Designated Contrast Supervisor Notification',
    trigger: 'CONTRAST_ASSIGNED',
    site: 'ALL',
    recipients: 'assigned_rad, radiologymgmt@gmail.com',
    enabled: true
  }
];

export const INITIAL_NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  DAILY_SCHEDULE: {
    subject: 'Daily Reading & Procedure Assignment: {DoctorName} - {Date}',
    body: `Dear {DoctorName},\n\nYou are scheduled for clinical reading and procedural duties on {Date}.\nClinical Facility: {Site}\nDiagnostic Workstation / Pod: {Workstation}\nModality Worklist: {Modality}\nAssigned Shift Window: {Hours}\nRole / Specialty: {Specialty}\n\nClinical Administration & Operations Team`
  },
  CONTRAST_SUPERVISOR: {
    subject: 'URGENT: Designated On-Site IV Contrast Supervisor - {Site} ({Date})',
    body: `{DoctorName},\n\nYou have been designated as the physical On-Site IV Contrast Supervising Radiologist for {Site} on {Date}.\nShift Window: {Hours}\nSupervision Workstation: {Workstation}\n\nPer American College of Radiology (ACR) guidelines, a credentialed physician or approved RPA supervisor must be physically present and immediately available for acute adverse reaction management throughout this shift window.\n\nChief Radiologist & Patient Safety Committee`
  },
  SHORTFALL_ALERT: {
    subject: 'CRITICAL STAFFING SHORTFALL: {Site} / {Specialty} ({Date})',
    body: `ATTENTION: A clinical coverage shortfall has been detected.\n\nDate: {Date}\nTarget Location: {Site}\nTarget Subspecialty: {Specialty}\nDetails: {Details}\n\nPlease access the Admin Command Portal immediately to arrange coverage.`
  },
  AP_PROCEDURE_NOTICE: {
    subject: 'AP Procedural Schedule & Supervising Radiologist: {Date}',
    body: `Advanced Practitioner: {DoctorName}\nSupervising Attending MD: {SupervisingMD}\nFacility: {Site} - {Workstation}\nScheduled Procedures: {Details}\nHours: {Hours}\n\nIndirect/direct supervision agreement active.`
  },
  LEAVE_APPROVED: {
    subject: 'Academic Leave / Clinical PTO Approved: {Date}',
    body: `Dear {DoctorName},\n\nYour absence request for {Date} has been APPROVED.\nCategory: {Specialty}\nDesignated Backup: {Details}\n\nDepartment Operations`
  }
};

export const INITIAL_ACCRUALS: Record<string, PtoAccrual> = {
  'CHIEF-001': { annualPto: 30, cmeDays: 10, maxConsecutive: 14, usedPto: 2, usedCme: 0 },
  'ADMIN-001': { annualPto: 25, cmeDays: 5, maxConsecutive: 10, usedPto: 0, usedCme: 0 }
};

export const DEFAULT_ABSENCE_CATEGORIES: AbsenceCategory[] = [
  { id: 'cat-pto', name: 'Clinical PTO (Vacation)', isPaid: true, color: '#38bdf8', requiresCoveringColleague: true },
  { id: 'cat-cme', name: 'CME Training Course', isPaid: true, color: '#a855f7', requiresCoveringColleague: true },
  { id: 'cat-rsna', name: 'Academic Conference / RSNA', isPaid: true, color: '#f59e0b', requiresCoveringColleague: true },
  { id: 'cat-research', name: 'Academic Research Day', isPaid: true, color: '#34d399', requiresCoveringColleague: false },
  { id: 'cat-fellowship', name: 'Fellowship Lecturing', isPaid: true, color: '#ec4899', requiresCoveringColleague: false },
  { id: 'cat-personal', name: 'Personal / Family Medical Leave', isPaid: false, color: '#fb7185', requiresCoveringColleague: false },
  { id: 'cat-sick', name: 'Medical / Sick Leave', isPaid: true, color: '#f43f5e', requiresCoveringColleague: false }
];

export const INITIAL_RIS_BACKLOGS: RisBacklogItem[] = [];

export const DEFAULT_SHIFT_SWAPS: ShiftSwapRequest[] = [
  {
    id: 'swap-001',
    sourceShiftId: 'shift-3',
    requestingRadId: 'RAD-002',
    date: '2026-10-02',
    hours: '08:00 - 17:00',
    modality: 'MSK',
    site: 'EAST',
    desiredTradeDate: '2026-10-09',
    notes: 'Looking to swap Friday MSK interpretation for following Friday or float coverage.',
    status: 'OPEN',
    createdAt: '2026-10-01T14:30:00Z'
  },
  {
    id: 'swap-002',
    sourceShiftId: 'shift-4',
    requestingRadId: 'RAD-003',
    date: '2026-10-03',
    hours: '07:30 - 16:00',
    modality: 'PET',
    site: 'MAIN',
    desiredTradeDate: '2026-10-10',
    notes: 'PET-CT Saturday shift swap available. Will take any weekday swing shift.',
    status: 'OPEN',
    createdAt: '2026-10-02T09:15:00Z'
  }
];

export const DEFAULT_CREDENTIALS: ClinicianCredential[] = [
  {
    id: 'cred-1',
    radId: 'CHIEF-001',
    title: 'State Medical License (Full MD)',
    identifier: 'MD-948201',
    expirationDate: '2027-06-30',
    status: 'ACTIVE'
  },
  {
    id: 'cred-2',
    radId: 'CHIEF-001',
    title: 'ACR IV Contrast Supervisor Credential',
    identifier: 'ACR-CS-8812',
    expirationDate: '2026-10-25',
    status: 'EXPIRING_SOON'
  },
  {
    id: 'cred-3',
    radId: 'RAD-001',
    title: 'MQSA Mammography Interpreting Physician',
    identifier: 'MQSA-CERT-4491',
    expirationDate: '2026-11-15',
    status: 'EXPIRING_SOON',
    caseCount: 975,
    requiredCases: 960
  },
  {
    id: 'cred-4',
    radId: 'RAD-002',
    title: 'DEA Controlled Substance Registration',
    identifier: 'DEA-FC8829104',
    expirationDate: '2027-04-12',
    status: 'ACTIVE'
  },
  {
    id: 'cred-5',
    radId: 'AP-001',
    title: 'AAPA / Fluoroscopy Operator Permit',
    identifier: 'AP-FLUORO-2091',
    expirationDate: '2026-10-18',
    status: 'EXPIRING_SOON'
  }
];

export const DEFAULT_CUSTOM_STAFF_FIELDS: CustomStaffField[] = [
  { id: 'fld-npi', key: 'npiNumber', label: 'NPI Number', type: 'text', required: true },
  { id: 'fld-pager', key: 'pagerExtension', label: 'Hospital Pager Ext', type: 'text' },
  { id: 'fld-tier', key: 'seniorityTier', label: 'Seniority Priority Tier', type: 'number' },
  { id: 'fld-pod', key: 'preferredReadingPod', label: 'Preferred Reading Pod', type: 'text' }
];

export const DEFAULT_ROTATION_TEMPLATES: RotationTemplate[] = [
  {
    id: 'rot-4week-neuro-body',
    name: '4-Week Academic Inpatient / Outpatient Rotation',
    cycleWeeks: 4,
    description: 'Alternates clinical inpatient neuro CT, outpatient cross-sectional MRI, procedure coverage, and administrative research time.',
    pattern: [
      { week: 1, dayOfWeek: 1, modality: 'Neuro', site: 'MAIN', hours: '07:30 - 16:00' },
      { week: 1, dayOfWeek: 2, modality: 'Neuro', site: 'MAIN', hours: '07:30 - 16:00' },
      { week: 1, dayOfWeek: 3, modality: 'Neuro', site: 'MAIN', hours: '07:30 - 16:00' },
      { week: 1, dayOfWeek: 4, modality: 'Neuro', site: 'MAIN', hours: '07:30 - 16:00' },
      { week: 1, dayOfWeek: 5, modality: 'Neuro', site: 'MAIN', hours: '07:30 - 16:00' },
      { week: 2, dayOfWeek: 1, modality: 'Body', site: 'EAST', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 2, modality: 'Body', site: 'EAST', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 3, modality: 'Body', site: 'EAST', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 4, modality: 'Body', site: 'EAST', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 5, modality: 'Body', site: 'EAST', hours: '08:00 - 17:00' },
      { week: 3, dayOfWeek: 1, modality: 'Interventional', site: 'MAIN', hours: '08:00 - 16:30' },
      { week: 3, dayOfWeek: 2, modality: 'Interventional', site: 'MAIN', hours: '08:00 - 16:30' },
      { week: 3, dayOfWeek: 3, modality: 'Interventional', site: 'MAIN', hours: '08:00 - 16:30' },
      { week: 3, dayOfWeek: 4, modality: 'Interventional', site: 'MAIN', hours: '08:00 - 16:30' },
      { week: 3, dayOfWeek: 5, modality: 'Interventional', site: 'MAIN', hours: '08:00 - 16:30' },
      { week: 4, dayOfWeek: 1, modality: 'PET', site: 'WEST', hours: '08:30 - 17:00' },
      { week: 4, dayOfWeek: 2, modality: 'PET', site: 'WEST', hours: '08:30 - 17:00' },
      { week: 4, dayOfWeek: 3, modality: 'PET', site: 'WEST', hours: '08:30 - 17:00' },
      { week: 4, dayOfWeek: 4, modality: 'PET', site: 'WEST', hours: '08:30 - 17:00' },
      { week: 4, dayOfWeek: 5, modality: 'PET', site: 'WEST', hours: '08:30 - 17:00' }
    ]
  },
  {
    id: 'rot-2week-weekend-call',
    name: '2-Week Call & Float Rotation',
    cycleWeeks: 2,
    description: 'Bi-weekly coverage rotation with weekend diagnostic float and post-call recovery interval.',
    pattern: [
      { week: 1, dayOfWeek: 6, modality: 'Body', site: 'MAIN', hours: '08:00 - 18:00' },
      { week: 1, dayOfWeek: 0, modality: 'Body', site: 'MAIN', hours: '08:00 - 18:00' },
      { week: 2, dayOfWeek: 2, modality: 'Neuro', site: 'MAIN', hours: '12:00 - 21:00' },
      { week: 2, dayOfWeek: 3, modality: 'Neuro', site: 'MAIN', hours: '12:00 - 21:00' }
    ]
  }
];

export const DEFAULT_SMTP_WEBHOOK_CONFIG: SmtpWebhookConfig = {
  smtpHost: 'smtp.hospitalrelay.org',
  smtpPort: 587,
  smtpUser: 'radscheduler-service@hospital.org',
  smtpSecure: true,
  fromEmail: 'radiology-scheduling@hospital.org',
  slackWebhookUrl: 'https://hooks.slack.com/services/REPLACE_ME',
  teamsWebhookUrl: 'https://hospital.webhook.office.com/webhookb2/XXXXXXXX/IncomingWebhook/XXXXX',
  pagerDutyKey: 'pd-clinical-ops-alert-key-49102',
  notifyOnLeaveApproval: true,
  notifyOnShiftSwap: true,
  notifyOnSchedulePublish: true,
  notifyOnContrastSupervisorChange: true
};
