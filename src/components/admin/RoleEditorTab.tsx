import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Shield, 
  Users, 
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import { RoleDefinition, UserRole } from '../../types';

interface RoleEditorTabProps {
  roles: RoleDefinition[];
  onSaveRole: (role: RoleDefinition) => void;
  onDeleteRole: (roleId: string) => void;
  userCountByRole?: Record<string, number>;
}

export const RoleEditorTab: React.FC<RoleEditorTabProps> = ({
  roles,
  onSaveRole,
  onDeleteRole,
  userCountByRole = {}
}) => {
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [roleCategory, setRoleCategory] = useState<RoleDefinition['category']>('CLINICAL');
  const [roleBadgeColor, setRoleBadgeColor] = useState<string>('#38bdf8');
  const [roleDescription, setRoleDescription] = useState<string>('');
  const [permissions, setPermissions] = useState<RoleDefinition['permissions']>({
    canAccessAdminCenter: false,
    canManageUsers: false,
    canPublishSchedule: false,
    canApproveLeave: false,
    canSuperviseContrast: true,
    canPerformProcedures: false,
    canOverrideCompliance: false,
    canEditWorkstations: false,
    canManageSites: false,
    canConfigureSystem: false
  });

  const [isFormOpen, setIsFormOpen] = useState(false);

  const PRESET_COLORS = [
    { label: 'Gold (Chief)', hex: '#f59e0b' },
    { label: 'Cyan (Admin)', hex: '#8eb9dd' },
    { label: 'Purple (Coordinator)', hex: '#a855f7' },
    { label: 'Sky (Attending)', hex: '#38bdf8' },
    { label: 'Emerald (AP)', hex: '#34d399' },
    { label: 'Rose (Trainee)', hex: '#fb7185' },
    { label: 'Indigo', hex: '#6366f1' },
    { label: 'Orange', hex: '#f97316' }
  ];

  const handleStartEdit = (r: RoleDefinition) => {
    setEditingRoleId(r.id);
    setRoleId(r.id);
    setRoleName(r.name);
    setRoleCategory(r.category);
    setRoleBadgeColor(r.badgeColor);
    setRoleDescription(r.description);
    setPermissions({ ...r.permissions });
    setIsFormOpen(true);
  };

  const handleResetForm = () => {
    setEditingRoleId(null);
    setRoleId('');
    setRoleName('');
    setRoleCategory('CLINICAL');
    setRoleBadgeColor('#38bdf8');
    setRoleDescription('');
    setPermissions({
      canAccessAdminCenter: false,
      canManageUsers: false,
      canPublishSchedule: false,
      canApproveLeave: false,
      canSuperviseContrast: true,
      canPerformProcedures: false,
      canOverrideCompliance: false,
      canEditWorkstations: false,
      canManageSites: false,
      canConfigureSystem: false
    });
    setIsFormOpen(false);
  };

  const handleTogglePermission = (key: keyof RoleDefinition['permissions']) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId.trim() || !roleName.trim()) {
      alert('Role identifier and name are required.');
      return;
    }

    const cleanId = roleId.trim().toUpperCase().replace(/\s+/g, '_');

    const updatedRole: RoleDefinition = {
      id: cleanId,
      name: roleName.trim(),
      category: roleCategory,
      badgeColor: roleBadgeColor,
      description: roleDescription.trim() || `${roleName} role definition.`,
      permissions
    };

    onSaveRole(updatedRole);
    handleResetForm();
  };

  const PERMISSION_CONFIG: { key: keyof RoleDefinition['permissions']; label: string; desc: string }[] = [
    { key: 'canAccessAdminCenter', label: 'Admin Command Center Access', desc: 'Can enter administrative management portal' },
    { key: 'canManageUsers', label: 'Staff User Management', desc: 'Can create, edit, and archive staff clinician accounts' },
    { key: 'canPublishSchedule', label: 'Commit & Publish Schedules', desc: 'Can finalize and publish synthesized clinical schedules' },
    { key: 'canApproveLeave', label: 'Approve / Reject Leave', desc: 'Can review and decide PTO, CME, and conference requests' },
    { key: 'canSuperviseContrast', label: 'On-Site Contrast Supervisor', desc: 'Can be designated ACR on-site contrast supervisor' },
    { key: 'canPerformProcedures', label: 'Invasive & Fluoro Procedures', desc: 'Authorized to execute fluoroscopy and joint arthrograms' },
    { key: 'canOverrideCompliance', label: 'Override Compliance & Fatigue', desc: 'Can waive 5-day consecutive limits and coverage deficits' },
    { key: 'canEditWorkstations', label: 'Workstation Terminal Registry', desc: 'Can register and assign diagnostic reading room PCs' },
    { key: 'canManageSites', label: 'Clinical Facilities & Modalities', desc: 'Can add, edit, or configure facilities and reading suites' },
    { key: 'canConfigureSystem', label: 'System Settings & Branding', desc: 'Can adjust practice branding, timezone, and policies' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#8eb9dd]" />
            <h3 className="meta-mono text-base font-bold text-[#eeedea]">
              Role & Permissions Governance (RBAC)
            </h3>
          </div>
          <p className="text-xs text-[rgba(238,237,234,0.6)] mt-1">
            Separate Department Chief, Operations Administrator, and clinical staff roles. Configure granular privileges without code changes.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs py-2 px-3 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Role</span>
          </button>
        )}
      </div>

      {/* Role Creation / Editing Form */}
      {isFormOpen && (
        <div className="bg-[#1c1c1f] p-5 rounded-xs border-2 border-[#8eb9dd] shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-[rgba(238,237,234,0.1)] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: roleBadgeColor }} />
              <h4 className="meta-mono text-sm font-bold text-[#eeedea]">
                {editingRoleId ? `Edit Role: ${roleName}` : 'Create New Role Definition'}
              </h4>
            </div>
            <button
              onClick={handleResetForm}
              className="text-[rgba(238,237,234,0.5)] hover:text-white cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block meta-mono text-[rgba(238,237,234,0.6)] mb-1">
                  Role Code / Key (e.g. CHIEF, FELLOW)
                </label>
                <input
                  type="text"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value.toUpperCase())}
                  disabled={editingRoleId === 'CHIEF' || editingRoleId === 'ADMIN'}
                  required
                  placeholder="e.g. FELLOW_RESIDENT"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-mono font-bold uppercase disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block meta-mono text-[rgba(238,237,234,0.6)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                  placeholder="e.g. Clinical Fellow Physician"
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                />
              </div>

              <div>
                <label className="block meta-mono text-[rgba(238,237,234,0.6)] mb-1">
                  Governance Category
                </label>
                <select
                  value={roleCategory}
                  onChange={(e) => setRoleCategory(e.target.value as any)}
                  className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea] font-bold"
                >
                  <option value="LEADERSHIP">Leadership (Chief / Chair / Director)</option>
                  <option value="OPERATIONS">Operations (Admin / Scheduler)</option>
                  <option value="CLINICAL">Clinical (Attending MD / AP)</option>
                  <option value="TRAINEE">Trainee (Fellow / Resident)</option>
                </select>
              </div>

              <div>
                <label className="block meta-mono text-[rgba(238,237,234,0.6)] mb-1">
                  Badge Color
                </label>
                <div className="flex items-center gap-1.5 mt-1">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setRoleBadgeColor(c.hex)}
                      title={c.label}
                      className={`w-6 h-6 rounded-xs cursor-pointer transition-transform ${roleBadgeColor === c.hex ? 'scale-110 ring-2 ring-white' : 'opacity-70'}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block meta-mono text-[rgba(238,237,234,0.6)] mb-1">
                Role Scope & Responsibilities
              </label>
              <input
                type="text"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Description of clinical, administrative, or reading room privileges..."
                className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-[#eeedea]"
              />
            </div>

            {/* Permissions Matrix */}
            <div>
              <label className="block meta-mono text-[#8eb9dd] mb-2 font-bold uppercase tracking-wider">
                Authorized Platform Privileges (Check to Grant)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#111113] p-3 rounded-xs border border-[rgba(238,237,234,0.1)]">
                {PERMISSION_CONFIG.map(perm => {
                  const isChecked = permissions[perm.key];
                  return (
                    <div
                      key={perm.key}
                      onClick={() => handleTogglePermission(perm.key)}
                      className={`p-2 rounded-xs border cursor-pointer flex items-start gap-2.5 transition-colors ${
                        isChecked 
                          ? 'border-[rgba(142, 185, 221,0.4)] bg-[rgba(142, 185, 221,0.06)]' 
                          : 'border-[rgba(238,237,234,0.08)] bg-black/20 hover:border-[rgba(238,237,234,0.2)]'
                      }`}
                    >
                      <div className="mt-0.5 text-[#8eb9dd]">
                        {isChecked ? <CheckSquare className="w-4 h-4 text-[#8eb9dd]" /> : <Square className="w-4 h-4 text-slate-500" />}
                      </div>
                      <div>
                        <div className={`font-bold ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                          {perm.label}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {perm.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(238,237,234,0.1)]">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-xs border border-[rgba(238,237,234,0.2)] text-slate-400 hover:text-white cursor-pointer font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold px-5 py-2 rounded-xs shadow-md cursor-pointer font-mono flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingRoleId ? 'Save Role Changes' : 'Create Role'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(r => {
          const userCount = userCountByRole[r.id] || 0;
          const activePermsCount = Object.values(r.permissions).filter(Boolean).length;
          const isSystemRole = r.id === 'CHIEF' || r.id === 'ADMIN';

          return (
            <div 
              key={r.id}
              className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] hover:border-[rgba(238,237,234,0.2)] transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase border"
                    style={{ 
                      backgroundColor: `${r.badgeColor}22`, 
                      color: r.badgeColor,
                      borderColor: `${r.badgeColor}44`
                    }}
                  >
                    {r.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {r.category}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#eeedea]">
                    {r.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[rgba(238,237,234,0.06)] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <strong>{userCount}</strong> assigned
                  </span>
                  <span className="text-[#8eb9dd]">
                    {activePermsCount} / 10 permissions
                  </span>
                </div>

                {/* Top permissions preview */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {r.permissions.canAccessAdminCenter && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-black/40 text-slate-300 rounded-xs border border-white/5">
                      Admin Portal
                    </span>
                  )}
                  {r.permissions.canSuperviseContrast && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-sky-950/60 text-sky-300 rounded-xs border border-sky-800/40">
                      Contrast Supervisor
                    </span>
                  )}
                  {r.permissions.canApproveLeave && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950/60 text-emerald-300 rounded-xs border border-emerald-800/40">
                      Approve Leave
                    </span>
                  )}
                  {r.permissions.canPerformProcedures && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-950/60 text-amber-300 rounded-xs border border-amber-800/40">
                      Procedures
                    </span>
                  )}
                  {r.permissions.canPublishSchedule && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-purple-950/60 text-purple-300 rounded-xs border border-purple-800/40">
                      Publish Schedule
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(238,237,234,0.08)] flex items-center justify-between">
                <button
                  onClick={() => handleStartEdit(r)}
                  className="text-xs font-mono text-[#8eb9dd] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Privileges</span>
                </button>

                {!isSystemRole && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove custom role "${r.name}" (${r.id})?`)) {
                        onDeleteRole(r.id);
                      }
                    }}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
