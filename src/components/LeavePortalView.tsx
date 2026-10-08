import React, { useState, useMemo } from 'react';
import { 
  CalendarX2, 
  Plus, 
  Check, 
  X, 
  Clock, 
  User, 
  Users, 
  ShieldCheck, 
  Mail, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Settings2, 
  CheckCircle2, 
  SunMedium, 
  GraduationCap, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { LeaveRequest, StaffUser, PtoAccrual, AbsenceCategory } from '../types';
import { formatDateWithDay, formatPersonName } from '../utils/formatters';

interface LeavePortalViewProps {
  leaves: LeaveRequest[];
  users: StaffUser[];
  currentUser: StaffUser;
  accruals: Record<string, PtoAccrual>;
  onUpdateAccrual?: (userId: string, accrual: PtoAccrual) => void;
  onOpenLeaveModal: (initRadId?: string) => void;
  onApproveLeave: (leaveId: string) => void;
  onRejectLeave: (leaveId: string) => void;
  onDeleteLeave?: (leaveId: string) => void;
  absenceCategories: AbsenceCategory[];
  onSaveAbsenceCategory: (cat: AbsenceCategory) => void;
  onDeleteAbsenceCategory: (catId: string) => void;
  isAdmin: boolean;
}

export const LeavePortalView: React.FC<LeavePortalViewProps> = ({
  leaves,
  users,
  currentUser,
  accruals,
  onUpdateAccrual = () => {},
  onOpenLeaveModal,
  onApproveLeave,
  onRejectLeave,
  onDeleteLeave = () => {},
  absenceCategories,
  onSaveAbsenceCategory,
  onDeleteAbsenceCategory,
  isAdmin
}) => {
  // Mode switcher for Admin: 'ALL_STAFF' vs 'MY_PTO'
  const [adminViewMode, setAdminViewMode] = useState<'ALL_STAFF' | 'MY_PTO'>(
    isAdmin ? 'ALL_STAFF' : 'MY_PTO'
  );

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Absence Category Manager Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catIsPaid, setCatIsPaid] = useState(true);
  const [catColor, setCatColor] = useState('#38bdf8');

  // Staff PTO Allocation Edit Modal State
  const [editingStaffPtoUser, setEditingStaffPtoUser] = useState<StaffUser | null>(null);
  const [editAnnualPto, setEditAnnualPto] = useState<number>(30);
  const [editAnnualCme, setEditAnnualCme] = useState<number>(10);
  const [editUsedPto, setEditUsedPto] = useState<number>(0);
  const [editUsedCme, setEditUsedCme] = useState<number>(0);

  const userMap = useMemo(() => {
    const map = new Map<string, StaffUser>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  // Determine which clinician(s) to show in the portal
  const effectiveIsAdminDashboard = isAdmin && adminViewMode === 'ALL_STAFF';

  // Filter leaves
  const displayedLeaves = useMemo(() => {
    return leaves.filter(l => {
      // If regular staff (or admin viewing personal PTO), ONLY show logged-in user
      if (!effectiveIsAdminDashboard) {
        if (l.radId !== currentUser.id) return false;
      } else {
        // Admin dashboard staff selection
        if (selectedStaffId !== 'ALL' && l.radId !== selectedStaffId) return false;
      }

      if (statusFilter !== 'ALL' && l.status.toUpperCase() !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const u = userMap.get(l.radId);
        const matchesName = u?.name.toLowerCase().includes(q);
        const matchesCategory = l.category.toLowerCase().includes(q);
        const matchesNotes = l.notes?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesNotes) return false;
      }

      return true;
    });
  }, [leaves, effectiveIsAdminDashboard, currentUser.id, selectedStaffId, statusFilter, searchQuery, userMap]);

  // Current user's accrual metrics
  const myAccrual = accruals[currentUser.id] || {
    annualPto: currentUser.allocatedAnnualPto ?? 30,
    cmeDays: currentUser.allocatedAnnualCme ?? 10,
    maxConsecutive: 14,
    usedPto: 0,
    usedCme: 0
  };
  const myAvailablePto = Math.max(0, myAccrual.annualPto - myAccrual.usedPto);
  const myAvailableCme = Math.max(0, myAccrual.cmeDays - myAccrual.usedCme);

  // Open edit allocation modal for a staff member
  const handleOpenEditAllocation = (user: StaffUser) => {
    const acc = accruals[user.id] || {
      annualPto: user.allocatedAnnualPto ?? 30,
      cmeDays: user.allocatedAnnualCme ?? 10,
      maxConsecutive: 14,
      usedPto: 0,
      usedCme: 0
    };
    setEditingStaffPtoUser(user);
    setEditAnnualPto(acc.annualPto);
    setEditAnnualCme(acc.cmeDays);
    setEditUsedPto(acc.usedPto);
    setEditUsedCme(acc.usedCme);
  };

  const handleSaveStaffAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffPtoUser) return;
    onUpdateAccrual(editingStaffPtoUser.id, {
      annualPto: editAnnualPto,
      cmeDays: editAnnualCme,
      maxConsecutive: 14,
      usedPto: editUsedPto,
      usedCme: editUsedCme
    });
    setEditingStaffPtoUser(null);
  };

  // Category save / update
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const id = editingCatId || `cat-${Date.now()}`;
    onSaveAbsenceCategory({
      id,
      name: catName.trim(),
      isPaid: catIsPaid,
      color: catColor,
      requiresCoveringColleague: true
    });
    setEditingCatId(null);
    setCatName('');
    setCatIsPaid(true);
  };

  const handleStartEditCategory = (cat: AbsenceCategory) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatIsPaid(cat.isPaid);
    setCatColor(cat.color || '#38bdf8');
  };

  return (
    <div className="space-y-6 text-[#fdfdfd]">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.18)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#a0c9eb]/10 text-[#a0c9eb] border border-[#a0c9eb]/30 flex items-center justify-center font-bold">
              <CalendarX2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                {effectiveIsAdminDashboard 
                  ? 'PTO & Leave Governance' 
                  : 'My PTO & Absence Portal'}
              </h1>
              <p className="section-label">
                {effectiveIsAdminDashboard
                  ? 'ADMINISTRATIVE MANAGEMENT INTERFACE'
                  : `Signed in as ${formatPersonName(currentUser.name, currentUser.role, currentUser.title)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Mode Switcher */}
          {isAdmin && (
            <div className="bg-[#3d414d] p-1 rounded border border-[rgba(255,255,255,0.18)] flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => setAdminViewMode('ALL_STAFF')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 font-bold ${
                  adminViewMode === 'ALL_STAFF'
                    ? 'bg-[#a0c9eb] text-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Staff Dashboard</span>
              </button>
              <button
                onClick={() => setAdminViewMode('MY_PTO')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 font-bold ${
                  adminViewMode === 'MY_PTO'
                    ? 'bg-[#a0c9eb] text-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Personal PTO</span>
              </button>
            </div>
          )}

          {effectiveIsAdminDashboard && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-[#2e313a] hover:bg-[#383d48] text-white border border-[rgba(255,255,255,0.18)] font-mono text-xs py-2 px-3 rounded cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#a0c9eb]" />
              <span>Absence Categories</span>
            </button>
          )}

          <button
            onClick={() => onOpenLeaveModal(effectiveIsAdminDashboard ? undefined : currentUser.id)}
            className="btn-primary bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-semibold text-xs py-2 px-3.5 rounded shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ REQUEST PTO</span>
          </button>
        </div>
      </div>

      {/* PERSONAL PTO BALANCE CARDS (Shown to Staff, and to Admins viewing My Personal PTO) */}
      {!effectiveIsAdminDashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#3d414d] p-5 rounded-md border border-[rgba(255,255,255,0.18)] space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono text-xs">
              <span className="section-label">Annual Allotment</span>
              <SunMedium className="w-4 h-4 text-[#a0c9eb]" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              {myAccrual.annualPto.toFixed(1)} <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <p className="text-[11px] text-slate-400">Allocated for this calendar year</p>
          </div>

          <div className="bg-[#3d414d] p-5 rounded-md border border-[rgba(255,255,255,0.18)] space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono text-xs">
              <span className="section-label">Used PTO Days</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-amber-300">
              {myAccrual.usedPto.toFixed(1)} <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <p className="text-[11px] text-slate-400">Absences approved & deducted</p>
          </div>

          <div className="bg-[#3d414d] p-5 rounded-md border border-[#a0c9eb]/50 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#a0c9eb] font-mono text-xs font-bold">
              <span className="section-label text-[#a0c9eb]">Remaining Balance</span>
              <CheckCircle2 className="w-4 h-4 text-[#a0c9eb]" />
            </div>
            <div className="text-3xl font-bold font-mono text-[#a0c9eb]">
              {myAvailablePto.toFixed(1)} <span className="text-xs font-normal text-slate-300">Days</span>
            </div>
            <p className="text-[11px] text-slate-300">Available to request</p>
          </div>

          <div className="bg-[#3d414d] p-5 rounded-md border border-[rgba(255,255,255,0.18)] space-y-1">
            <div className="flex items-center justify-between text-purple-300 font-mono text-xs font-bold">
              <span className="section-label text-purple-300">CME Training</span>
              <GraduationCap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-purple-300">
              {myAvailableCme.toFixed(1)} <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <p className="text-[11px] text-slate-400">Of {myAccrual.cmeDays} annual conference days</p>
          </div>
        </div>
      )}

      {/* ADMIN CONTROLS & STAFF ROSTER PTO ALLOCATION TABLE (Admin Dashboard Mode) */}
      {effectiveIsAdminDashboard && (
        <div className="space-y-4">
          
          {/* Admin Stats Overview (Variation 10 stat-card styling) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#3d414d] p-6 rounded-md border border-[rgba(255,255,255,0.18)] flex items-center justify-between">
              <div>
                <span className="section-label">Pending</span>
                <div className="font-mono text-3xl font-bold text-amber-400">
                  {leaves.filter(l => l.status === 'Pending').length}
                </div>
              </div>
              <Clock className="w-8 h-8 text-amber-400/40" />
            </div>

            <div className="bg-[#3d414d] p-6 rounded-md border border-[rgba(255,255,255,0.18)] flex items-center justify-between">
              <div>
                <span className="section-label">Active</span>
                <div className="font-mono text-3xl font-bold text-white">
                  {users.filter(u => !u.isArchived).length}
                </div>
              </div>
              <Users className="w-8 h-8 text-[#a0c9eb]/40" />
            </div>

            <div className="bg-[#3d414d] p-6 rounded-md border border-[rgba(255,255,255,0.18)] flex items-center justify-between">
              <div>
                <span className="section-label">Approved</span>
                <div className="font-mono text-3xl font-bold text-emerald-400">
                  {leaves.filter(l => l.status === 'Approved').length}
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
            </div>
          </div>

          {/* Clinician PTO Allocation & Balance Manager Table */}
          <div className="bg-[#3d414d] rounded-md border border-[rgba(255,255,255,0.18)] overflow-hidden space-y-2">
            <div className="p-4 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.18)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#a0c9eb]" />
                <h3 className="section-label mb-0 text-white font-bold">
                  Staff Clinician PTO Allotments & Balances
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Tracked strictly in days &bull; Individual staff allocations configurable below
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.65)] uppercase text-[10px] tracking-wider border-b border-[rgba(255,255,255,0.18)]">
                    <th className="p-4">Staff Clinician</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Primary Site</th>
                    <th className="p-4 font-bold text-[#a0c9eb]">Annual PTO</th>
                    <th className="p-4 font-bold text-purple-300">CME</th>
                    <th className="p-4">Used PTO</th>
                    <th className="p-4 font-bold">Remaining Available</th>
                    <th className="p-4 text-right">Quick Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-xs">
                  {users.filter(u => !u.isArchived).map(u => {
                    const acc = accruals[u.id] || {
                      annualPto: u.allocatedAnnualPto ?? 30,
                      cmeDays: u.allocatedAnnualCme ?? 10,
                      maxConsecutive: 14,
                      usedPto: 0,
                      usedCme: 0
                    };
                    const remainingPto = acc.annualPto - acc.usedPto;
                    const isLow = remainingPto <= 3;

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-semibold text-white">
                          {formatPersonName(u.name, u.role, u.title)}
                        </td>
                        <td className="p-3 meta-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'CHIEF'
                              ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                              : u.role === 'ADMIN'
                                ? 'bg-[#8eb9dd]/10 text-[#8eb9dd] border border-[#8eb9dd]/30'
                                : 'bg-black/40 text-slate-300'
                          }`}>
                            {u.role === 'CHIEF' ? 'CHIEF' : u.role === 'ATTENDING_RAD' ? 'ATTENDING' : u.role === 'ADVANCED_PRACTITIONER' ? 'RPA/NP' : u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{u.primarySite || 'ALL'}</td>
                        <td className="p-3 font-mono font-bold text-[#8eb9dd]">
                          {acc.annualPto.toFixed(1)} Days
                        </td>
                        <td className="p-3 font-mono font-bold text-purple-300">
                          {acc.cmeDays.toFixed(1)} Days
                        </td>
                        <td className="p-3 font-mono text-slate-300">
                          {acc.usedPto.toFixed(1)} Days
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <span className={isLow ? 'text-amber-400' : 'text-emerald-400'}>
                            {remainingPto.toFixed(1)} Days
                          </span>
                          {isLow && <span className="ml-1 text-[9px] text-amber-400 font-normal">(Low)</span>}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenEditAllocation(u)}
                            className="bg-[#242429] hover:bg-[#2e2e36] text-[#8eb9dd] hover:text-white border border-white/10 px-2.5 py-1 rounded-xs font-mono text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Allotment</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* FILTER CONTROLS BAR */}
      <div className="bg-[#3d414d] p-4 rounded-md border border-[rgba(255,255,255,0.18)] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
        {effectiveIsAdminDashboard ? (
          <div>
            <span className="section-label mb-1">
              Filter by Staff Clinician
            </span>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-[#2e313a] border border-[rgba(255,255,255,0.18)] rounded px-3 py-2 text-white focus:outline-none focus:border-[#a0c9eb]"
            >
              <option value="ALL">All Staff Clinicians (Full Practice)</option>
              {users.filter(u => !u.isArchived).map(u => (
                <option key={u.id} value={u.id} className="bg-[#2e313a]">
                  {formatPersonName(u.name, u.role, u.title)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <span className="section-label mb-1">
              Viewing Clinician
            </span>
            <div className="bg-[#2e313a] border border-[rgba(255,255,255,0.18)] rounded px-3 py-2 text-white font-bold flex items-center justify-between">
              <span>{formatPersonName(currentUser.name, currentUser.role, currentUser.title)}</span>
              <span className="text-[10px] font-mono text-[#a0c9eb]">Logged In</span>
            </div>
          </div>
        )}

        <div>
          <span className="section-label mb-1">
            Request Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-[#2e313a] border border-[rgba(255,255,255,0.18)] rounded px-3 py-2 text-white focus:outline-none focus:border-[#a0c9eb]"
          >
            <option value="ALL" className="bg-[#2e313a]">All Statuses (Pending, Approved, Rejected)</option>
            <option value="PENDING" className="bg-[#2e313a]">Pending Review Only</option>
            <option value="APPROVED" className="bg-[#2e313a]">Approved Requests Only</option>
            <option value="REJECTED" className="bg-[#2e313a]">Rejected Requests</option>
          </select>
        </div>

        <div>
          <span className="section-label mb-1">
            Search Notes / Categories
          </span>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, notes..."
              className="w-full bg-[#2e313a] border border-[rgba(255,255,255,0.18)] rounded pl-8 pr-3 py-2 text-white focus:outline-none focus:border-[#a0c9eb]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* LEAVE REQUESTS TABLE */}
      <div className="table-container bg-[#3d414d] rounded-md border border-[rgba(255,255,255,0.18)] overflow-hidden">
        <div className="p-4 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.18)] flex flex-wrap justify-between items-center gap-2 text-xs font-bold">
          <span className="section-label text-white font-bold mb-0">
            {effectiveIsAdminDashboard 
              ? `Recent Absence Queue (${displayedLeaves.length})` 
              : `My Submitted Leave Requests (${displayedLeaves.length})`}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-amber-400 text-xs">
              {displayedLeaves.filter(l => l.status === 'Pending').length} Pending Review
            </span>
            <span className="font-mono text-emerald-400 text-xs">
              {displayedLeaves.filter(l => l.status === 'Approved').length} Approved
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.65)] uppercase text-[10px] tracking-wider border-b border-[rgba(255,255,255,0.18)]">
                <th className="p-4">Staff Clinician</th>
                <th className="p-4">Category</th>
                <th className="p-4">Absence Window</th>
                <th className="p-4 font-bold text-[#a0c9eb]">Duration</th>
                <th className="p-4">Covering Colleague</th>
                <th className="p-4">Notes & Email Notice</th>
                <th className="p-4">Status</th>
                {isAdmin && <th className="p-4 text-right">Approval Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-xs">
              {displayedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="p-10 text-center meta-mono text-slate-500 italic">
                    NO LEAVE RECORDS MATCH THE SELECTED FILTERS
                  </td>
                </tr>
              ) : (
                displayedLeaves.map(req => {
                  const user = userMap.get(req.radId);
                  const isMulti = req.startDate !== req.endDate;
                  const daysVal = req.dayCount ?? (isMulti ? 3.0 : 1.0);

                  return (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-semibold text-white">
                        {formatPersonName(user?.name || 'Physician', user?.role, user?.title)}
                      </td>
                      <td className="p-3 text-[#8eb9dd] font-mono font-bold">
                        {req.category}
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {formatDateWithDay(req.startDate)} {isMulti ? `→ ${formatDateWithDay(req.endDate)}` : ''}
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        <span className="bg-black/40 border border-white/10 px-2 py-0.5 rounded text-[11px] text-[#8eb9dd]">
                          {daysVal.toFixed(1)} {daysVal === 1 ? 'Day' : 'Days'}
                        </span>
                        {isMulti && (
                          <span className="block text-[9px] text-slate-400 mt-0.5">Consecutive</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">
                        {req.backupDoc}
                      </td>
                      <td className="p-3 text-slate-400 max-w-xs">
                        <div className="truncate font-geist text-slate-300">{req.notes || '—'}</div>
                        {req.managerNotificationEmail && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-mono">
                            <Mail className="w-2.5 h-2.5 text-[#8eb9dd]" />
                            <span className="truncate">Emailed: {req.managerNotificationEmail}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`meta-mono px-2 py-0.5 rounded-xs border font-bold text-[10px] ${
                          req.status === 'Approved' 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                            : req.status === 'Pending' 
                              ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' 
                              : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => onApproveLeave(req.id)}
                                  className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black rounded-xs cursor-pointer transition-colors shadow-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => onRejectLeave(req.id)}
                                  className="px-2.5 py-1 text-[11px] font-mono font-bold bg-transparent border border-rose-500/40 text-rose-400 hover:bg-rose-950/40 rounded-xs cursor-pointer transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Delete this leave request record?')) {
                                  onDeleteLeave(req.id);
                                }
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: EDIT STAFF PTO ALLOCATION (ADMIN) */}
      {editingStaffPtoUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1c1c1f] rounded-xs border border-white/20 w-full max-w-md overflow-hidden shadow-2xl text-[#eeedea] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="meta-mono font-bold text-sm text-[#8eb9dd]">
                  Allocate PTO: {editingStaffPtoUser.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  {editingStaffPtoUser.title} &bull; {editingStaffPtoUser.primarySite || 'Main Site'}
                </p>
              </div>
              <button 
                onClick={() => setEditingStaffPtoUser(null)} 
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffAllocation} className="space-y-4 text-xs font-geist">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block meta-mono text-slate-400 mb-1">
                    Annual PTO Allocation (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    step={0.5}
                    value={editAnnualPto}
                    onChange={(e) => setEditAnnualPto(Number(e.target.value))}
                    required
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 font-mono text-[#8eb9dd] font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-500">Allocated full vacation days</span>
                </div>

                <div>
                  <label className="block meta-mono text-slate-400 mb-1">
                    Annual CME Quota (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={0.5}
                    value={editAnnualCme}
                    onChange={(e) => setEditAnnualCme(Number(e.target.value))}
                    required
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 font-mono text-purple-300 font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-500">Conference training days</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/10">
                <div>
                  <label className="block meta-mono text-slate-400 mb-1">
                    Used PTO to Date (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    step={0.5}
                    value={editUsedPto}
                    onChange={(e) => setEditUsedPto(Number(e.target.value))}
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="block meta-mono text-slate-400 mb-1">
                    Used CME to Date (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={0.5}
                    value={editUsedCme}
                    onChange={(e) => setEditUsedCme(Number(e.target.value))}
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="bg-black/50 p-2.5 rounded-xs border border-white/10 flex justify-between items-center font-mono text-xs">
                <span className="text-slate-400">Resulting Available Balance:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {(editAnnualPto - editUsedPto).toFixed(1)} Days
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingStaffPtoUser(null)}
                  className="px-3 py-1.5 rounded-xs border border-white/15 text-slate-300 hover:text-white cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold px-4 py-1.5 rounded-xs shadow-xs cursor-pointer font-mono"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE ABSENCE CATEGORIES (ADMIN) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1c1c1f] rounded-xs border border-white/20 w-full max-w-xl overflow-hidden shadow-2xl text-[#eeedea] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#8eb9dd]" />
                <h3 className="meta-mono font-bold text-sm text-white">
                  Absence Categories Manager
                </h3>
              </div>
              <button 
                onClick={() => setIsCategoryModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Form */}
            <form onSubmit={handleSaveCategory} className="bg-[#111113] p-3 rounded-xs border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="meta-mono text-[#8eb9dd] font-bold">
                  {editingCatId ? 'Edit Absence Category' : 'Add New Absence Category'}
                </span>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={() => { setEditingCatId(null); setCatName(''); }}
                    className="text-rose-400 hover:underline meta-mono text-[10px]"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block meta-mono text-slate-400 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    required
                    placeholder="e.g. Sabbatical / Leave of Absence"
                    className="w-full bg-black/50 border border-white/15 rounded-xs p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block meta-mono text-slate-400 mb-1">Payment Status</label>
                  <select
                    value={catIsPaid ? 'PAID' : 'UNPAID'}
                    onChange={(e) => setCatIsPaid(e.target.value === 'PAID')}
                    className="w-full bg-black/50 border border-white/15 rounded-xs p-2 text-white font-mono"
                  >
                    <option value="PAID">Paid Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold px-3 py-1.5 rounded-xs font-mono text-xs cursor-pointer"
                >
                  {editingCatId ? 'Update Category' : '+ Add Category'}
                </button>
              </div>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2">
              <span className="meta-mono text-slate-400 text-xs block">
                Configured Absence Categories ({absenceCategories.length})
              </span>
              <div className="divide-y divide-white/10 border border-white/10 rounded-xs bg-[#111113] max-h-60 overflow-y-auto">
                {absenceCategories.map(cat => (
                  <div key={cat.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#38bdf8' }} />
                      <span className="font-semibold text-white">{cat.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        cat.isPaid ? 'bg-emerald-950/40 text-emerald-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {cat.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEditCategory(cat)}
                        className="text-slate-400 hover:text-[#8eb9dd] p-1 cursor-pointer"
                        title="Rename Category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete absence category "${cat.name}"?`)) {
                            onDeleteAbsenceCategory(cat.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-1.5 rounded-xs bg-[#242429] text-white hover:bg-[#2f2f36] font-mono text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
