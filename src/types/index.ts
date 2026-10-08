export type UserRole = 
  | 'CHIEF' 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'ATTENDING_RAD' 
  | 'ADVANCED_PRACTITIONER' 
  | 'FELLOW_RESIDENT';

export type Specialty = 
  | 'Body' 
  | 'Neuro' 
  | 'MSK' 
  | 'PET' 
  | 'Breast' 
  | 'Breast MRI' 
  | 'Interventional'
  | string;

export interface RoleDefinition {
  id: string;
  name: string;
  category: 'LEADERSHIP' | 'CLINICAL' | 'OPERATIONS' | 'TRAINEE';
  badgeColor: string;
  description: string;
  permissions: {
    canAccessAdminCenter: boolean;
    canManageUsers: boolean;
    canPublishSchedule: boolean;
    canApproveLeave: boolean;
    canSuperviseContrast: boolean;
    canPerformProcedures: boolean;
    canOverrideCompliance: boolean;
    canEditWorkstations: boolean;
    canManageSites: boolean;
    canConfigureSystem: boolean;
  };
}

export interface ClinicalSpecialty {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  rvuWeight: number;
}

export interface ShiftWindow {
  id: string;
  label: string;
  hours: string;
  category: 'DAY' | 'MID' | 'SWING' | 'NIGHT' | 'WEEKEND' | 'FLEX';
  rvuEstimate: number;
  isUndesirableSlot?: boolean;
}

export interface SystemSettings {
  practiceName: string;
  departmentChief: string;
  adminContactEmail: string;
  defaultTheme: 'light' | 'dark';
  timezone: string;
  strictComplianceMode: boolean;
  fatigueLimitDays: number;
  requireContrastSupervision: boolean;
  requireMqsaForMammo: boolean;
  requireApSupervision: boolean;
  defaultAnnualPto: number;
  defaultAnnualCme: number;
  maxConcurrentLeave: number;
}

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  title: string; // e.g. "MD, FACR", "RPA-C", "RRA, RT(R)", "MS, NP", "CRA"
  specialties: Specialty[];
  primarySite: string;
  assignedSites?: string[];       // Multi-site coverage assignments
  homePc?: string;
  email: string;
  phone?: string;
  certContrast: boolean;
  isMqsaQualified?: boolean;      // Required for Mammography / Women's Imaging reads
  canPerformProcedures?: boolean; // For RPAs: Fluoro, Arthrograms, Paracentesis, etc.
  canDoPrelimReads?: boolean;     // For RPAs: Preliminary diagnostic triage
  apLicenseNumber?: string;
  fte?: number;                   // Full Time Equivalent (e.g. 1.0, 0.8, 0.5)
  dailyRvuTarget?: number;        // Outpatient daily RVU expectation (e.g. 55 RVU)
  allocatedAnnualPto?: number;    // Custom allocated PTO days per staff member
  allocatedAnnualCme?: number;    // Custom allocated CME days per staff member
  customFields?: Record<string, any>; // Dynamic administrator-defined custom attributes
  isArchived: boolean;
}

export interface ShiftSwapRequest {
  id: string;
  sourceShiftId: string;
  requestingRadId: string;
  targetRadId?: string; // specific colleague or empty for open pool
  date: string;
  hours: string;
  modality: string;
  site: string;
  desiredTradeDate?: string;
  notes?: string;
  status: 'OPEN' | 'PROPOSED' | 'COMPLETED' | 'CANCELLED' | 'CLAIMED';
  offeredShiftId?: string;
  offeredRadId?: string;
  claimingRadId?: string;
  claimedAt?: string;
  createdAt: string;
}

export interface ClinicianCredential {
  id: string;
  radId: string;
  title: string;
  identifier: string;
  expirationDate: string; // YYYY-MM-DD
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  caseCount?: number;
  requiredCases?: number;
}

export interface CustomStaffField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required?: boolean;
}

export interface RotationTemplate {
  id: string;
  name: string;
  cycleWeeks: number;
  description: string;
  pattern: {
    week: number; // 1-indexed
    dayOfWeek: number; // 1=Mon, 2=Tue...
    modality: string;
    site: string;
    hours: string;
  }[];
}

export interface SmtpWebhookConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSecure: boolean;
  fromEmail: string;
  slackWebhookUrl: string;
  teamsWebhookUrl: string;
  pagerDutyKey: string;
  notifyOnLeaveApproval: boolean;
  notifyOnShiftSwap: boolean;
  notifyOnSchedulePublish: boolean;
  notifyOnContrastSupervisorChange: boolean;
}

export interface AbsenceCategory {
  id: string;
  name: string;
  isPaid: boolean;
  color?: string;
  requiresCoveringColleague?: boolean;
}

export interface ClinicalSite {
  id: string;
  label: string;
  name: string;
  slots: number;
  openWeekends: boolean;
  requiresContrast: boolean;
  modalities: string[];
  address?: string;
  phone?: string;
}

export interface Workstation {
  id: string;
  site: string;
  room: string;
  monitorType: string;
  isHome: boolean;
  currentRadId: string | null;
}

export interface Shift {
  id: string;
  radId: string; // userId or 'NO_RAD_NEEDED'
  specialty: Specialty;
  modality: string;
  site: string;
  workstationId?: string;
  hours: string; // e.g. "07:30 - 16:00", "08:00 - 17:00"
  date: string;  // YYYY-MM-DD
  isSupervisor?: boolean; // Designated on-site contrast supervisor
  isSplit?: boolean;
  splitSite?: string;
  splitDetails?: string;
  supervisingRadId?: string; // Required when an RPA is performing contrast/procedures
  procedureType?: string;    // e.g. "Fluoroscopy & Joint Injections"
  notes?: string;
  rvuEstimate?: number;      // Projected RVU yield for outpatient session
  isUndesirableSlot?: boolean; // Saturday morning clinic (08:00-13:00) or Friday late close
  isFatigueWaived?: boolean; // Radiologist or admin explicitly waived 5-day consecutive limit
}

export interface LeaveRequest {
  id: string;
  radId: string;
  category: string;
  startDate: string;
  endDate: string;
  dayCount: number; // In Days: 0.5, 1.0, 2.0, etc.
  durationType: 'FULL_DAY' | 'HALF_DAY_AM' | 'HALF_DAY_PM' | 'MULTI_DAY';
  backupDoc: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  managerNotificationEmail?: string;
  emailSent?: boolean;
}

export interface ComplianceRule {
  id: string;
  name: string;
  type: 'SITE_SUPERVISION' | 'SPECIALTY_QUOTA' | 'AP_SUPERVISION';
  target: string; // site code or specialty name
  minCount: number;
  days: 'WEEKDAYS' | 'WEEKENDS' | 'EVERYDAY';
}

export type ConflictType = 
  | 'DOUBLE_BOOKING'
  | 'WORKSTATION_COLLISION'
  | 'MISSING_CONTRAST_SUPERVISOR'
  | 'LEAVE_OVERLAP'
  | 'SPECIALTY_QUOTA_DEFICIT'
  | 'AP_UNSUPERVISED'
  | 'OPERATING_HOURS_VIOLATION'
  | 'MQSA_MAMMOGRAPHY_VIOLATION'
  | 'FATIGUE_OVERLOAD';

export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  severity: 'CRITICAL' | 'WARNING';
  date: string;
  site?: string;
  radId?: string;
  message: string;
  details?: string;
  suggestedAction?: string;
  shiftId?: string;
}

// ==========================================
// OUTPATIENT OPERATIONS ENGINE CONTRACTS
// ==========================================

export interface ProjectedOrderVolume {
  site: string;
  modality: string;
  projectedOrders: number;
  estimatedRvu: number;
  recommendedFte: number;
}

export interface ShiftSwapTrade {
  id: string;
  requestingRadId: string;
  requestingShiftId: string;
  targetRadId: string;
  targetShiftId: string;
  status: 'PROPOSED' | 'VALIDATED_OK' | 'VIOLATION' | 'EXECUTED' | 'REJECTED';
  reason?: string;
  createdAt: string;
  violations?: string[];
  warnings?: string[];
}

export interface ParsedTimeOffDoc {
  id: string;
  rawText: string;
  detectedProvider: string;
  matchedRadId?: string;
  category: 'Clinical PTO' | 'Academic Conference / RSNA' | 'CME Training' | 'Academic Research Day' | 'Fellowship Lecturing';
  startDate: string;
  endDate: string;
  backupColleague?: string;
  confidenceScore: number;
  status: 'PARSED' | 'APPLIED';
}

export interface RisBacklogItem {
  id: string;
  site: string;
  modality: string;
  unassignedOrders: number;
  oldestOrderAgeHours: number;
  statOrders: number;
  targetTatHours: number;
  status: 'STABLE' | 'NEARING_BREACH' | 'BREACHED';
  recommendedShiftType: 'REMOTE_TRIAGE' | 'PHYSICAL_ADD' | 'CROSS_COVERAGE';
  recommendedSubspecialty: Specialty;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  actionType: string;
  details: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  trigger: 'CONTRAST_ASSIGNED' | 'SHORTFALL_FLAGGED' | 'SHIFT_ASSIGNED' | 'LEAVE_DECISION' | 'AP_SCHEDULED';
  site: string;
  recipients: string;
  enabled: boolean;
}

export interface NotificationTemplate {
  subject: string;
  body: string;
}

export interface PtoAccrual {
  annualPto: number;
  cmeDays: number;
  maxConsecutive: number;
  usedPto: number;
  usedCme: number;
}
