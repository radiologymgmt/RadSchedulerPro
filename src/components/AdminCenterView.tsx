import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Monitor, 
  Building2, 
  Route, 
  Upload, 
  FileText, 
  History, 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle2, 
  Mail,
  Send,
  FileSpreadsheet,
  Edit3,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  Share2,
  Laptop,
  ExternalLink,
  Copy,
  KeyRound,
  Palette,
  Clock,
  Settings,
  Sliders,
  Bell,
  Layers,
  Search,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  StaffUser, 
  ClinicalSite, 
  Workstation, 
  ComplianceRule, 
  NotificationRule, 
  NotificationTemplate, 
  AuditLog, 
  Shift,
  LeaveRequest,
  RoleDefinition,
  ClinicalSpecialty,
  ShiftWindow,
  SystemSettings,
  CustomStaffField,
  RotationTemplate,
  SmtpWebhookConfig,
  ScheduleConflict
} from '../types';
import { 
  DEFAULT_ROLES, 
  DEFAULT_SPECIALTIES, 
  DEFAULT_SHIFT_WINDOWS, 
  DEFAULT_SYSTEM_SETTINGS, 
  INITIAL_MODALITIES,
  DEFAULT_CUSTOM_STAFF_FIELDS,
  DEFAULT_ROTATION_TEMPLATES,
  DEFAULT_SMTP_WEBHOOK_CONFIG
} from '../data/initialData';
import { RoleEditorTab } from './admin/RoleEditorTab';
import { SpecialtiesManagerTab } from './admin/SpecialtiesManagerTab';
import { ShiftWindowsTab } from './admin/ShiftWindowsTab';
import { CompliancePoliciesTab } from './admin/CompliancePoliciesTab';
import { SystemSettingsTab } from './admin/SystemSettingsTab';
import { CustomStaffFieldsTab } from './admin/CustomStaffFieldsTab';
import { RotationTemplateTab } from './admin/RotationTemplateTab';
import { NotificationWebhookTab } from './admin/NotificationWebhookTab';
import { VisualRuleBuilderTab } from './admin/VisualRuleBuilderTab';
import { formatPersonName, formatDateWithDay } from '../utils/formatters';
import { 
  ENVIRONMENTS,
  AI_STUDIO_DEV_URL, 
  AI_STUDIO_SHARED_URL, 
  setSimulatedEnvironment 
} from '../utils/environment';

interface AdminCenterViewProps {
  users: StaffUser[];
  onSaveUser: (user: StaffUser) => void;
  onDeleteUser: (userId: string) => void;
  sites: Record<string, ClinicalSite>;
  onSaveSite: (site: ClinicalSite) => void;
  onDeleteSite: (siteId: string) => void;
  workstations: Workstation[];
  onSaveWorkstation: (ws: Workstation) => void;
  onDeleteWorkstation: (wsId: string) => void;
  rules: ComplianceRule[];
  onSaveRule: (rule: ComplianceRule) => void;
  onDeleteRule: (ruleId: string) => void;
  routingRules: NotificationRule[];
  onSaveRoutingRule: (rule: NotificationRule) => void;
  onDeleteRoutingRule: (ruleId: string) => void;
  templates: Record<string, NotificationTemplate>;
  onSaveTemplate: (scenario: string, template: NotificationTemplate) => void;
  onDeleteTemplate?: (scenario: string) => void;
  onClearAllDemoData?: () => void;
  onPurgeEverything?: () => void;
  onExportBackup?: () => void;
  onRestoreBackup?: (data: any) => void;
  currentEnv?: 'DEV' | 'SHARED';
  onEnvironmentChange?: (env: 'DEV' | 'SHARED') => void;
  auditLogs: AuditLog[];
  onClearAuditLogs: () => void;
  onExportAuditCsv: () => void;
  shifts: Shift[];
  leaves: LeaveRequest[];
  onBatchImport: (type: 'USERS' | 'SITES' | 'WORKSTATIONS', rawData: string) => void;
  onGenerateReportPdf: () => void;
  roles?: RoleDefinition[];
  onSaveRole?: (role: RoleDefinition) => void;
  onDeleteRole?: (roleId: string) => void;
  specialtiesList?: ClinicalSpecialty[];
  onSaveSpecialty?: (spec: ClinicalSpecialty) => void;
  onDeleteSpecialty?: (specId: string) => void;
  shiftWindows?: ShiftWindow[];
  onSaveShiftWindow?: (sw: ShiftWindow) => void;
  onDeleteShiftWindow?: (swId: string) => void;
  systemSettings?: SystemSettings;
  onSaveSystemSettings?: (settings: SystemSettings) => void;
  modalitiesList?: string[];
  onSaveModality?: (mod: string) => void;
  onDeleteModality?: (mod: string) => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
  addAuditLog?: (action: string, details: string) => void;
  conflicts?: ScheduleConflict[];
  customStaffFields?: CustomStaffField[];
  onSaveCustomField?: (field: CustomStaffField) => void;
  onDeleteCustomField?: (id: string) => void;
  rotationTemplates?: RotationTemplate[];
  onSaveRotationTemplate?: (template: RotationTemplate) => void;
  onDeleteRotationTemplate?: (id: string) => void;
  onApplyRotationShifts?: (newShifts: Shift[]) => void;
  smtpWebhookConfig?: SmtpWebhookConfig;
  onSaveSmtpWebhookConfig?: (config: SmtpWebhookConfig) => void;
}

export const AdminCenterView: React.FC<AdminCenterViewProps> = ({
  users,
  onSaveUser,
  onDeleteUser,
  sites,
  onSaveSite,
  onDeleteSite,
  workstations,
  onSaveWorkstation,
  onDeleteWorkstation,
  rules,
  onSaveRule,
  onDeleteRule,
  routingRules,
  onSaveRoutingRule,
  onDeleteRoutingRule,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onClearAllDemoData,
  onPurgeEverything,
  onExportBackup,
  onRestoreBackup,
  currentEnv = 'DEV',
  onEnvironmentChange,
  auditLogs,
  onClearAuditLogs,
  onExportAuditCsv,
  shifts,
  leaves,
  onBatchImport,
  onGenerateReportPdf,
  roles = DEFAULT_ROLES,
  onSaveRole = () => {},
  onDeleteRole = () => {},
  specialtiesList = DEFAULT_SPECIALTIES,
  onSaveSpecialty = () => {},
  onDeleteSpecialty = () => {},
  shiftWindows = DEFAULT_SHIFT_WINDOWS,
  onSaveShiftWindow = () => {},
  onDeleteShiftWindow = () => {},
  systemSettings = DEFAULT_SYSTEM_SETTINGS,
  onSaveSystemSettings = () => {},
  modalitiesList = INITIAL_MODALITIES,
  onSaveModality = () => {},
  onDeleteModality = () => {},
  theme = 'light',
  setTheme = () => {},
  addAuditLog = () => {},
  conflicts = [],
  customStaffFields = DEFAULT_CUSTOM_STAFF_FIELDS,
  onSaveCustomField = () => {},
  onDeleteCustomField = () => {},
  rotationTemplates = DEFAULT_ROTATION_TEMPLATES,
  onSaveRotationTemplate = () => {},
  onDeleteRotationTemplate = () => {},
  onApplyRotationShifts = () => {},
  smtpWebhookConfig = DEFAULT_SMTP_WEBHOOK_CONFIG,
  onSaveSmtpWebhookConfig = () => {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'roster' | 'roles' | 'specialties' | 'shift_windows' | 'custom_fields' | 'rotations' | 'policies' | 'settings' | 'sites' | 'workstations' | 'rules' | 'notifications' | 'routing' | 'environments' | 'import' | 'report' | 'audit'
  >('roster');

  // Rule State
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState<ComplianceRule['type']>('SITE_SUPERVISION');
  const [newRuleTarget, setNewRuleTarget] = useState(Object.keys(sites)[0] || 'MAIN');
  const [newRuleMin, setNewRuleMin] = useState(1);
  const [newRuleDays, setNewRuleDays] = useState<ComplianceRule['days']>('WEEKDAYS');

  // User State - Multi-specialty and separate Chief role
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<StaffUser['role']>('ATTENDING_RAD');
  const [newUserTitle, setNewUserTitle] = useState('MD');
  const [newUserSpecialties, setNewUserSpecialties] = useState<string[]>(['Body']);
  const [newUserSite, setNewUserSite] = useState(Object.keys(sites)[0] || 'MAIN');
  const [newUserAssignedSites, setNewUserAssignedSites] = useState<string[]>([Object.keys(sites)[0] || 'MAIN']);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserHomePc, setNewUserHomePc] = useState('');
  const [newUserContrast, setNewUserContrast] = useState(true);
  const [newUserPto, setNewUserPto] = useState<number>(30);
  const [newUserCme, setNewUserCme] = useState<number>(10);
  const [newUserCustomFields, setNewUserCustomFields] = useState<Record<string, any>>({});

  const userCountByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of users) {
      counts[u.role] = (counts[u.role] || 0) + 1;
    }
    return counts;
  }, [users]);

  // Workstation State
  const [editingWsId, setEditingWsId] = useState<string | null>(null);
  const [newWsId, setNewWsId] = useState('');
  const [newWsSite, setNewWsSite] = useState(Object.keys(sites)[0] || 'MAIN');
  const [newWsRoom, setNewWsRoom] = useState('');
  const [newWsMonitor, setNewWsMonitor] = useState('Dual Barco Coronis 5MP Mammo (FDA Certified)');

  // Production Purge Modal & File Ref
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (onRestoreBackup) {
          onRestoreBackup(data);
          alert('Database restored successfully from backup file!');
        }
      } catch (err) {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Site / Facility State
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [siteFormId, setSiteFormId] = useState('');
  const [siteFormName, setSiteFormName] = useState('');
  const [siteFormLabel, setSiteFormLabel] = useState('');
  const [siteFormSlots, setSiteFormSlots] = useState(4);
  const [siteFormWeekends, setSiteFormWeekends] = useState(false);
  const [siteFormContrast, setSiteFormContrast] = useState(true);
  const [siteFormModalities, setSiteFormModalities] = useState('MRI, CT, Ultrasound, X-Ray');

  // Routing Rule State
  const [editingRoutingId, setEditingRoutingId] = useState<string | null>(null);
  const [routingFormName, setRoutingFormName] = useState('');
  const [routingFormTrigger, setRoutingFormTrigger] = useState<NotificationRule['trigger']>('SHORTFALL_FLAGGED');
  const [routingFormSite, setRoutingFormSite] = useState('ALL');
  const [routingFormRecipients, setRoutingFormRecipients] = useState('lead-rads@organization.org');

  // Template State
  const [selectedScenario, setSelectedScenario] = useState('DAILY_SCHEDULE');
  const [newCustomScenario, setNewCustomScenario] = useState('');
  const [templateSubject, setTemplateSubject] = useState(templates.DAILY_SCHEDULE?.subject || '');
  const [templateBody, setTemplateBody] = useState(templates.DAILY_SCHEDULE?.body || '');
  const [testEmailFeedback, setTestEmailFeedback] = useState<string | null>(null);

  const [importType, setImportType] = useState<'USERS' | 'SITES' | 'WORKSTATIONS'>('USERS');
  const [rawImportData, setRawImportData] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [auditQuery, setAuditQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditDateRange, setAuditDateRange] = useState('ALL');
  const [auditUserFilter, setAuditUserFilter] = useState('ALL');
  const [exportFrequency, setExportFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [scheduledExportFeedback, setScheduledExportFeedback] = useState<string | null>(null);

  // Dual Environment State
  const [copiedEnvKey, setCopiedEnvKey] = useState<string | null>(null);
  const [shareAudience, setShareAudience] = useState<'MANAGERS' | 'RADS' | 'COORDINATORS' | 'CHIEFS'>('MANAGERS');

  const handleCopyEnvText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEnvKey(key);
    setTimeout(() => setCopiedEnvKey(null), 2500);
  };

  // RULE HANDLERS
  const handleCreateOrUpdateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;
    onSaveRule({
      id: editingRuleId || `rule-${Date.now()}`,
      name: newRuleName.trim(),
      type: newRuleType,
      target: newRuleTarget,
      minCount: newRuleMin,
      days: newRuleDays
    });
    setEditingRuleId(null);
    setNewRuleName('');
  };

  const handleStartEditRule = (r: ComplianceRule) => {
    setEditingRuleId(r.id);
    setNewRuleName(r.name);
    setNewRuleType(r.type);
    setNewRuleTarget(r.target);
    setNewRuleMin(r.minCount);
    setNewRuleDays(r.days);
  };

  const handleCancelEditRule = () => {
    setEditingRuleId(null);
    setNewRuleName('');
  };

  // USER HANDLERS
  const handleCreateOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    onSaveUser({
      id: editingUserId || `user-${Date.now()}`,
      name: newUserName.trim(),
      role: newUserRole,
      title: newUserTitle || (newUserRole === 'CHIEF' || newUserRole === 'ATTENDING_RAD' ? 'MD' : newUserRole === 'ADVANCED_PRACTITIONER' ? 'RPA-C' : 'MHA'),
      specialties: newUserSpecialties.length > 0 ? (newUserSpecialties as any) : ['Body'],
      primarySite: newUserSite,
      assignedSites: newUserAssignedSites.length > 0 ? newUserAssignedSites : [newUserSite],
      homePc: newUserHomePc ? newUserHomePc.toUpperCase() : undefined,
      email: newUserEmail || `${newUserName.toLowerCase().replace(/[^a-z0-9]/g, '')}@organization.org`,
      certContrast: newUserContrast,
      isArchived: false,
      fte: 1.0,
      allocatedAnnualPto: newUserPto,
      allocatedAnnualCme: newUserCme,
      customFields: newUserCustomFields
    });
    setEditingUserId(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserHomePc('');
    setNewUserSpecialties(['Body']);
    setNewUserAssignedSites([Object.keys(sites)[0] || 'MAIN']);
    setNewUserPto(30);
    setNewUserCme(10);
    setNewUserCustomFields({});
  };

  const handleStartEditUser = (u: StaffUser) => {
    setEditingUserId(u.id);
    setNewUserName(u.name);
    setNewUserRole(u.role);
    setNewUserTitle(u.title || 'MD');
    setNewUserSpecialties(u.specialties && u.specialties.length > 0 ? [...u.specialties] : ['Body']);
    setNewUserSite(u.primarySite || Object.keys(sites)[0] || 'MAIN');
    setNewUserAssignedSites(u.assignedSites && u.assignedSites.length > 0 ? [...u.assignedSites] : [u.primarySite || Object.keys(sites)[0] || 'MAIN']);
    setNewUserEmail(u.email || '');
    setNewUserHomePc(u.homePc || '');
    setNewUserContrast(!!u.certContrast);
    setNewUserPto(u.allocatedAnnualPto ?? 30);
    setNewUserCme(u.allocatedAnnualCme ?? 10);
    setNewUserCustomFields(u.customFields ? { ...u.customFields } : {});
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserHomePc('');
    setNewUserSpecialties(['Body']);
    setNewUserAssignedSites([Object.keys(sites)[0] || 'MAIN']);
    setNewUserPto(30);
    setNewUserCme(10);
    setNewUserCustomFields({});
  };

  // SITE HANDLERS
  const handleSaveOrUpdateSite = (e: React.FormEvent) => {
    e.preventDefault();
    const idToUse = editingSiteId || siteFormId.trim().toUpperCase() || `SITE-${Date.now()}`;
    const modalitiesArr = siteFormModalities.split(',').map(m => m.trim()).filter(Boolean);
    onSaveSite({
      id: idToUse,
      name: siteFormName.trim() || idToUse,
      label: siteFormLabel.trim().toUpperCase() || idToUse.slice(0, 4),
      slots: siteFormSlots,
      openWeekends: siteFormWeekends,
      requiresContrast: siteFormContrast,
      modalities: modalitiesArr
    });
    setEditingSiteId(null);
    setSiteFormId('');
    setSiteFormName('');
    setSiteFormLabel('');
  };

  const handleStartEditSite = (st: ClinicalSite) => {
    setEditingSiteId(st.id);
    setSiteFormId(st.id);
    setSiteFormName(st.name);
    setSiteFormLabel(st.label);
    setSiteFormSlots(st.slots);
    setSiteFormWeekends(!!st.openWeekends);
    setSiteFormContrast(!!st.requiresContrast);
    setSiteFormModalities(st.modalities ? st.modalities.join(', ') : 'MRI, CT, Ultrasound, X-Ray');
  };

  const handleCancelEditSite = () => {
    setEditingSiteId(null);
    setSiteFormId('');
    setSiteFormName('');
    setSiteFormLabel('');
  };

  // ROUTING HANDLERS
  const handleSaveOrUpdateRouting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routingFormName.trim()) return;
    onSaveRoutingRule({
      id: editingRoutingId || `route-${Date.now()}`,
      name: routingFormName.trim(),
      trigger: routingFormTrigger,
      site: routingFormSite,
      recipients: routingFormRecipients.trim(),
      enabled: true
    });
    setEditingRoutingId(null);
    setRoutingFormName('');
  };

  const handleStartEditRouting = (r: NotificationRule) => {
    setEditingRoutingId(r.id);
    setRoutingFormName(r.name);
    setRoutingFormTrigger(r.trigger);
    setRoutingFormSite(r.site);
    setRoutingFormRecipients(r.recipients);
  };

  const handleCancelEditRouting = () => {
    setEditingRoutingId(null);
    setRoutingFormName('');
  };

  // TEMPLATE HANDLERS
  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const key = newCustomScenario.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!key) return;
    onSaveTemplate(key, {
      subject: `[Notification] ${key.replace(/_/g, ' ')}`,
      body: `Hello {DoctorName},\n\nUpdate regarding ${key.replace(/_/g, ' ')} on {Date}.\n\nSincerely,\nRadiology Operations`
    });
    setSelectedScenario(key);
    setTemplateSubject(`[Notification] ${key.replace(/_/g, ' ')}`);
    setTemplateBody(`Hello {DoctorName},\n\nUpdate regarding ${key.replace(/_/g, ' ')} on {Date}.\n\nSincerely,\nRadiology Operations`);
    setNewCustomScenario('');
  };

  const handleDeleteCurrentTemplate = () => {
    if (!onDeleteTemplate) return;
    if (Object.keys(templates).length <= 1) {
      alert("At least one template must remain in the system.");
      return;
    }
    if (confirm(`Are you sure you want to delete template "${selectedScenario}"?`)) {
      onDeleteTemplate(selectedScenario);
      const remaining = Object.keys(templates).filter(k => k !== selectedScenario);
      if (remaining.length > 0) {
        setSelectedScenario(remaining[0]);
        setTemplateSubject(templates[remaining[0]]?.subject || '');
        setTemplateBody(templates[remaining[0]]?.body || '');
      }
    }
  };

  const handleCreateOrUpdateWs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsId.trim()) return;
    const wsIdToUse = editingWsId || newWsId.trim().toUpperCase();
    onSaveWorkstation({
      id: wsIdToUse,
      site: newWsSite,
      room: newWsRoom || 'Reading Pod',
      monitorType: newWsMonitor,
      isHome: newWsSite === 'REMOTE',
      currentRadId: null
    });
    setEditingWsId(null);
    setNewWsId('');
    setNewWsRoom('');
  };

  const handleStartEditWs = (ws: Workstation) => {
    setEditingWsId(ws.id);
    setNewWsId(ws.id);
    setNewWsSite(ws.site);
    setNewWsRoom(ws.room);
    setNewWsMonitor(ws.monitorType);
  };

  const handleCancelEditWs = () => {
    setEditingWsId(null);
    setNewWsId('');
    setNewWsRoom('');
  };

  const handleSaveCurrentTemplate = () => {
    onSaveTemplate(selectedScenario, { subject: templateSubject, body: templateBody });
    setTestEmailFeedback(`Saved template for ${selectedScenario}.`);
    setTimeout(() => setTestEmailFeedback(null), 3000);
  };

  const handleInsertTag = (tag: string) => {
    setTemplateBody(prev => `${prev} ${tag}`);
  };

  const handleExecuteBatchImport = () => {
    if (!rawImportData.trim()) return;
    onBatchImport(importType, rawImportData);
    setImportStatus(`Batch processing complete for ${importType}.`);
    setRawImportData('');
    setTimeout(() => setImportStatus(null), 4000);
  };

  const filteredLogs = auditLogs.filter(l => {
    if (auditQuery.trim()) {
      const q = auditQuery.toLowerCase();
      if (!l.user.toLowerCase().includes(q) && !l.actionType.toLowerCase().includes(q) && !l.details.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (auditActionFilter !== 'ALL') {
      if (auditActionFilter === 'SWAP' && !l.actionType.includes('SWAP')) return false;
      if (auditActionFilter === 'LEAVE' && !l.actionType.includes('LEAVE') && !l.actionType.includes('PTO')) return false;
      if (auditActionFilter === 'ROSTER' && !l.actionType.includes('USER') && !l.actionType.includes('STAFF')) return false;
      if (auditActionFilter === 'RULE' && !l.actionType.includes('RULE')) return false;
      if (auditActionFilter === 'SYSTEM' && !l.actionType.includes('SYSTEM') && !l.actionType.includes('BOOT')) return false;
    }
    if (auditUserFilter !== 'ALL' && l.user !== auditUserFilter) {
      return false;
    }
    if (auditDateRange !== 'ALL') {
      const now = new Date();
      const logDate = new Date(l.timestamp);
      if (auditDateRange === 'TODAY') {
        if (logDate.toDateString() !== now.toDateString()) return false;
      } else if (auditDateRange === '7DAYS') {
        if (now.getTime() - logDate.getTime() > 7 * 24 * 3600 * 1000) return false;
      } else if (auditDateRange === '30DAYS') {
        if (now.getTime() - logDate.getTime() > 30 * 24 * 3600 * 1000) return false;
      }
    }
    return true;
  });

  const handleRunScheduledExport = () => {
    const exportBundle = {
      facilityScheduleVersion: 'RadScheduler Pro v3.8 Compliance',
      exportedAt: new Date().toISOString(),
      frequency: exportFrequency,
      totalAuditEntries: filteredLogs.length,
      auditLogs: filteredLogs,
      activeComplianceRules: rules,
      scheduleCount: shifts.length,
      leavesCount: leaves.length,
      complianceStatus: 'VERIFIED_AUDIT_PASS'
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Scheduled_Compliance_Export_${exportFrequency}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('SCHEDULED_EXPORT', `Generated automated ${exportFrequency} compliance export bundle.`);
    setScheduledExportFeedback(`Generated & downloaded automated ${exportFrequency} compliance audit package (${filteredLogs.length} audit records).`);
    setTimeout(() => setScheduledExportFeedback(null), 5000);
  };

  return (
    <div className="space-y-6 text-[#eeedea]">
      
      {/* Navigation Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(238,237,234,0.1)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-light text-[#eeedea] tracking-tight">
            Administrative Command Center
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onExportBackup && (
            <button
              onClick={onExportBackup}
              className="bg-[#242429] hover:bg-[#2d2d33] text-[#eeedea] border border-[rgba(238,237,234,0.2)] text-xs py-1.5 px-3 rounded-xs cursor-pointer flex items-center gap-1.5 transition-colors font-mono"
              title="Download entire system database snapshot as JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#8eb9dd]" />
              <span>Export JSON</span>
            </button>
          )}

          {onRestoreBackup && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleRestoreFile}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#242429] hover:bg-[#2d2d33] text-[#eeedea] border border-[rgba(238,237,234,0.2)] text-xs py-1.5 px-3 rounded-xs cursor-pointer flex items-center gap-1.5 transition-colors font-mono"
                title="Restore database from JSON file"
              >
                <Upload className="w-3.5 h-3.5 text-[#8eb9dd]" />
                <span>Restore JSON</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowPurgeModal(true)}
            className="bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-700/60 font-mono text-xs py-1.5 px-3 rounded-xs cursor-pointer flex items-center gap-1.5 transition-colors font-bold shadow-xs"
            title="Purge all demo data for production deployment"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Purge Demo Data</span>
          </button>

          <button
            onClick={onGenerateReportPdf}
            className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs py-1.5 px-3 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors font-mono"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report PDF</span>
          </button>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'roster', label: 'Roster', icon: Users, count: users.length },
          { id: 'roles', label: 'Roles', icon: KeyRound, count: roles.length },
          { id: 'specialties', label: 'Specialties', icon: Palette, count: specialtiesList.length },
          { id: 'shift_windows', label: 'Shift Windows', icon: Clock, count: shiftWindows.length },
          { id: 'rules', label: 'Compliance Rules', icon: ShieldCheck, count: rules.length },
          { id: 'custom_fields', label: 'Custom Schema', icon: Sliders, count: customStaffFields.length },
          { id: 'rotations', label: 'Rotations', icon: Layers, count: rotationTemplates.length },
          { id: 'notifications', label: 'SMTP & Webhooks', icon: Bell },
          { id: 'policies', label: 'Governance', icon: ShieldCheck },
          { id: 'settings', label: 'Branding', icon: Settings },
          { id: 'sites', label: 'Sites', icon: Building2, count: Object.keys(sites).length },
          { id: 'workstations', label: 'Workstations', icon: Monitor, count: workstations.length },
          { id: 'routing', label: 'Alert Routing', icon: Route },
          { id: 'environments', label: 'Test', icon: Share2 },
          { id: 'import', label: 'Import', icon: Upload },
          { id: 'report', label: 'Reporting', icon: FileText },
          { id: 'audit', label: 'Audit & Exports', icon: History, count: auditLogs.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`meta-mono px-3 py-1.5 rounded-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-[#8eb9dd] text-black border-[#8eb9dd] font-bold shadow-xs' 
                  : 'bg-[#1c1c1f] text-[rgba(238,237,234,0.6)] border-[rgba(238,237,234,0.15)] hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1 py-0.2 rounded-xs font-mono text-[9px] ${
                  isActive ? 'bg-black text-[#8eb9dd]' : 'bg-[rgba(238,237,234,0.1)] text-[rgba(238,237,234,0.8)]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: COMPLIANCE RULES (No-Code Visual Compliance Rule & Constraint Builder) */}
      {activeSubTab === 'rules' && (
        <VisualRuleBuilderTab
          rules={rules}
          onSaveRule={onSaveRule}
          onDeleteRule={onDeleteRule}
          sites={sites}
          users={users}
          shifts={shifts}
          conflicts={conflicts}
        />
      )}

      {/* SUB-TAB: DYNAMIC STAFF CUSTOM FIELD & ATTRIBUTE SCHEMA */}
      {activeSubTab === 'custom_fields' && (
        <CustomStaffFieldsTab
          customFields={customStaffFields}
          onSaveCustomField={onSaveCustomField}
          onDeleteCustomField={onDeleteCustomField}
          users={users}
        />
      )}

      {/* SUB-TAB: MULTI-WEEK RECURRING ROTATION TEMPLATE ENGINE */}
      {activeSubTab === 'rotations' && (
        <RotationTemplateTab
          templates={rotationTemplates}
          onSaveTemplate={onSaveRotationTemplate}
          onDeleteTemplate={onDeleteRotationTemplate}
          users={users}
          sites={sites}
          onApplyRotationToSchedule={onApplyRotationShifts}
        />
      )}

      {/* SUB-TAB: OUTBOUND NOTIFICATION INTEGRATIONS & SMTP/WEBHOOK HUB */}
      {activeSubTab === 'notifications' && (
        <NotificationWebhookTab
          config={smtpWebhookConfig}
          onSaveConfig={onSaveSmtpWebhookConfig}
          addAuditLog={addAuditLog}
        />
      )}

      {/* SUB-TAB 2: ROSTER */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="meta-mono text-[#8eb9dd]">
                {editingUserId ? `Edit Clinician: ${newUserName}` : 'Add Clinician to Directory'}
              </h3>
              {editingUserId && (
                <button
                  type="button"
                  onClick={handleCancelEditUser}
                  className="meta-mono text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleCreateOrUpdateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                <div>
                  <label className="block meta-mono mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                    placeholder="e.g. Dr. Jordan Lee"
                    className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                  />
                </div>

                <div>
                  <label className="block meta-mono mb-1">Governance Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                  >
                    <option value="CHIEF">Department Chief (MD, Lead)</option>
                    <option value="ATTENDING_RAD">Attending Radiologist (MD/DO)</option>
                    <option value="ADVANCED_PRACTITIONER">Adv. Practitioner (RPA / NP)</option>
                    <option value="MANAGER">Scheduling Coordinator</option>
                    <option value="ADMIN">Systems & Operations Admin</option>
                    <option value="FELLOW_RESIDENT">Clinical Fellow / Resident</option>
                  </select>
                </div>

                <div>
                  <label className="block meta-mono mb-1">Title / Credentials</label>
                  <input
                    type="text"
                    value={newUserTitle}
                    onChange={(e) => setNewUserTitle(e.target.value)}
                    placeholder="MD, FACR"
                    className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea]"
                  />
                </div>

                <div>
                  <label className="block meta-mono mb-1">Primary Facility</label>
                  <select
                    value={newUserSite}
                    onChange={(e) => setNewUserSite(e.target.value)}
                    className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                  >
                    {Object.values(sites).length === 0 ? (
                      <option value="">No Facilities Configured</option>
                    ) : (
                      Object.values(sites).map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.label})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block meta-mono mb-1">Home Rig Tag</label>
                  <input
                    type="text"
                    value={newUserHomePc}
                    onChange={(e) => setNewUserHomePc(e.target.value)}
                    placeholder="e.g. LEE-HOME-RIG"
                    className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono uppercase text-[#eeedea]"
                  />
                </div>

                <div>
                  <label className="block meta-mono mb-1">Email</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="clinician@organization.org"
                    className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea]"
                  />
                </div>
              </div>

              {/* Per-Staff PTO Allocation Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#111113] p-3 rounded-xs border border-white/10">
                <div>
                  <label className="block meta-mono mb-1 text-[#8eb9dd] font-bold">Annual PTO Allocation (Days)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    step={0.5}
                    value={newUserPto}
                    onChange={(e) => setNewUserPto(Number(e.target.value))}
                    className="w-full bg-black/60 border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono text-[#8eb9dd] font-bold text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Allocated annual PTO per clinician (days)</span>
                </div>
                <div>
                  <label className="block meta-mono mb-1 text-purple-300 font-bold">Annual CME Allocation (Days)</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={0.5}
                    value={newUserCme}
                    onChange={(e) => setNewUserCme(Number(e.target.value))}
                    className="w-full bg-black/60 border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono text-purple-300 font-bold text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Allocated CME training / conference days</span>
                </div>
              </div>

              {/* Multi-Specialty Assignment Area */}
              <div className="bg-[#111113] p-3 rounded-xs border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block meta-mono text-[#8eb9dd] font-bold text-xs">
                    Assigned Clinical Specialties (Radiologists can hold multiple specialties)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {newUserSpecialties.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {specialtiesList.map((spec: ClinicalSpecialty) => {
                    const isSelected = newUserSpecialties.includes(spec.id);
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (newUserSpecialties.length > 1) {
                              setNewUserSpecialties(newUserSpecialties.filter(s => s !== spec.id));
                            }
                          } else {
                            setNewUserSpecialties([...newUserSpecialties, spec.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xs font-mono text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                          isSelected 
                            ? 'text-white border-white/40 shadow-sm' 
                            : 'text-slate-400 border-white/10 bg-black/40 hover:border-white/20'
                        }`}
                        style={isSelected ? { backgroundColor: `${spec.color}33`, borderColor: spec.color, color: spec.color } : {}}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: spec.color }} />
                        <span>{spec.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Site Coverage Assignment Area */}
              <div className="bg-[#111113] p-3 rounded-xs border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block meta-mono text-[#8eb9dd] font-bold text-xs">
                    Assigned Clinical Facilities / Sites (Multi-Site Coverage)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {newUserAssignedSites.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {Object.values(sites).map(st => {
                    const isSelected = newUserAssignedSites.includes(st.id) || newUserSite === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (newUserAssignedSites.length > 1 && st.id !== newUserSite) {
                              setNewUserAssignedSites(newUserAssignedSites.filter(s => s !== st.id));
                            }
                          } else {
                            setNewUserAssignedSites([...newUserAssignedSites, st.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xs font-mono text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                          isSelected 
                            ? 'text-[#8eb9dd] border-[#8eb9dd] bg-[#8eb9dd]/20 shadow-sm' 
                            : 'text-slate-400 border-white/10 bg-black/40 hover:border-white/20'
                        }`}
                      >
                        <Building2 className="w-3 h-3 text-[#8eb9dd]" />
                        <span>{st.name} ({st.label})</span>
                        {isSelected && <Check className="w-3 h-3 text-[#8eb9dd]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Custom Staff Attributes from Schema */}
              {customStaffFields && customStaffFields.length > 0 && (
                <div className="bg-[#111113] p-3 rounded-xs border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block meta-mono text-[#8eb9dd] font-bold text-xs">
                      Practice-Specific Custom Attributes ({customStaffFields.length})
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Defined in Custom Schema
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {customStaffFields.map(fld => (
                      <div key={fld.id}>
                        <label className="block meta-mono mb-1 text-[11px] text-slate-300">
                          {fld.label} {fld.required && <span className="text-rose-400">*</span>}
                        </label>
                        {fld.type === 'boolean' ? (
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={!!newUserCustomFields[fld.key]}
                              onChange={(e) => setNewUserCustomFields(prev => ({ ...prev, [fld.key]: e.target.checked }))}
                              className="rounded accent-[#8eb9dd] w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs text-white">{fld.label} Enabled</span>
                          </label>
                        ) : fld.type === 'date' ? (
                          <input
                            type="date"
                            value={newUserCustomFields[fld.key] || ''}
                            onChange={(e) => setNewUserCustomFields(prev => ({ ...prev, [fld.key]: e.target.value }))}
                            className="w-full bg-black/60 border border-white/15 rounded-xs p-2 text-white font-mono text-xs"
                          />
                        ) : fld.type === 'number' ? (
                          <input
                            type="number"
                            value={newUserCustomFields[fld.key] ?? ''}
                            onChange={(e) => setNewUserCustomFields(prev => ({ ...prev, [fld.key]: Number(e.target.value) }))}
                            placeholder="0"
                            className="w-full bg-black/60 border border-white/15 rounded-xs p-2 text-white font-mono text-xs"
                          />
                        ) : (
                          <input
                            type="text"
                            value={newUserCustomFields[fld.key] || ''}
                            onChange={(e) => setNewUserCustomFields(prev => ({ ...prev, [fld.key]: e.target.value }))}
                            placeholder={`Enter ${fld.label.toLowerCase()}`}
                            className="w-full bg-black/60 border border-white/15 rounded-xs p-2 text-white text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#8eb9dd]">
                  <input
                    type="checkbox"
                    checked={newUserContrast}
                    onChange={(e) => setNewUserContrast(e.target.checked)}
                    className="accent-[#8eb9dd] rounded"
                  />
                  <span>Certified for On-Site IV Contrast Supervision</span>
                </label>

                <div className="flex items-center gap-2">
                  {editingUserId && (
                    <button
                      type="button"
                      onClick={handleCancelEditUser}
                      className="px-3 py-1.5 border border-white/20 text-slate-400 hover:text-white rounded-xs font-mono"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold py-2 px-5 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingUserId ? 'Update Staff Member' : 'Save Staff Member'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-[#1c1c1f] rounded-xs border border-[rgba(238,237,234,0.1)] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#242429] text-[rgba(238,237,234,0.5)] uppercase meta-mono border-b border-[rgba(238,237,234,0.08)]">
                  <th className="p-3">Staff Clinician</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Specialties</th>
                  <th className="p-3">Facility</th>
                  <th className="p-3">PTO / CME Allotment</th>
                  <th className="p-3">Home Rig Asset</th>
                  <th className="p-3">Contrast Cert</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(238,237,234,0.06)] font-medium text-xs">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center meta-mono text-slate-400 italic">
                      No staff personnel registered. Add clinicians above.
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-[rgba(238,237,234,0.02)] transition-colors">
                      <td className="p-3 font-semibold text-[#eeedea]">
                        {formatPersonName(u.name, u.role, u.title)}
                      </td>
                      <td className="p-3 meta-mono">
                        {u.role === 'CHIEF' ? (
                          <span className="text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                            CHIEF (MD)
                          </span>
                        ) : u.role === 'ADMIN' ? (
                          <span className="text-[#8eb9dd] font-bold bg-[#8eb9dd]/10 px-2 py-0.5 rounded border border-[#8eb9dd]/30">
                            ADMIN
                          </span>
                        ) : u.role === 'ATTENDING_RAD' ? (
                          <span className="text-sky-300">Attending MD</span>
                        ) : u.role === 'ADVANCED_PRACTITIONER' ? (
                          <span className="text-emerald-300">Adv. Practitioner</span>
                        ) : (
                          <span>{u.role}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {u.specialties.map(spec => (
                            <span 
                              key={spec}
                              className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#111113] text-[#8eb9dd] border border-white/10"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-[#eeedea]">
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#111113] text-[#8eb9dd] border border-[#8eb9dd]/30">
                            {sites[u.primarySite]?.label || u.primarySite || 'None'}
                          </span>
                          {u.assignedSites?.filter(s => s !== u.primarySite).map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono text-slate-300 bg-white/5 border border-white/10">
                              {sites[s]?.label || s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs">
                        <span className="text-[#8eb9dd] font-bold">{u.allocatedAnnualPto ?? 30}d PTO</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-purple-300 font-bold">{u.allocatedAnnualCme ?? 10}d CME</span>
                      </td>
                      <td className="p-3 font-mono text-[#8eb9dd]">{u.homePc || '&mdash;'}</td>
                      <td className="p-3 meta-mono text-emerald-400">{u.certContrast ? 'YES' : 'NO'}</td>
                      <td className="p-3 font-mono opacity-60">{u.email}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditUser(u)}
                            className="p-1 text-[rgba(238,237,234,0.6)] hover:text-[#8eb9dd] cursor-pointer"
                            title="Edit Clinician Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove clinician "${u.name}"?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1 text-[rgba(238,237,234,0.4)] hover:text-rose-400 cursor-pointer"
                            title="Remove Clinician"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: ROLE & RBAC EDITOR */}
      {activeSubTab === 'roles' && (
        <RoleEditorTab 
          roles={roles}
          onSaveRole={onSaveRole}
          onDeleteRole={onDeleteRole}
          userCountByRole={userCountByRole}
        />
      )}

      {/* SUB-TAB: CLINICAL SPECIALTIES & MODALITIES */}
      {activeSubTab === 'specialties' && (
        <SpecialtiesManagerTab
          specialties={specialtiesList}
          onSaveSpecialty={onSaveSpecialty}
          onDeleteSpecialty={onDeleteSpecialty}
          modalities={modalitiesList}
          onSaveModality={onSaveModality}
          onDeleteModality={onDeleteModality}
        />
      )}

      {/* SUB-TAB: SHIFT WINDOWS */}
      {activeSubTab === 'shift_windows' && (
        <ShiftWindowsTab
          shiftWindows={shiftWindows}
          onSaveShiftWindow={onSaveShiftWindow}
          onDeleteShiftWindow={onDeleteShiftWindow}
        />
      )}

      {/* SUB-TAB: SUPERVISION & COMPLIANCE GOVERNANCE */}
      {activeSubTab === 'policies' && (
        <CompliancePoliciesTab
          settings={systemSettings}
          onSaveSettings={onSaveSystemSettings}
          addAuditLog={addAuditLog}
        />
      )}

      {/* SUB-TAB: PRACTICE BRANDING & SYSTEM CONFIGURATION */}
      {activeSubTab === 'settings' && (
        <SystemSettingsTab
          settings={systemSettings}
          onSaveSettings={onSaveSystemSettings}
          theme={theme}
          setTheme={setTheme}
          onExportBackup={onExportBackup}
          onRestoreBackup={onRestoreBackup}
          addAuditLog={addAuditLog}
        />
      )}

      {/* SUB-TAB 3: TERMINAL REGISTRY */}
      {activeSubTab === 'workstations' && (
        <div className="space-y-4">
          <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="meta-mono text-[#8eb9dd]">
                {editingWsId ? `Edit Terminal: ${editingWsId}` : 'Register Diagnostic Workstation PC'}
              </h3>
              {editingWsId && (
                <button
                  type="button"
                  onClick={handleCancelEditWs}
                  className="meta-mono text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleCreateOrUpdateWs} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
              <div>
                <label className="block meta-mono mb-1">Asset Tag</label>
                <input
                  type="text"
                  value={newWsId}
                  onChange={(e) => setNewWsId(e.target.value)}
                  disabled={!!editingWsId}
                  required
                  placeholder="e.g. RAD-WS-PJ-03"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono uppercase text-[#8eb9dd] font-bold disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1">Facility</label>
                <select
                  value={newWsSite}
                  onChange={(e) => setNewWsSite(e.target.value)}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                >
                  {Object.values(sites).length === 0 ? (
                    <option value="">No Facilities Configured</option>
                  ) : (
                    Object.values(sites).map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.label})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block meta-mono mb-1">Reading Pod Room</label>
                <input
                  type="text"
                  value={newWsRoom}
                  onChange={(e) => setNewWsRoom(e.target.value)}
                  placeholder="e.g. MSK Reading Pod 3"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea]"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1">Display Profile</label>
                <input
                  type="text"
                  value={newWsMonitor}
                  onChange={(e) => setNewWsMonitor(e.target.value)}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono text-xs text-[#eeedea]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold py-2 px-3 rounded-xs shadow-xs cursor-pointer h-9 flex items-center justify-center gap-1 font-mono"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingWsId ? 'Update Terminal' : 'Register PC'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workstations.length === 0 ? (
              <div className="col-span-full bg-[#1c1c1f] p-8 rounded-xs border border-[rgba(238,237,234,0.1)] text-center meta-mono text-slate-400 italic">
                No diagnostic workstations registered. Add one using the form above.
              </div>
            ) : (
              workstations.map(ws => (
                <div key={ws.id} className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#8eb9dd] flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5" />
                      {ws.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditWs(ws)}
                        className="p-1 text-[rgba(238,237,234,0.6)] hover:text-[#8eb9dd] cursor-pointer"
                        title="Edit Workstation"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove terminal "${ws.id}"?`)) {
                            onDeleteWorkstation(ws.id);
                          }
                        }}
                        className="p-1 text-[rgba(238,237,234,0.4)] hover:text-rose-400 cursor-pointer"
                        title="Remove Terminal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-[#eeedea]">{ws.room} &bull; {ws.site}</p>
                  <p className="meta-mono opacity-60 text-[10px]">{ws.monitorType}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FACILITIES */}
      {activeSubTab === 'sites' && (
        <div className="space-y-4">
          <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="meta-mono text-[#8eb9dd]">
                {editingSiteId ? `Edit Facility: ${siteFormName}` : 'Configure Clinical Facility'}
              </h3>
              {editingSiteId && (
                <button
                  type="button"
                  onClick={handleCancelEditSite}
                  className="meta-mono text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSaveOrUpdateSite} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block meta-mono mb-1">Facility Code / ID</label>
                <input
                  type="text"
                  value={siteFormId}
                  onChange={(e) => setSiteFormId(e.target.value)}
                  disabled={!!editingSiteId}
                  required
                  placeholder="e.g. DOWNTOWN or NHP"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono uppercase text-[#8eb9dd] font-bold disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1">Facility Display Name (Full Name)</label>
                <input
                  type="text"
                  value={siteFormName}
                  onChange={(e) => setSiteFormName(e.target.value)}
                  required
                  placeholder="e.g. Downtown Outpatient Imaging Pavilion"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1">Short Label (Badge)</label>
                <input
                  type="text"
                  value={siteFormLabel}
                  onChange={(e) => setSiteFormLabel(e.target.value)}
                  required
                  placeholder="e.g. DTIP"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono uppercase text-[#eeedea]"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1">Daily Reading Slots</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={siteFormSlots}
                  onChange={(e) => setSiteFormSlots(Number(e.target.value))}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono font-bold text-[#8eb9dd]"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block meta-mono mb-1">Modalities Covered (Comma Separated)</label>
                <input
                  type="text"
                  value={siteFormModalities}
                  onChange={(e) => setSiteFormModalities(e.target.value)}
                  placeholder="e.g. MRI, CT, Ultrasound, Mammography"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea]"
                />
              </div>

              <div className="flex items-center gap-4 lg:col-span-1 pt-4">
                <label className="flex items-center gap-2 cursor-pointer meta-mono text-xs">
                  <input
                    type="checkbox"
                    checked={siteFormWeekends}
                    onChange={(e) => setSiteFormWeekends(e.target.checked)}
                    className="rounded border-[rgba(238,237,234,0.2)] bg-[#111113] text-[#8eb9dd] w-4 h-4 cursor-pointer"
                  />
                  <span>Open Weekends</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer meta-mono text-xs">
                  <input
                    type="checkbox"
                    checked={siteFormContrast}
                    onChange={(e) => setSiteFormContrast(e.target.checked)}
                    className="rounded border-[rgba(238,237,234,0.2)] bg-[#111113] text-[#8eb9dd] w-4 h-4 cursor-pointer"
                  />
                  <span>Contrast Supervision</span>
                </label>
              </div>

              <div className="flex items-end lg:col-span-1">
                <button
                  type="submit"
                  className="w-full bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold py-2 px-3 rounded-xs shadow-xs cursor-pointer h-9 flex items-center justify-center gap-1 font-mono"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingSiteId ? 'Update Facility' : 'Save Facility'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {Object.values(sites).length === 0 ? (
              <div className="col-span-full bg-[#1c1c1f] p-8 rounded-xs border border-[rgba(238,237,234,0.1)] text-center meta-mono text-slate-400 italic">
                No clinical facilities configured. Add your first clinical site using the form above.
              </div>
            ) : (
              Object.values(sites).map(st => (
                <div key={st.id} className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-[#eeedea]">{st.name} ({st.label})</strong>
                    <div className="flex items-center gap-2">
                      <span className="meta-mono text-[#8eb9dd]">
                        {st.slots} SLOTS
                      </span>
                      <button
                        onClick={() => handleStartEditSite(st)}
                        className="p-1 text-[rgba(238,237,234,0.6)] hover:text-[#8eb9dd] cursor-pointer"
                        title="Edit Facility"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove facility "${st.name}"?`)) {
                            onDeleteSite(st.id);
                          }
                        }}
                        className="p-1 text-[rgba(238,237,234,0.4)] hover:text-rose-400 cursor-pointer"
                        title="Remove Facility"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="meta-mono space-y-1 opacity-70">
                    <p>Weekends: {st.openWeekends ? 'OPEN' : 'CLOSED'}</p>
                    <p>Contrast Required: {st.requiresContrast ? 'MANDATORY' : 'EXEMPT'}</p>
                    <p className="truncate">Modalities: {st.modalities?.join(', ') || 'All Modalities'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ALERT ROUTING & TEMPLATES */}
      {activeSubTab === 'routing' && (
        <div className="space-y-6">
          {/* Top Half: Routing Rule Configuration & List */}
          <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="meta-mono text-[#8eb9dd]">
                {editingRoutingId ? `Edit Routing Rule: ${routingFormName}` : 'Configure Notification Routing Rule'}
              </h3>
              {editingRoutingId && (
                <button
                  type="button"
                  onClick={handleCancelEditRouting}
                  className="meta-mono text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSaveOrUpdateRouting} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block meta-mono mb-1">Rule Name</label>
                <input
                  type="text"
                  value={routingFormName}
                  onChange={(e) => setRoutingFormName(e.target.value)}
                  required
                  placeholder="e.g. Critical Deficit Alert"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1">Trigger Event</label>
                <select
                  value={routingFormTrigger}
                  onChange={(e) => setRoutingFormTrigger(e.target.value as NotificationRule['trigger'])}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                >
                  <option value="SHORTFALL_FLAGGED">Clinical Staffing Shortfall Flagged</option>
                  <option value="CONTRAST_ASSIGNED">Contrast Supervisor Assigned</option>
                  <option value="SHIFT_ASSIGNED">Shift Assignment Dispatched</option>
                  <option value="AP_SCHEDULED">Advanced Practitioner Scheduled</option>
                  <option value="LEAVE_DECISION">Leave Request Decision</option>
                </select>
              </div>

              <div>
                <label className="block meta-mono mb-1">Facility Scope</label>
                <select
                  value={routingFormSite}
                  onChange={(e) => setRoutingFormSite(e.target.value)}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                >
                  <option value="ALL">All Facilities</option>
                  {Object.values(sites).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.label})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold py-2 px-3 rounded-xs shadow-xs cursor-pointer h-9 flex items-center justify-center gap-1 font-mono"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingRoutingId ? 'Update Rule' : 'Save Routing Rule'}</span>
                </button>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block meta-mono mb-1">Recipients (Email addresses or provider tokens)</label>
                <input
                  type="text"
                  value={routingFormRecipients}
                  onChange={(e) => setRoutingFormRecipients(e.target.value)}
                  required
                  placeholder="e.g. assigned_rad, chief@organization.org, ops@organization.org"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-mono text-[11px]"
                />
              </div>
            </form>
          </div>

          {/* Active Routing Rules Grid */}
          <div className="space-y-2">
            <h4 className="meta-mono text-xs text-[#8eb9dd]">Active Routing Rules ({routingRules.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {routingRules.length === 0 ? (
                <div className="col-span-full bg-[#1c1c1f] p-6 rounded-xs border border-[rgba(238,237,234,0.1)] text-center meta-mono text-slate-400 italic">
                  No routing rules configured. Create your first notification rule above.
                </div>
              ) : (
                routingRules.map(r => (
                  <div key={r.id} className="p-3 bg-[#1c1c1f] rounded-xs border border-[rgba(238,237,234,0.1)] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#eeedea]">{r.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEditRouting(r)}
                          className="p-1 text-[rgba(238,237,234,0.6)] hover:text-[#8eb9dd] cursor-pointer"
                          title="Edit Routing Rule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete routing rule "${r.name}"?`)) {
                              onDeleteRoutingRule(r.id);
                            }
                          }}
                          className="p-1 text-[rgba(238,237,234,0.4)] hover:text-rose-400 cursor-pointer"
                          title="Delete Routing Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="meta-mono text-[11px] text-[#8eb9dd]">Trigger: {r.trigger} &bull; Scope: {r.site}</p>
                    <p className="meta-mono text-[10px] truncate opacity-50">Recipients: {r.recipients}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Half: Notification Template Editor & Custom Scenarios */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 border-t border-[rgba(238,237,234,0.1)]">
            <div className="lg:col-span-7 bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="meta-mono text-[#8eb9dd]">
                  Notification Template Editor
                </h3>
                {onDeleteTemplate && Object.keys(templates).length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentTemplate}
                    className="meta-mono text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer flex items-center gap-1"
                    title="Delete this template"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Template</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block meta-mono mb-1">Scenario Template</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => {
                    setSelectedScenario(e.target.value);
                    const tmpl = templates[e.target.value];
                    if (tmpl) {
                      setTemplateSubject(tmpl.subject);
                      setTemplateBody(tmpl.body);
                    }
                  }}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                >
                  {Object.keys(templates).length === 0 ? (
                    <option value="">No Templates Configured</option>
                  ) : (
                    Object.keys(templates).map(scenarioKey => (
                      <option key={scenarioKey} value={scenarioKey}>
                        {scenarioKey.replace(/_/g, ' ')}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="p-2.5 bg-[#111113] rounded-xs border border-[rgba(238,237,234,0.1)] space-y-1">
                <span className="meta-mono text-[9px] block">Insert Dynamic Token:</span>
                <div className="flex flex-wrap gap-1">
                  {['{DoctorName}', '{Date}', '{Site}', '{Hours}', '{Workstation}', '{Modality}', '{Specialty}', '{Details}', '{SupervisingMD}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInsertTag(tag)}
                      className="meta-mono text-[9px] px-1.5 py-0.5 rounded-xs bg-[#242429] hover:bg-[#2a2a30] text-[#8eb9dd] border border-[rgba(142, 185, 221,0.2)] cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block meta-mono mb-1">Subject</label>
                <input
                  type="text"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs px-3 py-2 text-[#eeedea] font-bold"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1">Body</label>
                <textarea
                  rows={5}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2.5 font-mono text-[11px] text-[#eeedea]"
                />
              </div>

              {testEmailFeedback && <p className="text-[#8eb9dd] meta-mono">{testEmailFeedback}</p>}

              <div className="flex justify-between items-center pt-2 border-t border-[rgba(238,237,234,0.1)]">
                <button
                  type="button"
                  onClick={() => {
                    setTestEmailFeedback(`Simulated dispatch to active user with template "${selectedScenario}".`);
                    setTimeout(() => setTestEmailFeedback(null), 3000);
                  }}
                  className="meta-mono bg-transparent border border-[rgba(238,237,234,0.15)] hover:border-[#8eb9dd] px-3 py-1.5 text-xs text-[#eeedea] hover:text-[#8eb9dd] rounded-xs cursor-pointer"
                >
                  Test Dispatch
                </button>

                <button
                  type="button"
                  onClick={handleSaveCurrentTemplate}
                  className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold px-4 py-1.5 rounded-xs cursor-pointer font-mono text-xs"
                >
                  Save Template
                </button>
              </div>
            </div>

            {/* Right side: Add New Custom Scenario */}
            <div className="lg:col-span-5 bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3 text-xs">
              <h3 className="meta-mono text-[#8eb9dd]">
                Create Custom Template Scenario
              </h3>
              <p className="text-slate-400 text-[11px]">
                Define a new notification scenario (e.g. ON_CALL_PAGER_ALERT, HOLIDAY_STANDBY) to support custom hospital workflows.
              </p>
              <form onSubmit={handleAddTemplate} className="space-y-3">
                <div>
                  <label className="block meta-mono mb-1">Scenario Key Identifier</label>
                  <input
                    type="text"
                    value={newCustomScenario}
                    onChange={(e) => setNewCustomScenario(e.target.value)}
                    required
                    placeholder="e.g. URGENT_PAC_ALERT"
                    className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 uppercase font-mono text-[#8eb9dd] font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#242429] hover:bg-[#2d2d34] text-white border border-[rgba(238,237,234,0.2)] font-bold py-2 rounded-xs cursor-pointer font-mono flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8eb9dd]" />
                  <span>Add Scenario Template</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: DUAL ENVIRONMENTS */}
      {activeSubTab === 'environments' && (
        <div className="space-y-6">
          {/* Header Overview Card */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(238,237,234,0.1)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-[#8eb9dd]/15 text-[#8eb9dd] border border-[#8eb9dd]/30">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="meta-mono text-base text-[#eeedea] font-bold">
                    AI Studio Dual-Environment Topology
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Isolated cloud endpoints segregating active developer prompt iterations from physician acceptance testing.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="meta-mono text-[11px] text-slate-400">Current Simulation:</span>
                <span className={`meta-mono px-2.5 py-1 rounded text-xs font-bold ${
                  currentEnv === 'SHARED'
                    ? 'bg-[#142e23] border border-[#34d399]/50 text-[#34d399]'
                    : 'bg-[#1b253b] border border-[#38bdf8]/50 text-[#38bdf8]'
                }`}>
                  {currentEnv === 'SHARED' ? 'CLINICAL PREVIEW (SHARED)' : 'DEVELOPMENT INSTANCE (DEV)'}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              To preserve uninterrupted testing for clinical operations, AI Studio maintains two distinct cloud preview instances. 
              Engineering edits, AI component refactorings, and prompt adjustments execute on the <strong>Development App URL</strong>, 
              while healthcare stakeholders (Clinical Managers, Lead Radiologists, Section Chiefs) test verified schedules, PTO requests, 
              and contrast oversight rules on the protected <strong>Shared App URL</strong>.
            </p>
          </div>

          {/* Dual Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 1. Development App Card */}
            <div className={`p-5 rounded-xs border transition-all space-y-4 ${
              currentEnv === 'DEV'
                ? 'bg-[#1b253b]/40 border-[#38bdf8] shadow-[0_0_24px_rgba(56,189,248,0.15)] ring-1 ring-[#38bdf8]/40'
                : 'bg-[#1c1c1f] border-[rgba(238,237,234,0.1)]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#38bdf8]" />
                  <span className="font-mono font-bold text-sm text-white">Development App URL</span>
                </div>
                <span className="meta-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#38bdf8] text-black">
                  ACTIVE ITERATION
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Use for continuous prompt-driven edits, component refinement, algorithmic scheduling tuning, and real-time UI/UX adjustments.
              </p>

              <div className="space-y-1.5">
                <label className="meta-mono text-[10px] uppercase text-slate-400">Development Endpoint URL</label>
                <div className="p-2.5 rounded bg-[#111113] border border-[rgba(238,237,234,0.15)] flex items-center justify-between gap-2 font-mono text-xs text-[#38bdf8]">
                  <span className="truncate">{AI_STUDIO_DEV_URL}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyEnvText(AI_STUDIO_DEV_URL, 'dev-url-admin')}
                      className="p-1 hover:text-white transition-colors cursor-pointer text-slate-400"
                      title="Copy URL"
                    >
                      {copiedEnvKey === 'dev-url-admin' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={AI_STUDIO_DEV_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:text-white transition-colors cursor-pointer text-slate-400"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#111113] rounded border border-[rgba(238,237,234,0.08)] space-y-1 meta-mono text-[11px]">
                <div className="text-slate-400 uppercase text-[9px] font-bold">Target Audience:</div>
                <div className="text-slate-200">Software Engineers, Prompt Designers & Technical Ops</div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedEnvironment('DEV');
                    if (onEnvironmentChange) onEnvironmentChange('DEV');
                  }}
                  className={`w-full py-2 px-3 rounded-xs font-mono text-xs font-bold transition-all cursor-pointer ${
                    currentEnv === 'DEV'
                      ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/50'
                      : 'bg-[#242429] text-white hover:bg-[#2d2d33] border border-[rgba(238,237,234,0.2)]'
                  }`}
                >
                  {currentEnv === 'DEV' ? '✓ Currently Active (Dev Instance)' : 'Switch View to Dev Instance'}
                </button>
              </div>
            </div>

            {/* 2. Shared Clinical Testing Card */}
            <div className={`p-5 rounded-xs border transition-all space-y-4 ${
              currentEnv === 'SHARED'
                ? 'bg-[#142e23]/40 border-[#34d399] shadow-[0_0_24px_rgba(52,211,153,0.15)] ring-1 ring-[#34d399]/40'
                : 'bg-[#1c1c1f] border-[rgba(238,237,234,0.1)]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#34d399]" />
                  <span className="font-mono font-bold text-sm text-white">Shared App URL (Clinical Testing)</span>
                </div>
                <span className="meta-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#34d399] text-black">
                  STAKEHOLDER SAFE
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Send to clinical managers, lead radiologists, or scheduling coordinators to test workflows without being disrupted by intermediate code changes.
              </p>

              <div className="space-y-1.5">
                <label className="meta-mono text-[10px] uppercase text-slate-400">Clinical Testing Endpoint URL</label>
                <div className="p-2.5 rounded bg-[#111113] border border-[rgba(238,237,234,0.15)] flex items-center justify-between gap-2 font-mono text-xs text-[#34d399]">
                  <span className="truncate">{AI_STUDIO_SHARED_URL}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyEnvText(AI_STUDIO_SHARED_URL, 'shared-url-admin')}
                      className="p-1 hover:text-white transition-colors cursor-pointer text-slate-400"
                      title="Copy URL"
                    >
                      {copiedEnvKey === 'shared-url-admin' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={AI_STUDIO_SHARED_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:text-white transition-colors cursor-pointer text-slate-400"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#111113] rounded border border-[rgba(238,237,234,0.08)] space-y-1 meta-mono text-[11px]">
                <div className="text-slate-400 uppercase text-[9px] font-bold">Target Audience:</div>
                <div className="text-slate-200">Clinical Managers, Lead Radiologists & Scheduling Coordinators</div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedEnvironment('SHARED');
                    if (onEnvironmentChange) onEnvironmentChange('SHARED');
                  }}
                  className={`w-full py-2 px-3 rounded-xs font-mono text-xs font-bold transition-all cursor-pointer ${
                    currentEnv === 'SHARED'
                      ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/50'
                      : 'bg-[#242429] text-white hover:bg-[#2d2d33] border border-[rgba(238,237,234,0.2)]'
                  }`}
                >
                  {currentEnv === 'SHARED' ? '✓ Currently Active (Clinical Testing View)' : 'Switch View to Clinical Testing Instance'}
                </button>
              </div>
            </div>

          </div>

          {/* Stakeholder Dispatch Generator */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(238,237,234,0.1)]">
              <div>
                <h4 className="meta-mono text-sm text-[#8eb9dd] font-bold">
                  Clinical Stakeholder Dispatch & Invite Generator
                </h4>
                <p className="text-slate-400 text-xs">
                  Generate formatted testing invitations ready to send via hospital email, Slack, or Microsoft Teams.
                </p>
              </div>

              {/* Recipient Audience Filter */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'MANAGERS', label: 'Clinical Managers' },
                  { id: 'RADS', label: 'Lead Radiologists' },
                  { id: 'COORDINATORS', label: 'Scheduling Coordinators' },
                  { id: 'CHIEFS', label: 'Department Chiefs' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setShareAudience(item.id as any)}
                    className={`meta-mono text-[10px] px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      shareAudience === item.id
                        ? 'bg-[#8eb9dd] text-black font-bold'
                        : 'bg-[#242429] text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatted Invite Box */}
            {(() => {
              const roleTitles: Record<string, string> = {
                MANAGERS: 'Clinical Operations & Practice Managers',
                RADS: 'Lead Diagnostic & Interventional Radiologists',
                COORDINATORS: 'Clinical Scheduling Coordinators',
                CHIEFS: 'Department Chiefs & Medical Directors'
              };

              const roleTasks: Record<string, string> = {
                MANAGERS: '1. Review daily staffing coverage ratios & multi-site shift distribution.\n2. Confirm AP in-facility MD oversight compliance rules.\n3. Validate daily RIS modality throughput and backlog numbers.',
                RADS: '1. Test the daily reading matrix and subspecialty assignments.\n2. Verify on-site contrast supervision alerts and workstation ergonomics.\n3. Submit test leave requests and simulate peer coverage trades.',
                COORDINATORS: '1. Test the auto-scheduler shift fill engine across hospital sites.\n2. Verify conflict detection alerts (double-bookings, mandatory rest periods).\n3. Review automated email notifications and daily dispatch previews.',
                CHIEFS: '1. Review executive absence analytics and PTO accrual balances.\n2. Validate credentialing compliance rules for outpatient facilities.\n3. Inspect real-time audit logging and regulatory compliance reports.'
              };

              const inviteText = `Subject: Radiology Scheduling Platform - Clinical Validation Testing\n\nDear ${roleTitles[shareAudience]},\n\nPlease access our protected Clinical Testing Environment to validate new scheduling workflows for the radiology department:\n\n🔗 Protected Testing URL: ${AI_STUDIO_SHARED_URL}\n\nValidation Priorities:\n${roleTasks[shareAudience]}\n\nNote: This link is hosted on our stable Shared App endpoint and will not be disrupted by ongoing engineering or code changes. Please submit feedback directly to the radiology informatics steering group.`;

              return (
                <div className="space-y-3">
                  <div className="relative">
                    <pre className="p-4 bg-[#111113] rounded-xs border border-[rgba(238,237,234,0.12)] font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {inviteText}
                    </pre>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="meta-mono text-xs text-slate-400">
                      Targeted for {roleTitles[shareAudience]}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyEnvText(inviteText, 'invite-text')}
                      className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs py-2 px-4 rounded-xs cursor-pointer font-mono flex items-center gap-1.5 transition-colors"
                    >
                      {copiedEnvKey === 'invite-text' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Invitation Text</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Architectural Comparison Matrix */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-4">
            <h4 className="meta-mono text-sm text-[#8eb9dd] font-bold">
              Dual Environment Operational Comparison Matrix
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#242429] text-[rgba(238,237,234,0.5)] uppercase meta-mono border-b border-[rgba(238,237,234,0.08)]">
                    <th className="p-3">Environment Parameter</th>
                    <th className="p-3 text-[#38bdf8]">Development App (ais-dev-...)</th>
                    <th className="p-3 text-[#34d399]">Shared App (ais-pre-...)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(238,237,234,0.06)] font-medium text-xs">
                  <tr className="hover:bg-[rgba(238,237,234,0.02)]">
                    <td className="p-3 font-semibold text-[#eeedea]">URL Format</td>
                    <td className="p-3 font-mono text-[#38bdf8]">https://ais-dev-[id].us-east1.run.app</td>
                    <td className="p-3 font-mono text-[#34d399]">https://ais-pre-[id].us-east1.run.app</td>
                  </tr>
                  <tr className="hover:bg-[rgba(238,237,234,0.02)]">
                    <td className="p-3 font-semibold text-[#eeedea]">Intended Use</td>
                    <td className="p-3 text-slate-300">Prompt iterations, layout changes, rapid feature builds</td>
                    <td className="p-3 text-slate-300">Physician schedule sign-off, conflict drills, clinical UAT</td>
                  </tr>
                  <tr className="hover:bg-[rgba(238,237,234,0.02)]">
                    <td className="p-3 font-semibold text-[#eeedea]">Primary Stakeholders</td>
                    <td className="p-3 text-slate-300">Software engineers & system administrators</td>
                    <td className="p-3 text-slate-300">Clinical managers, lead radiologists, scheduling coordinators</td>
                  </tr>
                  <tr className="hover:bg-[rgba(238,237,234,0.02)]">
                    <td className="p-3 font-semibold text-[#eeedea]">Stability Guarantee</td>
                    <td className="p-3 text-amber-300/90 font-mono text-[11px]">Dynamic (updates during prompt execution)</td>
                    <td className="p-3 text-emerald-400 font-mono text-[11px]">Stable (shielded from mid-session edits)</td>
                  </tr>
                  <tr className="hover:bg-[rgba(238,237,234,0.02)]">
                    <td className="p-3 font-semibold text-[#eeedea]">State Persistence</td>
                    <td className="p-3 text-slate-300">Local developer sandbox with full purge/reset controls</td>
                    <td className="p-3 text-slate-300">Dedicated browser state for acceptance test sessions</td>
                  </tr>
                  <tr className="hover:bg-[rgba(238,237,234,0.02)]">
                    <td className="p-3 font-semibold text-[#eeedea]">Recommended Action</td>
                    <td className="p-3 text-slate-300">Iterate on components and test features here first</td>
                    <td className="p-3 text-slate-300">Distribute to hospital staff when features are ready</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: BATCH IMPORTER */}
      {activeSubTab === 'import' && (
        <div className="bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-4 text-xs">
          <div className="pb-3 border-b border-[rgba(238,237,234,0.1)]">
            <h3 className="meta-mono text-[#8eb9dd]">
              Batch Data Importer
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block meta-mono mb-1">Target Entity</label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value as any)}
                className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-bold text-[#eeedea]"
              >
                <option value="USERS">Staff Personnel Roster</option>
                <option value="SITES">Clinical Facilities</option>
                <option value="WORKSTATIONS">Diagnostic Workstations</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  if (importType === 'USERS') {
                    setRawImportData(
                      "Dr. Jane Doe\tATTENDING_RAD\tNeuro\tMAIN\tWS-MAIN-01\tjdoe@organization.org\ttrue\n" +
                      "John Smith\tADVANCED_PRACTITIONER\tBody\tMAIN\tWS-MAIN-02\tjsmith@organization.org\ttrue"
                    );
                  } else if (importType === 'WORKSTATIONS') {
                    setRawImportData("WS-MAIN-02\tMAIN\tDiagnostic Reading Pod 2\tDual Barco 3MP Diagnostic Color");
                  }
                }}
                className="meta-mono text-[#8eb9dd] hover:underline cursor-pointer"
              >
                [Load Sample Template Rows]
              </button>
            </div>
          </div>

          <textarea
            rows={7}
            value={rawImportData}
            onChange={(e) => setRawImportData(e.target.value)}
            placeholder="Paste lines here..."
            className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-3 font-mono text-[11px] text-[#eeedea]"
          />

          {importStatus && <p className="meta-mono text-[#8eb9dd]">{importStatus}</p>}

          <div className="flex justify-end pt-2 border-t border-[rgba(238,237,234,0.1)]">
            <button
              onClick={handleExecuteBatchImport}
              className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold px-4 py-2 rounded-xs cursor-pointer font-mono"
            >
              Process & Save Records
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: REPORTING */}
      {activeSubTab === 'report' && (
        <div className="bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(238,237,234,0.1)]">
            <div>
              <h3 className="meta-mono text-[#8eb9dd]">Executive Absence & Coverage Report</h3>
            </div>
            <button
              onClick={onGenerateReportPdf}
              className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs px-3 py-1.5 rounded-xs cursor-pointer font-mono"
            >
              Download PDF
            </button>
          </div>

          <div className="p-6 bg-[#111113] border border-[rgba(238,237,234,0.1)] rounded-xs space-y-4">
            <h1 className="text-xl font-brand italic text-[#8eb9dd]">
              Radiology Department Executive Leave Report
            </h1>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-[#1c1c1f] p-3 rounded-xs border border-[rgba(238,237,234,0.08)] text-center">
                <span className="meta-mono block">Total Requests</span>
                <span className="text-lg font-mono text-[#8eb9dd] font-bold">{leaves.length}</span>
              </div>
              <div className="bg-[#1c1c1f] p-3 rounded-xs border border-[rgba(238,237,234,0.08)] text-center">
                <span className="meta-mono block">Approved PTO</span>
                <span className="text-lg font-mono text-emerald-400 font-bold">
                  {leaves.filter(l => l.category === 'Clinical PTO' && l.status === 'Approved').length}
                </span>
              </div>
              <div className="bg-[#1c1c1f] p-3 rounded-xs border border-[rgba(238,237,234,0.08)] text-center">
                <span className="meta-mono block">CME / RSNA</span>
                <span className="text-lg font-mono text-purple-400 font-bold">
                  {leaves.filter(l => l.category.includes('RSNA') || l.category.includes('CME')).length}
                </span>
              </div>
              <div className="bg-[#1c1c1f] p-3 rounded-xs border border-[rgba(238,237,234,0.08)] text-center">
                <span className="meta-mono block">Status</span>
                <span className="text-lg font-mono text-[#8eb9dd] font-bold">Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: AUDIT TRAIL & SCHEDULED COMPLIANCE EXPORTS */}
      {activeSubTab === 'audit' && (
        <div className="space-y-5 text-xs">
          
          {/* Scheduled Compliance Exports Automation Engine */}
          <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8eb9dd]" />
                  <span>Scheduled Compliance Exports Automation Hub</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automate recurring regulatory audit bundles (ACR contrast logs, MQSA reader compliance, fatigue thresholds, and shift swap trails).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={exportFrequency}
                  onChange={(e) => setExportFrequency(e.target.value as any)}
                  className="bg-[#111113] border border-white/15 px-2.5 py-1.5 rounded-xs text-[#8eb9dd] font-mono font-bold text-xs"
                >
                  <option value="DAILY">Daily (00:00 UTC)</option>
                  <option value="WEEKLY">Weekly (Mon 06:00)</option>
                  <option value="MONTHLY">Monthly (1st Day)</option>
                </select>

                <button
                  type="button"
                  onClick={handleRunScheduledExport}
                  className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold font-mono text-xs px-3 py-1.5 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate Scheduled Export</span>
                </button>
              </div>
            </div>

            {scheduledExportFeedback && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded text-emerald-200 font-mono text-[11px] flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{scheduledExportFeedback}</span>
              </div>
            )}
          </div>

          {/* Fine-Grained Search & Multi-Criteria Filtering */}
          <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#8eb9dd]" />
                Fine-Grained Audit Trail Search ({filteredLogs.length} matching logs)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onExportAuditCsv}
                  className="meta-mono bg-transparent border border-[rgba(238,237,234,0.15)] hover:border-[#8eb9dd] px-3 py-1 text-xs text-[#eeedea] hover:text-[#8eb9dd] rounded-xs cursor-pointer"
                >
                  Export CSV
                </button>
                <button
                  onClick={onClearAuditLogs}
                  className="meta-mono bg-[#271419] border border-[#7f1d1d] hover:bg-[#3d181f] text-rose-400 px-3 py-1 text-xs rounded-xs cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <label className="block meta-mono mb-1 text-[11px] text-slate-400">Search Keywords</label>
                <input
                  type="text"
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  placeholder="Filter by keyword or clinician..."
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs px-2.5 py-1.5 text-xs text-[#eeedea] focus:outline-none focus:border-[#8eb9dd]"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1 text-[11px] text-slate-400">Action Category</label>
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-1.5 text-white text-xs font-mono"
                >
                  <option value="ALL">All Categories</option>
                  <option value="SWAP">Shift Swap Trades</option>
                  <option value="LEAVE">Leave & PTO Actions</option>
                  <option value="ROSTER">Roster & Staff Edits</option>
                  <option value="RULE">Compliance Rules</option>
                  <option value="SYSTEM">System & Boot Events</option>
                </select>
              </div>

              <div>
                <label className="block meta-mono mb-1 text-[11px] text-slate-400">Time Range</label>
                <select
                  value={auditDateRange}
                  onChange={(e) => setAuditDateRange(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-1.5 text-white text-xs font-mono"
                >
                  <option value="ALL">All Recorded Dates</option>
                  <option value="TODAY">Today Only</option>
                  <option value="7DAYS">Past 7 Days</option>
                  <option value="30DAYS">Past 30 Days</option>
                </select>
              </div>

              <div>
                <label className="block meta-mono mb-1 text-[11px] text-slate-400">Operator / User</label>
                <select
                  value={auditUserFilter}
                  onChange={(e) => setAuditUserFilter(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-1.5 text-white text-xs"
                >
                  <option value="ALL">All Users & System</option>
                  {Array.from(new Set(auditLogs.map(l => l.user))).map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#242429] text-[rgba(238,237,234,0.5)] uppercase meta-mono border-b border-[rgba(238,237,234,0.08)]">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(238,237,234,0.06)] font-medium text-xs">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400 font-mono italic">
                        No audit events match current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(l => (
                      <tr key={l.id} className="hover:bg-[rgba(238,237,234,0.02)] transition-colors">
                        <td className="p-3 font-mono opacity-50 text-[11px]">{l.timestamp}</td>
                        <td className="p-3 font-semibold text-[#eeedea]">{l.user}</td>
                        <td className="p-3 font-mono text-[#8eb9dd]">{l.actionType}</td>
                        <td className="p-3 opacity-80">{l.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Production Deployment & Data Purge Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1f] border border-rose-500/50 rounded-lg max-w-lg w-full p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Production Deployment & Data Purge</span>
              </div>
              <button
                onClick={() => setShowPurgeModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              This action prepares RadScheduler Pro for production deployment by removing sample and demo data. Choose your target reset mode:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-[#242429] rounded border border-[rgba(238,237,234,0.15)] space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Option A: Clean Production Workspace (Recommended)</span>
                  <span className="text-[10px] meta-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">STANDARD</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Wipes all demo shifts, mock leaves, sample rules, and demo queues. Initializes a single Administrator profile and 1 Primary Clinical Facility ready for your real data.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onClearAllDemoData) {
                      onClearAllDemoData();
                      setShowPurgeModal(false);
                      alert('Production workspace initialized with clean Administrator account and Primary Facility.');
                    }
                  }}
                  className="mt-2 w-full bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold py-2 rounded-xs cursor-pointer font-mono text-center"
                >
                  Reset to Clean Production Workspace
                </button>
              </div>

              <div className="p-3.5 bg-[#242429] rounded border border-rose-900/40 space-y-1.5">
                <div className="font-bold text-rose-300 flex items-center justify-between">
                  <span>Option B: Complete Zero-State Wipe</span>
                  <span className="text-[10px] meta-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded">EMPTY</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Completely wipes all facilities, workstations, users, schedules, leaves, and rules so you can enter every record from scratch.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onPurgeEverything) {
                      onPurgeEverything();
                      setShowPurgeModal(false);
                      alert('All sample records wiped. Clean zero-state ready.');
                    }
                  }}
                  className="mt-2 w-full bg-rose-900/80 hover:bg-rose-800 text-white font-bold py-2 rounded-xs cursor-pointer font-mono text-center"
                >
                  Complete Wipeout (Zero Data)
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[rgba(238,237,234,0.1)]">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="bg-transparent hover:bg-white/10 text-[#eeedea] px-4 py-1.5 rounded-xs meta-mono cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
