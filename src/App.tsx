import React, { useState, useEffect, useMemo } from 'react';
import { 
  StaffUser, 
  ClinicalSite, 
  Workstation, 
  Shift, 
  LeaveRequest, 
  ComplianceRule, 
  NotificationRule, 
  NotificationTemplate, 
  AuditLog, 
  PtoAccrual,
  ScheduleConflict,
  Specialty,
  UserRole,
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
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_SITES, 
  INITIAL_WORKSTATIONS, 
  INITIAL_SHIFTS, 
  INITIAL_LEAVES, 
  INITIAL_RULES, 
  INITIAL_ROUTING_RULES, 
  INITIAL_NOTIFICATION_TEMPLATES, 
  INITIAL_ACCRUALS,
  INITIAL_MODALITIES,
  INITIAL_MONITOR_PROFILES,
  INITIAL_RIS_BACKLOGS,
  DEFAULT_ROLES,
  DEFAULT_SPECIALTIES,
  DEFAULT_SHIFT_WINDOWS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_ABSENCE_CATEGORIES,
  DEFAULT_SHIFT_SWAPS,
  DEFAULT_CREDENTIALS,
  DEFAULT_CUSTOM_STAFF_FIELDS,
  DEFAULT_ROTATION_TEMPLATES,
  DEFAULT_SMTP_WEBHOOK_CONFIG
} from './data/initialData';
import { detectAllConflicts } from './utils/conflictDetector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ScheduleView } from './components/ScheduleView';
import { SpecialtyMatrixView } from './components/SpecialtyMatrixView';
import { AnalyticsView } from './components/AnalyticsView';
import { LeavePortalView } from './components/LeavePortalView';
import { AdminCenterView } from './components/AdminCenterView';
import { OutpatientOpsView } from './components/OutpatientOpsView';
import { ConflictDrawer } from './components/ConflictDrawer';
import { ShiftModal } from './components/modals/ShiftModal';
import { ContrastSupervisorModal } from './components/modals/ContrastSupervisorModal';
import { LeaveRequestModal } from './components/modals/LeaveRequestModal';
import { WorkstationSetupModal } from './components/modals/WorkstationSetupModal';
import { CopyScheduleModal } from './components/modals/CopyScheduleModal';
import { DateFilterModal } from './components/modals/DateFilterModal';
import { EnvironmentModal } from './components/modals/EnvironmentModal';
import { ShiftSwapModal } from './components/modals/ShiftSwapModal';
import { CalendarSyncModal } from './components/modals/CalendarSyncModal';
import { CredentialsModal } from './components/modals/CredentialsModal';
import { HelpManualModal } from './components/modals/HelpManualModal';
import { InteractiveHoverGuide } from './components/InteractiveHoverGuide';
import { MobileRadiologistView } from './components/MobileRadiologistView';
import { detectEnvironment } from './utils/environment';
import { formatPersonName } from './utils/formatters';

const PROD_CLEAN_VERSION = '2026-10-prod-clean-v2';

if (typeof window !== 'undefined') {
  if (localStorage.getItem('rad_prod_clean_version') !== PROD_CLEAN_VERSION) {
    localStorage.removeItem('rad_users_data');
    localStorage.removeItem('rad_sites_data');
    localStorage.removeItem('rad_ws_data');
    localStorage.removeItem('rad_shifts_data');
    localStorage.removeItem('rad_leaves_data');
    localStorage.removeItem('rad_rules_data');
    localStorage.removeItem('rad_routing_data');
    localStorage.removeItem('rad_templates_data');
    localStorage.removeItem('rad_accruals_data');
    localStorage.removeItem('rad_ris_backlogs');
    localStorage.removeItem('rad_audit_data');
    localStorage.removeItem('rad_ws_pc_name');
    localStorage.setItem('rad_prod_clean_version', PROD_CLEAN_VERSION);
  }
}

export default function App() {
  const [users, setUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('rad_users_data');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [sites, setSites] = useState<Record<string, ClinicalSite>>(() => {
    const saved = localStorage.getItem('rad_sites_data');
    return saved ? JSON.parse(saved) : INITIAL_SITES;
  });

  const [workstations, setWorkstations] = useState<Workstation[]>(() => {
    const saved = localStorage.getItem('rad_ws_data');
    return saved ? JSON.parse(saved) : INITIAL_WORKSTATIONS;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('rad_shifts_data');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('rad_leaves_data');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [rules, setRules] = useState<ComplianceRule[]>(() => {
    const saved = localStorage.getItem('rad_rules_data');
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  const [routingRules, setRoutingRules] = useState<NotificationRule[]>(() => {
    const saved = localStorage.getItem('rad_routing_data');
    return saved ? JSON.parse(saved) : INITIAL_ROUTING_RULES;
  });

  const [templates, setTemplates] = useState<Record<string, NotificationTemplate>>(() => {
    const saved = localStorage.getItem('rad_templates_data');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_TEMPLATES;
  });

  const [accruals, setAccruals] = useState<Record<string, PtoAccrual>>(() => {
    const saved = localStorage.getItem('rad_accruals_data');
    return saved ? JSON.parse(saved) : INITIAL_ACCRUALS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('rad_audit_data');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-init',
        timestamp: new Date().toLocaleString(),
        user: 'Operations Administrator',
        actionType: 'SYSTEM_BOOT',
        details: 'RadScheduler Pro initialized in clean production environment.'
      }
    ];
  });

  // Client Workstation Telemetry - Auto-detected from hardware & display characteristics (Cannot be manually selected)
  const [activeWorkstation] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const platform = (navigator.platform || 'WIN').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'CLI';
      let tier = 'DIAG-01';
      if (window.screen.width >= 3840) tier = 'BARCO-4K';
      else if (window.screen.width >= 2560) tier = 'BARCO-2K';
      else if (window.screen.width >= 1920) tier = 'EIZO-FHD';
      return `WS-${platform}-${tier}`;
    }
    return 'WS-BARCO-4K';
  });

  // Active User / Persona
  const [currentUser, setCurrentUser] = useState<StaffUser>(() => {
    return users.find(u => u.role === 'ADMIN') || users[0];
  });

  // Enforce Clinical Slate Dark Theme permanently (Light mode removed)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Dynamic Practice Governance & Configurations State
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem('rad_roles_data');
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  const [specialtiesList, setSpecialtiesList] = useState<ClinicalSpecialty[]>(() => {
    const saved = localStorage.getItem('rad_specialties_data');
    return saved ? JSON.parse(saved) : DEFAULT_SPECIALTIES;
  });

  const [shiftWindows, setShiftWindows] = useState<ShiftWindow[]>(() => {
    const saved = localStorage.getItem('rad_shift_windows_data');
    return saved ? JSON.parse(saved) : DEFAULT_SHIFT_WINDOWS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('rad_system_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_SETTINGS;
  });

  const [modalitiesList, setModalitiesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('rad_modalities_data');
    return saved ? JSON.parse(saved) : INITIAL_MODALITIES;
  });

  useEffect(() => {
    localStorage.setItem('rad_roles_data', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('rad_specialties_data', JSON.stringify(specialtiesList));
  }, [specialtiesList]);

  useEffect(() => {
    localStorage.setItem('rad_shift_windows_data', JSON.stringify(shiftWindows));
  }, [shiftWindows]);

  useEffect(() => {
    localStorage.setItem('rad_system_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('rad_modalities_data', JSON.stringify(modalitiesList));
  }, [modalitiesList]);

  // Responsive mobile auto-detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileMode(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // UI Navigation & View State
  const [activeTab, setActiveTab] = useState<'engine' | 'calendar' | 'specialty' | 'analytics' | 'leave' | 'admin'>('engine');
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [displayMode, setDisplayMode] = useState<'GRID' | 'SLOTS' | 'MOBILE'>('GRID');
  const [activeMonth, setActiveMonth] = useState<string>('2026-10');
  const [activeDate, setActiveDate] = useState<string>('2026-10-02');
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [activeSpecialty, setActiveSpecialty] = useState<Specialty | 'ALL'>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Outpatient RIS Backlogs State
  const [risBacklogs, setRisBacklogs] = useState<RisBacklogItem[]>(() => {
    const saved = localStorage.getItem('rad_ris_backlogs');
    return saved ? JSON.parse(saved) : INITIAL_RIS_BACKLOGS;
  });

  // Modals state
  const [isConflictDrawerOpen, setIsConflictDrawerOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftModalInitDate, setShiftModalInitDate] = useState<string>('2026-10-02');
  const [shiftModalInitSite, setShiftModalInitSite] = useState<string>('MAIN');

  const [isContrastModalOpen, setIsContrastModalOpen] = useState(false);
  const [contrastPresetSite, setContrastPresetSite] = useState<string>('MAIN');
  const [contrastPresetDate, setContrastPresetDate] = useState<string>('2026-10-02');

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveModalRadId, setLeaveModalRadId] = useState<string | undefined>(undefined);
  const [isWorkstationModalOpen, setIsWorkstationModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isDateFilterModalOpen, setIsDateFilterModalOpen] = useState(false);
  const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);

  // Clinician Shift Swap Marketplace State
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>(() => {
    const saved = localStorage.getItem('rad_swap_requests');
    return saved ? JSON.parse(saved) : DEFAULT_SHIFT_SWAPS;
  });
  useEffect(() => {
    localStorage.setItem('rad_swap_requests', JSON.stringify(swapRequests));
  }, [swapRequests]);

  // Clinician Credential & Compliance Expiration State
  const [credentials, setCredentials] = useState<ClinicianCredential[]>(() => {
    const saved = localStorage.getItem('rad_credentials_data');
    return saved ? JSON.parse(saved) : DEFAULT_CREDENTIALS;
  });
  useEffect(() => {
    localStorage.setItem('rad_credentials_data', JSON.stringify(credentials));
  }, [credentials]);

  // Dynamic Staff Custom Schema State
  const [customStaffFields, setCustomStaffFields] = useState<CustomStaffField[]>(() => {
    const saved = localStorage.getItem('rad_custom_fields');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_STAFF_FIELDS;
  });
  useEffect(() => {
    localStorage.setItem('rad_custom_fields', JSON.stringify(customStaffFields));
  }, [customStaffFields]);

  // Multi-Week Recurring Rotation Templates State
  const [rotationTemplates, setRotationTemplates] = useState<RotationTemplate[]>(() => {
    const saved = localStorage.getItem('rad_rotation_templates');
    return saved ? JSON.parse(saved) : DEFAULT_ROTATION_TEMPLATES;
  });
  useEffect(() => {
    localStorage.setItem('rad_rotation_templates', JSON.stringify(rotationTemplates));
  }, [rotationTemplates]);

  // Outbound Notification Relay & Webhooks State
  const [smtpWebhookConfig, setSmtpWebhookConfig] = useState<SmtpWebhookConfig>(() => {
    const saved = localStorage.getItem('rad_smtp_webhook_config');
    return saved ? JSON.parse(saved) : DEFAULT_SMTP_WEBHOOK_CONFIG;
  });
  useEffect(() => {
    localStorage.setItem('rad_smtp_webhook_config', JSON.stringify(smtpWebhookConfig));
  }, [smtpWebhookConfig]);

  // New Modals & Desktop Hover Guide States
  const [isShiftSwapModalOpen, setIsShiftSwapModalOpen] = useState(false);
  const [isCalendarSyncModalOpen, setIsCalendarSyncModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isHelpManualModalOpen, setIsHelpManualModalOpen] = useState(false);
  const [isHoverGuideActive, setIsHoverGuideActive] = useState(false);

  // Absence Categories State & Persistence
  const [absenceCategories, setAbsenceCategories] = useState<AbsenceCategory[]>(() => {
    const saved = localStorage.getItem('rad_absence_categories');
    return saved ? JSON.parse(saved) : DEFAULT_ABSENCE_CATEGORIES;
  });
  useEffect(() => {
    localStorage.setItem('rad_absence_categories', JSON.stringify(absenceCategories));
  }, [absenceCategories]);

  // Dual Environment State (DEV vs SHARED)
  const [currentEnv, setCurrentEnv] = useState<'DEV' | 'SHARED'>(() => detectEnvironment());

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem('rad_users_data', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('rad_sites_data', JSON.stringify(sites)); }, [sites]);
  useEffect(() => { localStorage.setItem('rad_ws_data', JSON.stringify(workstations)); }, [workstations]);
  useEffect(() => { localStorage.setItem('rad_shifts_data', JSON.stringify(shifts)); }, [shifts]);
  useEffect(() => { localStorage.setItem('rad_leaves_data', JSON.stringify(leaves)); }, [leaves]);
  useEffect(() => { localStorage.setItem('rad_rules_data', JSON.stringify(rules)); }, [rules]);
  useEffect(() => { localStorage.setItem('rad_routing_data', JSON.stringify(routingRules)); }, [routingRules]);
  useEffect(() => { localStorage.setItem('rad_templates_data', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('rad_audit_data', JSON.stringify(auditLogs.slice(0, 300))); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('rad_ris_backlogs', JSON.stringify(risBacklogs)); }, [risBacklogs]);

  // Log audit helper
  const addAuditLog = (actionType: string, details: string) => {
    const entry: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: currentUser.name,
      actionType,
      details
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Real-time conflict engine calculation
  const conflicts = useMemo(() => {
    return detectAllConflicts(shifts, users, sites, leaves, rules);
  }, [shifts, users, sites, leaves, rules]);

  // Shift CRUD Operations
  const handleSaveShift = (savedShift: Shift) => {
    setShifts(prev => {
      const idx = prev.findIndex(s => s.id === savedShift.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedShift;
        return next;
      }
      return [savedShift, ...prev];
    });

    const docName = users.find(u => u.id === savedShift.radId)?.name || 'Provider';
    addAuditLog('SAVE_SHIFT', `Scheduled shift for ${docName} (${savedShift.specialty}) at ${savedShift.site} on ${savedShift.date}.`);
  };

  const handleDeleteShift = (shiftId: string) => {
    const target = shifts.find(s => s.id === shiftId);
    setShifts(prev => prev.filter(s => s.id !== shiftId));
    if (target) {
      addAuditLog('DELETE_SHIFT', `Removed shift ID #${shiftId} (${target.specialty} at ${target.site} on ${target.date}).`);
    }
  };

  const handleMoveShift = (shiftId: string, targetDate: string, targetSite?: string) => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          date: targetDate,
          site: targetSite || s.site
        };
      }
      return s;
    }));
    addAuditLog('MOVE_SHIFT', `Moved shift ID #${shiftId} to ${targetDate}.`);
  };

  const handleSwapShifts = (shiftIdA: string, shiftIdB: string) => {
    setShifts(prev => {
      const sA = prev.find(s => s.id === shiftIdA);
      const sB = prev.find(s => s.id === shiftIdB);
      if (!sA || !sB) return prev;

      return prev.map(s => {
        if (s.id === shiftIdA) {
          return { ...s, date: sB.date, site: sB.site, hours: sB.hours };
        }
        if (s.id === shiftIdB) {
          return { ...s, date: sA.date, site: sA.site, hours: sA.hours };
        }
        return s;
      });
    });
    addAuditLog('SWAP_SHIFTS', `Swapped schedule positions between shifts #${shiftIdA} and #${shiftIdB}.`);
  };

  // Contrast Supervisor Assignment
  const handleAssignContrastSupervisor = (data: Partial<Shift>) => {
    if (!data.site || !data.date || !data.radId) return;

    setShifts(prev => {
      const existingClinicianShift = prev.find(s => s.date === data.date && s.radId === data.radId);
      const existingSupAtSite = prev.find(s => s.date === data.date && s.site === data.site && s.isSupervisor);

      let next = [...prev];

      if (existingSupAtSite && existingSupAtSite.radId !== data.radId) {
        next = next.map(s => s.id === existingSupAtSite.id ? { ...s, isSupervisor: false } : s);
      }

      if (existingClinicianShift) {
        next = next.map(s => s.id === existingClinicianShift.id ? {
          ...s,
          site: data.site!,
          isSupervisor: true,
          workstationId: data.workstationId || s.workstationId,
          hours: data.hours || s.hours
        } : s);
      } else {
        const clinician = users.find(u => u.id === data.radId);
        next.unshift({
          id: `shift-sup-${Date.now()}`,
          radId: data.radId!,
          specialty: clinician?.specialties[0] || 'Body',
          modality: 'Cross-Sectional CT & MRI',
          site: data.site!,
          workstationId: data.workstationId,
          hours: data.hours || '07:30 - 16:00',
          date: data.date!,
          isSupervisor: true
        });
      }

      return next;
    });

    const clinicianName = users.find(u => u.id === data.radId)?.name || 'Clinician';
    addAuditLog('CONTRAST_SUPERVISOR', `Assigned ${clinicianName} as On-Site Contrast Supervisor at ${data.site} on ${data.date}.`);
  };

  // Conflict Resolution Action
  const handleResolveConflict = (conflict: ScheduleConflict) => {
    setActiveDate(conflict.date);

    if (conflict.type === 'MISSING_CONTRAST_SUPERVISOR') {
      setContrastPresetSite(conflict.site || 'NHP');
      setContrastPresetDate(conflict.date);
      setIsContrastModalOpen(true);
      setIsConflictDrawerOpen(false);
    } else if (conflict.type === 'WORKSTATION_COLLISION' && conflict.shiftId) {
      const shift = shifts.find(s => s.id === conflict.shiftId);
      if (shift) {
        setEditingShift(shift);
        setIsShiftModalOpen(true);
        setIsConflictDrawerOpen(false);
      }
    } else if (conflict.type === 'AP_UNSUPERVISED') {
      setShiftModalInitDate(conflict.date);
      setShiftModalInitSite(conflict.site || 'NHP');
      setEditingShift(null);
      setIsShiftModalOpen(true);
      setIsConflictDrawerOpen(false);
    } else if (conflict.type === 'DOUBLE_BOOKING' && conflict.shiftId) {
      const shift = shifts.find(s => s.id === conflict.shiftId);
      if (shift) {
        setEditingShift(shift);
        setIsShiftModalOpen(true);
        setIsConflictDrawerOpen(false);
      }
    } else {
      setActiveTab('calendar');
      setIsConflictDrawerOpen(false);
    }
  };

  // Leave & PTO Handlers
  const handleSubmitLeave = (req: Omit<LeaveRequest, 'id' | 'submittedAt'>) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: `leave-${Date.now()}`,
      submittedAt: new Date().toISOString()
    };
    setLeaves(prev => [newLeave, ...prev]);
    const staffName = users.find(u => u.id === req.radId)?.name || 'Clinician';
    addAuditLog('LEAVE_REQUEST', `Submitted ${req.category} for ${staffName} (${req.startDate} to ${req.endDate}) [${req.dayCount}d].`);
    
    // Auto-dispatch simulated notification email to designated manager/admin
    const targetEmail = req.managerNotificationEmail || systemSettings.adminContactEmail || 'radiologymgmt@gmail.com';
    addAuditLog('LEAVE_EMAIL_DISPATCHED', `Dispatched leave notification email to ${targetEmail} for ${staffName}.`);

    // If submitted as approved (e.g. by Admin), deduct days from accrual balance
    if (newLeave.status === 'Approved') {
      const isPto = req.category.toLowerCase().includes('pto') || req.category.toLowerCase().includes('vacation');
      const isCme = req.category.toLowerCase().includes('cme') || req.category.toLowerCase().includes('conference');
      const days = req.dayCount ?? (req.durationType === 'HALF_DAY_AM' || req.durationType === 'HALF_DAY_PM' ? 0.5 : 1.0);
      
      setAccruals(prev => {
        const cur = prev[req.radId] || { annualPto: 30, cmeDays: 10, maxConsecutive: 14, usedPto: 0, usedCme: 0 };
        return {
          ...prev,
          [req.radId]: {
            ...cur,
            usedPto: isPto ? cur.usedPto + days : cur.usedPto,
            usedCme: isCme ? cur.usedCme + days : cur.usedCme
          }
        };
      });
    }
  };

  const handleApproveLeave = (leaveId: string) => {
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
      setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'Approved' } : l));
      const staffName = users.find(u => u.id === leave.radId)?.name || leave.radId;
      const days = leave.dayCount ?? (leave.durationType === 'HALF_DAY_AM' || leave.durationType === 'HALF_DAY_PM' ? 0.5 : 1.0);
      addAuditLog('APPROVE_LEAVE', `Approved ${days}d leave for ${staffName} (#${leaveId}).`);

      const isPto = leave.category.toLowerCase().includes('pto') || leave.category.toLowerCase().includes('vacation');
      const isCme = leave.category.toLowerCase().includes('cme') || leave.category.toLowerCase().includes('conference');

      setAccruals(prev => {
        const cur = prev[leave.radId] || { annualPto: 30, cmeDays: 10, maxConsecutive: 14, usedPto: 0, usedCme: 0 };
        return {
          ...prev,
          [leave.radId]: {
            ...cur,
            usedPto: isPto ? cur.usedPto + days : cur.usedPto,
            usedCme: isCme ? cur.usedCme + days : cur.usedCme
          }
        };
      });
    }
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'Rejected' } : l));
    addAuditLog('REJECT_LEAVE', `Rejected leave request #${leaveId}.`);
  };

  const handleDeleteLeave = (leaveId: string) => {
    setLeaves(prev => prev.filter(l => l.id !== leaveId));
    addAuditLog('DELETE_LEAVE', `Deleted leave request record #${leaveId}.`);
  };

  const handleUpdateAccrual = (userId: string, accrual: PtoAccrual) => {
    setAccruals(prev => ({
      ...prev,
      [userId]: accrual
    }));
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      allocatedAnnualPto: accrual.annualPto,
      allocatedAnnualCme: accrual.cmeDays
    } : u));
    const targetUser = users.find(u => u.id === userId);
    addAuditLog('UPDATE_PTO_ACCRUAL', `Configured PTO allotment (${accrual.annualPto}d) & CME (${accrual.cmeDays}d) for ${targetUser?.name || userId}.`);
  };

  const handleSaveAbsenceCategory = (cat: AbsenceCategory) => {
    setAbsenceCategories(prev => {
      const idx = prev.findIndex(c => c.id === cat.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = cat;
        return next;
      }
      return [...prev, cat];
    });
    addAuditLog('SAVE_ABSENCE_CATEGORY', `Updated absence category: ${cat.name} (${cat.isPaid ? 'Paid' : 'Unpaid'}).`);
  };

  const handleDeleteAbsenceCategory = (catId: string) => {
    const cat = absenceCategories.find(c => c.id === catId);
    setAbsenceCategories(prev => prev.filter(c => c.id !== catId));
    addAuditLog('DELETE_ABSENCE_CATEGORY', `Deleted absence category: ${cat?.name || catId}.`);
  };

  // Clinician Shift Swap Handlers
  const handlePostSwapRequest = (req: Omit<ShiftSwapRequest, 'id' | 'createdAt' | 'status'>) => {
    const newSwap: ShiftSwapRequest = {
      ...req,
      id: `swap-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'OPEN'
    };
    setSwapRequests(prev => [newSwap, ...prev]);
    addAuditLog('POST_SWAP_REQUEST', `Posted shift swap request for ${req.date}.`);
  };

  const handleAcceptSwap = (swapId: string, claimingRadId: string) => {
    setSwapRequests(prev => prev.map(s => {
      if (s.id === swapId) {
        return { ...s, status: 'CLAIMED', claimingRadId, claimedAt: new Date().toISOString() };
      }
      return s;
    }));
    const swap = swapRequests.find(s => s.id === swapId);
    if (swap) {
      setShifts(prev => prev.map(sh => {
        if (sh.id === swap.offeredShiftId) {
          return { ...sh, radId: claimingRadId };
        }
        return sh;
      }));
      const claimingDoc = users.find(u => u.id === claimingRadId)?.name || 'Clinician';
      addAuditLog('CLAIM_SWAP', `${claimingDoc} accepted shift swap #${swapId}. Shift reassigned.`);
    }
  };

  const handleCancelSwap = (swapId: string) => {
    setSwapRequests(prev => prev.map(s => s.id === swapId ? { ...s, status: 'CANCELLED' } : s));
    addAuditLog('CANCEL_SWAP', `Cancelled shift swap listing #${swapId}.`);
  };

  // Credential Handlers
  const handleSaveCredential = (cred: ClinicianCredential) => {
    setCredentials(prev => {
      const idx = prev.findIndex(c => c.id === cred.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cred;
        return next;
      }
      return [cred, ...prev];
    });
    addAuditLog('SAVE_CREDENTIAL', `Updated credential record: ${cred.title}.`);
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
    addAuditLog('DELETE_CREDENTIAL', `Removed credential record #${id}.`);
  };

  // Custom Staff Fields Schema Handlers
  const handleSaveCustomField = (field: CustomStaffField) => {
    setCustomStaffFields(prev => {
      const idx = prev.findIndex(f => f.id === field.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = field;
        return next;
      }
      return [...prev, field];
    });
    addAuditLog('SAVE_CUSTOM_FIELD', `Configured staff custom schema: ${field.label} (${field.key}).`);
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomStaffFields(prev => prev.filter(f => f.id !== id));
    addAuditLog('DELETE_CUSTOM_FIELD', `Deleted staff custom field #${id}.`);
  };

  // Multi-Week Rotation Template Handlers
  const handleSaveRotationTemplate = (tmpl: RotationTemplate) => {
    setRotationTemplates(prev => {
      const idx = prev.findIndex(t => t.id === tmpl.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = tmpl;
        return next;
      }
      return [...prev, tmpl];
    });
    addAuditLog('SAVE_ROTATION_TEMPLATE', `Saved ${tmpl.cycleWeeks}-week recurring rotation: "${tmpl.name}".`);
  };

  const handleDeleteRotationTemplate = (id: string) => {
    setRotationTemplates(prev => prev.filter(t => t.id !== id));
    addAuditLog('DELETE_ROTATION_TEMPLATE', `Deleted rotation template #${id}.`);
  };

  const handleApplyRotationShifts = (newShifts: Shift[]) => {
    setShifts(prev => [...newShifts, ...prev]);
    addAuditLog('APPLY_ROTATION', `Generated ${newShifts.length} automated shifts from rotation template.`);
  };

  // Outbound Webhook & SMTP Config Handlers
  const handleSaveSmtpWebhookConfig = (cfg: SmtpWebhookConfig) => {
    setSmtpWebhookConfig(cfg);
    addAuditLog('SAVE_WEBHOOK_CONFIG', `Updated outbound notifications (SMTP relay & Slack/Teams webhooks).`);
  };

  // Quick Telemetry Computed Metrics
  const expiringCredentials = useMemo(() => {
    return credentials.filter(c => c.status === 'EXPIRING_SOON' || c.status === 'EXPIRED');
  }, [credentials]);

  const openSwaps = useMemo(() => {
    return swapRequests.filter(s => s.status === 'OPEN');
  }, [swapRequests]);

  // Workstation Setup Handler
  const handleSaveWorkstation = (pcName: string, site: string, room: string, monitorProfile: string) => {
    localStorage.setItem('rad_ws_pc_name', pcName);
    setWorkstations(prev => {
      const existing = prev.find(w => w.id === pcName);
      if (existing) {
        return prev.map(w => w.id === pcName ? { ...w, site, room, monitorType: monitorProfile } : w);
      }
      return [...prev, { id: pcName, site, room, monitorType: monitorProfile, isHome: site === 'REMOTE', currentRadId: currentUser.id }];
    });
    addAuditLog('CONFIG_WORKSTATION', `Configured terminal ${pcName} (${room} &bull; ${site}).`);
  };

  // Copy Shifts Handler
  const handleExecuteCopy = (newShifts: Shift[]) => {
    setShifts(prev => [...newShifts, ...prev]);
    addAuditLog('COPY_SCHEDULE', `Duplicated ${newShifts.length} shift patterns.`);
  };

  // Batch Importer Handler
  const handleBatchImport = (type: 'USERS' | 'SITES' | 'WORKSTATIONS', rawData: string) => {
    const lines = rawData.split(/\r?\n/).filter(Boolean);
    let count = 0;

    lines.forEach((line, idx) => {
      const cols = (line.includes('\t') ? line.split('\t') : line.split(',')).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (type === 'USERS' && cols[0]) {
        const name = cols[0];
        const role = (cols[1] as UserRole) || 'ATTENDING_RAD';
        const specs = (cols[2] ? cols[2].split(/[/,;]/).map(s => s.trim()) : ['Body']) as Specialty[];
        const site = cols[3] || Object.keys(sites)[0] || 'MAIN';
        const homePc = cols[4] || '';
        const email = cols[5] || `${name.toLowerCase().replace(/[^a-z]/g, '')}@organization.org`;
        const certContrast = cols[6] === 'true' || cols[6] === '1' || cols[6] === 'yes';

        setUsers(prev => {
          const exIdx = prev.findIndex(u => u.name.toLowerCase() === name.toLowerCase());
          const obj: StaffUser = {
            id: exIdx !== -1 ? prev[exIdx].id : `user-batch-${Date.now()}-${idx}`,
            name,
            role,
            title: role === 'ATTENDING_RAD' ? 'MD' : 'RPA',
            specialties: specs,
            primarySite: site,
            homePc: homePc || undefined,
            email,
            certContrast,
            isArchived: false
          };
          if (exIdx !== -1) {
            const next = [...prev];
            next[exIdx] = obj;
            return next;
          }
          return [...prev, obj];
        });
        count++;
      } else if (type === 'WORKSTATIONS' && cols[0]) {
        const host = cols[0].toUpperCase();
        const site = cols[1] || Object.keys(sites)[0] || 'MAIN';
        const room = cols[2] || 'Diagnostic Pod';
        const monitor = cols[3] || 'Dual Barco Coronis 5MP Mammo (FDA Certified)';
        setWorkstations(prev => {
          const exIdx = prev.findIndex(w => w.id === host);
          const obj: Workstation = {
            id: host,
            site,
            room,
            monitorType: monitor,
            isHome: site === 'REMOTE',
            currentRadId: null
          };
          if (exIdx !== -1) {
            const next = [...prev];
            next[exIdx] = obj;
            return next;
          }
          return [...prev, obj];
        });
        count++;
      }
    });

    addAuditLog('BATCH_IMPORT', `Imported ${count} ${type} records.`);
  };

  const handleExportScheduleCsv = () => {
    let csv = 'Clinician,Role,Subspecialty,Modality,Site,Workstation,Hours,Date,ContrastSupervisor,IsSplit,SplitDetails,SupervisingMD\n';
    shifts.forEach(s => {
      const u = users.find(x => x.id === s.radId);
      const docName = s.radId === 'NO_RAD_NEEDED' ? 'No Rad Needed' : (u ? formatPersonName(u.name, u.role, u.title) : 'Physician');
      const supMd = s.supervisingRadId ? (users.find(x => x.id === s.supervisingRadId)?.name || '') : '';
      csv += `"${docName}","${u?.role || ''}","${s.specialty}","${s.modality}","${s.site}","${s.workstationId || ''}","${s.hours}","${s.date}",${!!s.isSupervisor},${!!s.isSplit},"${(s.splitDetails || '').replace(/"/g, '""')}","${supMd}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Radiology_Schedule_${activeMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportAuditCsv = () => {
    let csv = 'Timestamp,Operator,ActionType,Details\n';
    auditLogs.forEach(l => {
      csv += `"${l.timestamp}","${l.user}","${l.actionType}","${(l.details || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Radiology_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerateReportPdf = () => {
    window.print();
    addAuditLog('GENERATE_REPORT', 'Generated Departmental Executive Absence & Coverage PDF report.');
  };

  const selectedSiteLabel = selectedSites.size === 0 
    ? 'ALL' 
    : Array.from(selectedSites).map(s => sites[s]?.label || s).join(', ');

  return (
    <div 
      data-theme="dark"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
      className="h-screen flex flex-col overflow-hidden selection:bg-[#a0c9eb] selection:text-black bg-[#2e313a] text-[#fdfdfd]"
    >
      
      {/* 1. Header (64px, Cormorant Garamond serif brand, telemetry tags, Question Mark hover guide) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        users={users}
        conflicts={conflicts}
        onOpenConflicts={() => setIsConflictDrawerOpen(true)}
        onOpenEnvironmentModal={() => setIsEnvironmentModalOpen(true)}
        currentEnv={currentEnv}
        isMobileMode={isMobileMode}
        setIsMobileMode={setIsMobileMode}
        activeWorkstation={activeWorkstation}
        selectedSiteLabel={selectedSiteLabel}
        isHoverGuideActive={isHoverGuideActive}
        onToggleHoverGuide={() => setIsHoverGuideActive(prev => !prev)}
        onOpenHelpManual={() => setIsHelpManualModalOpen(true)}
        onOpenShiftSwapModal={() => setIsShiftSwapModalOpen(true)}
        onOpenCalendarSyncModal={() => setIsCalendarSyncModalOpen(true)}
        onOpenCredentialsModal={() => setIsCredentialsModalOpen(true)}
        expiringCredentialsCount={expiringCredentials.length}
        openSwapsCount={openSwaps.length}
      />

      {/* 2. Mobile Companion View vs Desktop 2-Pane Layout */}
      {isMobileMode ? (
        <div className="flex-1 overflow-y-auto">
          <MobileRadiologistView
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            users={users}
            shifts={shifts}
            sites={sites}
            workstations={workstations}
            leaves={leaves}
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
            onExitMobile={() => setIsMobileMode(false)}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Controls Pane / Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeMonth={activeMonth}
          setActiveMonth={setActiveMonth}
          setActiveDate={setActiveDate}
          selectedDates={selectedDates}
          onOpenDateFilterModal={() => setIsDateFilterModalOpen(true)}
          onResetDateFilter={() => setSelectedDates(new Set())}
          sites={sites}
          selectedSites={selectedSites}
          setSelectedSites={setSelectedSites}
          activeSpecialty={activeSpecialty}
          setActiveSpecialty={setActiveSpecialty}
          selectedRoleFilter={selectedRoleFilter}
          setSelectedRoleFilter={setSelectedRoleFilter}
          onOpenShiftModal={() => {
            setEditingShift(null);
            setShiftModalInitDate(activeDate);
            setShiftModalInitSite(selectedSites.size === 1 ? Array.from(selectedSites)[0] : (Object.keys(sites)[0] || 'MAIN'));
            setIsShiftModalOpen(true);
          }}
          onOpenContrastModal={() => {
            setContrastPresetSite(selectedSites.size === 1 ? Array.from(selectedSites)[0] : (Object.keys(sites)[0] || 'MAIN'));
            setContrastPresetDate(activeDate);
            setIsContrastModalOpen(true);
          }}
          onOpenCopyModal={() => setIsCopyModalOpen(true)}
          onExportCsv={handleExportScheduleCsv}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAdmin={currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER'}
        />

        {/* Right Main Content Viewport */}
        <main 
          style={{ backgroundColor: '#484959' }}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#484959]"
        >
          
          {activeTab === 'engine' && (
            <OutpatientOpsView
              shifts={shifts}
              setShifts={setShifts}
              users={users}
              sites={sites}
              leaves={leaves}
              setLeaves={setLeaves}
              conflicts={conflicts}
              risBacklogs={risBacklogs}
              setRisBacklogs={setRisBacklogs}
              activeDate={activeDate}
              onOpenShiftModal={() => {
                setEditingShift(null);
                setShiftModalInitDate(activeDate);
                setShiftModalInitSite(selectedSites.size === 1 ? Array.from(selectedSites)[0] : (Object.keys(sites)[0] || 'MAIN'));
                setIsShiftModalOpen(true);
              }}
              addAuditLog={addAuditLog}
            />
          )}

          {activeTab === 'calendar' && (
            <ScheduleView
              shifts={shifts}
              users={users}
              sites={sites}
              conflicts={conflicts}
              activeDate={activeDate}
              setActiveDate={setActiveDate}
              activeMonth={activeMonth}
              setActiveMonth={setActiveMonth}
              selectedSites={selectedSites}
              setSelectedSites={setSelectedSites}
              activeSpecialty={activeSpecialty}
              setActiveSpecialty={setActiveSpecialty}
              selectedRoleFilter={selectedRoleFilter}
              setSelectedRoleFilter={setSelectedRoleFilter}
              selectedDates={selectedDates}
              onOpenDateFilterModal={() => setIsDateFilterModalOpen(true)}
              onResetDateFilter={() => setSelectedDates(new Set())}
              onOpenShiftModal={(date, site) => {
                setEditingShift(null);
                setShiftModalInitDate(date || activeDate);
                setShiftModalInitSite(site || Object.keys(sites)[0] || 'MAIN');
                setIsShiftModalOpen(true);
              }}
              onEditShift={(shift) => {
                setEditingShift(shift);
                setIsShiftModalOpen(true);
              }}
              onDeleteShift={handleDeleteShift}
              onOpenContrastModal={(site, date) => {
                setContrastPresetSite(site || Object.keys(sites)[0] || 'MAIN');
                setContrastPresetDate(date || activeDate);
                setIsContrastModalOpen(true);
              }}
              onOpenCopyModal={() => setIsCopyModalOpen(true)}
              onExportCsv={handleExportScheduleCsv}
              onMoveShift={handleMoveShift}
              onSwapShifts={handleSwapShifts}
              onSelectConflict={handleResolveConflict}
              displayMode={displayMode}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'specialty' && (
            <SpecialtyMatrixView
              shifts={shifts}
              users={users}
              sites={sites}
              rules={rules}
              activeDate={activeDate}
              setActiveDate={setActiveDate}
              onEditShift={(shift) => {
                setEditingShift(shift);
                setIsShiftModalOpen(true);
              }}
              onOpenShiftModal={(date, site) => {
                setEditingShift(null);
                setShiftModalInitDate(date || activeDate);
                setShiftModalInitSite(site || Object.keys(sites)[0] || 'MAIN');
                setIsShiftModalOpen(true);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              shifts={shifts}
              users={users}
              sites={sites}
              leaves={leaves}
              accruals={accruals}
            />
          )}

          {activeTab === 'leave' && (
            <LeavePortalView
              leaves={leaves}
              users={users}
              currentUser={currentUser}
              accruals={accruals}
              onUpdateAccrual={handleUpdateAccrual}
              onOpenLeaveModal={(initRadId) => {
                setLeaveModalRadId(initRadId);
                setIsLeaveModalOpen(true);
              }}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
              onDeleteLeave={handleDeleteLeave}
              absenceCategories={absenceCategories}
              onSaveAbsenceCategory={handleSaveAbsenceCategory}
              onDeleteAbsenceCategory={handleDeleteAbsenceCategory}
              isAdmin={currentUser.role === 'ADMIN' || currentUser.role === 'CHIEF' || currentUser.role === 'MANAGER'}
            />
          )}

          {activeTab === 'admin' && (
            <AdminCenterView
              users={users}
              onSaveUser={(u) => {
                setUsers(prev => {
                  const ex = prev.findIndex(x => x.id === u.id);
                  if (ex !== -1) {
                    const next = [...prev];
                    next[ex] = u;
                    return next;
                  }
                  return [...prev, u];
                });
                addAuditLog('UPDATE_USER', `Updated staff directory profile for ${u.name}.`);
              }}
              onDeleteUser={(uid) => {
                setUsers(prev => prev.filter(x => x.id !== uid));
                addAuditLog('DELETE_USER', `Removed clinician ID #${uid}.`);
              }}
              sites={sites}
              onSaveSite={(s) => {
                setSites(prev => ({ ...prev, [s.id]: s }));
                addAuditLog('SAVE_SITE', `Configured facility ${s.name} (${s.label}).`);
              }}
              onDeleteSite={(sid) => {
                setSites(prev => {
                  const next = { ...prev };
                  delete next[sid];
                  return next;
                });
                addAuditLog('DELETE_SITE', `Removed facility ${sid}.`);
              }}
              workstations={workstations}
              onSaveWorkstation={(ws) => {
                setWorkstations(prev => {
                  const ex = prev.findIndex(w => w.id === ws.id);
                  if (ex !== -1) {
                    const next = [...prev];
                    next[ex] = ws;
                    return next;
                  }
                  return [...prev, ws];
                });
                addAuditLog('SAVE_WORKSTATION', `Saved terminal ${ws.id}.`);
              }}
              onDeleteWorkstation={(wid) => {
                setWorkstations(prev => prev.filter(w => w.id !== wid));
                addAuditLog('DELETE_WORKSTATION', `Removed workstation ${wid}.`);
              }}
              rules={rules}
              onSaveRule={(r) => {
                setRules(prev => {
                  const idx = prev.findIndex(item => item.id === r.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = r;
                    return next;
                  }
                  return [...prev, r];
                });
                addAuditLog('SAVE_RULE', `Saved rule ${r.name}.`);
              }}
              onDeleteRule={(rid) => {
                setRules(prev => prev.filter(r => r.id !== rid));
                addAuditLog('DELETE_RULE', `Removed rule #${rid}.`);
              }}
              routingRules={routingRules}
              onSaveRoutingRule={(rr) => {
                setRoutingRules(prev => {
                  const idx = prev.findIndex(item => item.id === rr.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = rr;
                    return next;
                  }
                  return [...prev, rr];
                });
                addAuditLog('SAVE_ROUTING', `Saved routing rule ${rr.name}.`);
              }}
              onDeleteRoutingRule={(rrid) => {
                setRoutingRules(prev => prev.filter(r => r.id !== rrid));
                addAuditLog('DELETE_ROUTING', `Removed routing rule #${rrid}.`);
              }}
              templates={templates}
              onSaveTemplate={(scenario, t) => {
                setTemplates(prev => ({ ...prev, [scenario]: t }));
                addAuditLog('SAVE_TEMPLATE', `Saved template ${scenario}.`);
              }}
              onDeleteTemplate={(scenario) => {
                setTemplates(prev => {
                  const next = { ...prev };
                  delete next[scenario];
                  return next;
                });
                addAuditLog('DELETE_TEMPLATE', `Deleted template ${scenario}.`);
              }}
              onClearAllDemoData={() => {
                const cleanAdmin: StaffUser = {
                  id: 'ADMIN-001',
                  name: 'Radiology Operations Administrator',
                  role: 'ADMIN',
                  title: 'MD',
                  specialties: ['Body'],
                  primarySite: 'MAIN',
                  email: 'radiologymgmt@gmail.com',
                  certContrast: true,
                  isArchived: false,
                  fte: 1.0
                };
                const cleanSite: ClinicalSite = {
                  id: 'MAIN',
                  name: 'Main Clinical Imaging Center',
                  label: 'MAIN',
                  slots: 4,
                  openWeekends: false,
                  requiresContrast: true,
                  modalities: ['Cross-Sectional CT & MRI', 'Mammography & 3D Tomosynthesis', 'Emergency & Inpatient Stat Reads', 'Diagnostic Ultrasound & Vascular']
                };
                setShifts([]);
                setLeaves([]);
                setUsers([cleanAdmin]);
                setCurrentUser(cleanAdmin);
                setSites({ 'MAIN': cleanSite });
                setWorkstations([{
                  id: 'WS-MAIN-01',
                  site: 'MAIN',
                  room: 'Primary Diagnostic Reading Pod 1',
                  monitorType: 'Dual Barco Nio 3MP Diagnostic Color',
                  isHome: false,
                  currentRadId: null
                }]);
                setRules([]);
                setRoutingRules([]);
                setRisBacklogs([]);
                setSelectedSites(new Set());
                localStorage.setItem('rad_shifts_data', JSON.stringify([]));
                localStorage.setItem('rad_leaves_data', JSON.stringify([]));
                localStorage.setItem('rad_users_data', JSON.stringify([cleanAdmin]));
                localStorage.setItem('rad_sites_data', JSON.stringify({ 'MAIN': cleanSite }));
                localStorage.setItem('rad_ws_data', JSON.stringify([{
                  id: 'WS-MAIN-01',
                  site: 'MAIN',
                  room: 'Primary Diagnostic Reading Pod 1',
                  monitorType: 'Dual Barco Nio 3MP Diagnostic Color',
                  isHome: false,
                  currentRadId: null
                }]));
                localStorage.setItem('rad_rules_data', JSON.stringify([]));
                localStorage.setItem('rad_routing_data', JSON.stringify([]));
                localStorage.setItem('rad_ris_backlogs', JSON.stringify([]));
                addAuditLog('PRODUCTION_RESET', 'Cleared all demo data and initialized clean production workspace.');
              }}
              onPurgeEverything={() => {
                const cleanAdmin: StaffUser = {
                  id: 'ADMIN-001',
                  name: 'Radiology Operations Administrator',
                  role: 'ADMIN',
                  title: 'MD',
                  specialties: ['Body'],
                  primarySite: '',
                  email: 'radiologymgmt@gmail.com',
                  certContrast: true,
                  isArchived: false,
                  fte: 1.0
                };
                setShifts([]);
                setLeaves([]);
                setUsers([cleanAdmin]);
                setCurrentUser(cleanAdmin);
                setSites({});
                setWorkstations([]);
                setRules([]);
                setRoutingRules([]);
                setRisBacklogs([]);
                setSelectedSites(new Set());
                localStorage.setItem('rad_shifts_data', '[]');
                localStorage.setItem('rad_leaves_data', '[]');
                localStorage.setItem('rad_users_data', JSON.stringify([cleanAdmin]));
                localStorage.setItem('rad_sites_data', '{}');
                localStorage.setItem('rad_ws_data', '[]');
                localStorage.setItem('rad_rules_data', '[]');
                localStorage.setItem('rad_routing_data', '[]');
                localStorage.setItem('rad_ris_backlogs', '[]');
                addAuditLog('PURGE_ALL', 'Wiped all records to clean zero-state.');
              }}
              onExportBackup={() => {
                const backup = {
                  users,
                  sites,
                  workstations,
                  shifts,
                  leaves,
                  rules,
                  routingRules,
                  templates,
                  accruals,
                  risBacklogs,
                  absenceCategories,
                  roles,
                  specialtiesList,
                  shiftWindows,
                  systemSettings,
                  modalitiesList,
                  swapRequests,
                  credentials,
                  customStaffFields,
                  rotationTemplates,
                  smtpWebhookConfig,
                  exportedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `radscheduler_backup_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                addAuditLog('EXPORT_BACKUP', 'Exported database backup JSON.');
              }}
              onRestoreBackup={(backupData: any) => {
                if (backupData.users) setUsers(backupData.users);
                if (backupData.sites) setSites(backupData.sites);
                if (backupData.workstations) setWorkstations(backupData.workstations);
                if (backupData.shifts) setShifts(backupData.shifts);
                if (backupData.leaves) setLeaves(backupData.leaves);
                if (backupData.rules) setRules(backupData.rules);
                if (backupData.routingRules) setRoutingRules(backupData.routingRules);
                if (backupData.templates) setTemplates(backupData.templates);
                if (backupData.accruals) setAccruals(backupData.accruals);
                if (backupData.absenceCategories) setAbsenceCategories(backupData.absenceCategories);
                if (backupData.risBacklogs) setRisBacklogs(backupData.risBacklogs);
                if (backupData.roles) setRoles(backupData.roles);
                if (backupData.specialtiesList) setSpecialtiesList(backupData.specialtiesList);
                if (backupData.shiftWindows) setShiftWindows(backupData.shiftWindows);
                if (backupData.systemSettings) setSystemSettings(backupData.systemSettings);
                if (backupData.modalitiesList) setModalitiesList(backupData.modalitiesList);
                if (backupData.users && backupData.users.length > 0) {
                  setCurrentUser(backupData.users.find((u: any) => u.role === 'ADMIN') || backupData.users[0]);
                }
                addAuditLog('RESTORE_BACKUP', 'Restored database from JSON backup.');
              }}
              auditLogs={auditLogs}
              onClearAuditLogs={() => setAuditLogs([])}
              onExportAuditCsv={handleExportAuditCsv}
              currentEnv={currentEnv}
              onEnvironmentChange={setCurrentEnv}
              shifts={shifts}
              leaves={leaves}
              onBatchImport={handleBatchImport}
              onGenerateReportPdf={handleGenerateReportPdf}
              roles={roles}
              onSaveRole={(r) => {
                setRoles(prev => {
                  const idx = prev.findIndex(item => item.id === r.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = r;
                    return next;
                  }
                  return [...prev, r];
                });
                addAuditLog('SAVE_ROLE', `Saved role ${r.name} (${r.id}).`);
              }}
              onDeleteRole={(rid) => {
                setRoles(prev => prev.filter(r => r.id !== rid));
                addAuditLog('DELETE_ROLE', `Removed custom role #${rid}.`);
              }}
              specialtiesList={specialtiesList}
              onSaveSpecialty={(s) => {
                setSpecialtiesList(prev => {
                  const idx = prev.findIndex(item => item.id === s.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = s;
                    return next;
                  }
                  return [...prev, s];
                });
                addAuditLog('SAVE_SPECIALTY', `Saved clinical specialty ${s.name} (${s.code}).`);
              }}
              onDeleteSpecialty={(sid) => {
                setSpecialtiesList(prev => prev.filter(s => s.id !== sid));
                addAuditLog('DELETE_SPECIALTY', `Removed clinical specialty #${sid}.`);
              }}
              shiftWindows={shiftWindows}
              onSaveShiftWindow={(sw) => {
                setShiftWindows(prev => {
                  const idx = prev.findIndex(item => item.id === sw.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = sw;
                    return next;
                  }
                  return [...prev, sw];
                });
                addAuditLog('SAVE_SHIFT_WINDOW', `Saved shift window ${sw.label}.`);
              }}
              onDeleteShiftWindow={(swId) => {
                setShiftWindows(prev => prev.filter(s => s.id !== swId));
                addAuditLog('DELETE_SHIFT_WINDOW', `Removed shift window #${swId}.`);
              }}
              systemSettings={systemSettings}
              onSaveSystemSettings={(settings) => {
                setSystemSettings(settings);
                addAuditLog('SAVE_SYSTEM_SETTINGS', `Updated system configuration for ${settings.practiceName}.`);
              }}
              modalitiesList={modalitiesList}
              onSaveModality={(mod) => {
                setModalitiesList(prev => prev.includes(mod) ? prev : [...prev, mod]);
                addAuditLog('SAVE_MODALITY', `Added imaging modality ${mod}.`);
              }}
              onDeleteModality={(mod) => {
                setModalitiesList(prev => prev.filter(m => m !== mod));
                addAuditLog('DELETE_MODALITY', `Removed imaging modality ${mod}.`);
              }}
              theme="dark"
              setTheme={() => {}}
              customStaffFields={customStaffFields}
              onSaveCustomField={handleSaveCustomField}
              onDeleteCustomField={handleDeleteCustomField}
              rotationTemplates={rotationTemplates}
              onSaveRotationTemplate={handleSaveRotationTemplate}
              onDeleteRotationTemplate={handleDeleteRotationTemplate}
              onApplyRotationShifts={handleApplyRotationShifts}
              smtpWebhookConfig={smtpWebhookConfig}
              onSaveSmtpWebhookConfig={handleSaveSmtpWebhookConfig}
              addAuditLog={addAuditLog}
            />
          )}

        </main>

      </div>
      )}

      {/* Real-time Conflict Resolution Drawer */}
      <ConflictDrawer
        isOpen={isConflictDrawerOpen}
        onClose={() => setIsConflictDrawerOpen(false)}
        conflicts={conflicts}
        onResolveConflict={handleResolveConflict}
        onJumpToDate={(d) => {
          setActiveDate(d);
          setActiveTab('calendar');
        }}
      />

      {/* Assignment & Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => {
          setIsShiftModalOpen(false);
          setEditingShift(null);
        }}
        onSaveShift={handleSaveShift}
        editingShift={editingShift}
        users={users}
        sites={sites}
        workstations={workstations}
        modalities={INITIAL_MODALITIES}
        initialDate={shiftModalInitDate}
        initialSite={shiftModalInitSite}
      />

      {/* Contrast Supervision Designation Modal */}
      <ContrastSupervisorModal
        isOpen={isContrastModalOpen}
        onClose={() => setIsContrastModalOpen(false)}
        onAssignSupervisor={handleAssignContrastSupervisor}
        sites={sites}
        users={users}
        workstations={workstations}
        shifts={shifts}
        presetSite={contrastPresetSite}
        presetDate={contrastPresetDate}
      />

      {/* Leave / Absence Request Modal */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => {
          setIsLeaveModalOpen(false);
          setLeaveModalRadId(undefined);
        }}
        onSubmitLeave={handleSubmitLeave}
        users={users}
        currentUserId={leaveModalRadId || currentUser.id}
        initialDate={activeDate}
        isAdmin={currentUser.role === 'ADMIN' || currentUser.role === 'CHIEF' || currentUser.role === 'MANAGER'}
        accruals={accruals}
        absenceCategories={absenceCategories}
        managerContactEmail={systemSettings.adminContactEmail || 'radiologymgmt@gmail.com'}
      />

      {/* Workstation Hardware Telemetry Modal */}
      <WorkstationSetupModal
        isOpen={isWorkstationModalOpen}
        onClose={() => setIsWorkstationModalOpen(false)}
        workstations={workstations}
        sites={sites}
        monitorProfiles={INITIAL_MONITOR_PROFILES}
        currentWorkstation={activeWorkstation}
        onSaveWorkstation={handleSaveWorkstation}
      />

      {/* Copy Schedule Wizard Modal */}
      <CopyScheduleModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        sites={sites}
        shifts={shifts}
        onExecuteCopy={handleExecuteCopy}
        activeDate={activeDate}
      />

      {/* Multi-Date Filter Modal */}
      <DateFilterModal
        isOpen={isDateFilterModalOpen}
        onClose={() => setIsDateFilterModalOpen(false)}
        selectedDates={selectedDates}
        onApplyDates={(d) => setSelectedDates(d)}
        onResetDates={() => setSelectedDates(new Set())}
      />

      {/* AI Studio Dual Environment Modal */}
      <EnvironmentModal
        isOpen={isEnvironmentModalOpen}
        onClose={() => setIsEnvironmentModalOpen(false)}
        currentEnv={currentEnv}
        onEnvironmentChange={setCurrentEnv}
      />

      {/* Clinician-to-Clinician Shift Swap Marketplace Modal */}
      <ShiftSwapModal
        isOpen={isShiftSwapModalOpen}
        onClose={() => setIsShiftSwapModalOpen(false)}
        currentUser={currentUser}
        users={users}
        shifts={shifts}
        swapRequests={swapRequests}
        onPostSwapRequest={handlePostSwapRequest}
        onAcceptSwap={handleAcceptSwap}
        onCancelSwap={handleCancelSwap}
      />

      {/* Personal iCal / Webcal Subscription Feed Modal */}
      <CalendarSyncModal
        isOpen={isCalendarSyncModalOpen}
        onClose={() => setIsCalendarSyncModalOpen(false)}
        currentUser={currentUser}
        users={users}
        shifts={shifts}
        leaves={leaves}
        sites={sites}
      />

      {/* Credential & Compliance Expiration Tracking Modal */}
      <CredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        users={users}
        credentials={credentials}
        onSaveCredential={handleSaveCredential}
        onDeleteCredential={handleDeleteCredential}
        isAdmin={currentUser.role === 'ADMIN' || currentUser.role === 'CHIEF' || currentUser.role === 'MANAGER'}
      />

      {/* Help / User Manual Section Modal */}
      <HelpManualModal
        isOpen={isHelpManualModalOpen}
        onClose={() => setIsHelpManualModalOpen(false)}
        onActivateHoverGuide={() => {
          setIsHelpManualModalOpen(false);
          setIsHoverGuideActive(true);
        }}
      />

      {/* Interactive Desktop Hover Guide Overlay */}
      <InteractiveHoverGuide
        isActive={isHoverGuideActive && !isMobileMode}
        onClose={() => setIsHoverGuideActive(false)}
        onOpenManual={() => {
          setIsHoverGuideActive(false);
          setIsHelpManualModalOpen(true);
        }}
      />

    </div>
  );
}
