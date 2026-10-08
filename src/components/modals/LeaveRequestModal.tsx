import React, { useState, useMemo } from 'react';
import { X, CalendarX2, AlertTriangle, Mail, Clock, CheckCircle } from 'lucide-react';
import { LeaveRequest, StaffUser, PtoAccrual, AbsenceCategory } from '../../types';
import { formatPersonName } from '../../utils/formatters';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLeave: (req: Omit<LeaveRequest, 'id' | 'submittedAt'>) => void;
  users: StaffUser[];
  currentUserId?: string;
  initialDate?: string;
  isAdmin: boolean;
  accruals?: Record<string, PtoAccrual>;
  absenceCategories?: AbsenceCategory[];
  managerContactEmail?: string;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitLeave,
  users,
  currentUserId,
  initialDate,
  isAdmin,
  accruals = {},
  absenceCategories = [],
  managerContactEmail = 'radiologymgmt@gmail.com'
}) => {
  const [radId, setRadId] = useState<string>(currentUserId || users[0]?.id || '');
  const [category, setCategory] = useState<string>('Clinical PTO (Vacation)');
  const [durationType, setDurationType] = useState<'FULL_DAY' | 'HALF_DAY_AM' | 'HALF_DAY_PM' | 'MULTI_DAY'>('FULL_DAY');
  const [startDate, setStartDate] = useState<string>(initialDate || '2026-10-06');
  const [endDate, setEndDate] = useState<string>(initialDate || '2026-10-08');
  const [backupDoc, setBackupDoc] = useState<string>('Pool Coverage');
  const [notes, setNotes] = useState<string>('');
  const [managerEmail, setManagerEmail] = useState<string>(managerContactEmail);

  // Calculate day count in days (0.5 or 1.0 day increments, consecutive if multi-day)
  const dayCount = useMemo(() => {
    if (durationType === 'HALF_DAY_AM' || durationType === 'HALF_DAY_PM') {
      return 0.5;
    }
    if (durationType === 'FULL_DAY') {
      return 1.0;
    }
    // MULTI_DAY: consecutive days calculation
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    if (isNaN(startMs) || isNaN(endMs) || endMs < startMs) {
      return 1.0;
    }
    return Math.max(1, Math.round((endMs - startMs) / (1000 * 3600 * 24)) + 1);
  }, [durationType, startDate, endDate]);

  const isValidDateRange = useMemo(() => {
    if (durationType !== 'MULTI_DAY') return true;
    return new Date(endDate) >= new Date(startDate);
  }, [durationType, startDate, endDate]);

  // Check clinician PTO balance
  const userAccrual = accruals[radId] || { annualPto: 25, usedPto: 0, cmeDays: 5, usedCme: 0 };
  const availablePtoDays = Math.max(0, userAccrual.annualPto - userAccrual.usedPto);
  const isPtoCategory = category.toLowerCase().includes('pto') || category.toLowerCase().includes('vacation');
  const isBalanceExceeded = isPtoCategory && dayCount > availablePtoDays;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDateRange) {
      alert('End date must be on or after start date.');
      return;
    }

    const actualEndDate = durationType === 'MULTI_DAY' ? endDate : startDate;

    onSubmitLeave({
      radId,
      category,
      startDate,
      endDate: actualEndDate,
      dayCount,
      durationType,
      backupDoc,
      notes: notes || undefined,
      status: isAdmin ? 'Approved' : 'Pending',
      managerNotificationEmail: managerEmail,
      emailSent: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-lg overflow-hidden shadow-2xl text-[#fdfdfd]">
        
        <div className="bg-[#2e313a] px-5 py-4 border-b border-white/15 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40 flex items-center justify-center font-bold">
              <CalendarX2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-brand italic text-base text-[#fdfdfd] font-bold">
                Request Leave / PTO
              </h3>
              <p className="text-[11px] font-mono text-slate-300">
                Tracked in days &bull; 0.5 or 1.0 day increments &bull; Consecutive multi-day
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-300 hover:text-white cursor-pointer p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Child 1: Staff Clinician Select */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block meta-mono text-slate-200 font-semibold">
                Staff Clinician
              </label>
              <span className="text-[11px] font-mono text-[#a0c9eb] font-bold">
                Available PTO: <strong>{availablePtoDays.toFixed(1)} Days</strong>
              </span>
            </div>
            <select
              style={{ backgroundColor: '#2e313a' }}
              value={radId}
              onChange={(e) => setRadId(e.target.value)}
              disabled={!isAdmin && !!currentUserId}
              required
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-semibold text-white focus:outline-none focus:border-[#a0c9eb] disabled:opacity-80 cursor-pointer"
            >
              {users.filter(u => !u.isArchived).map(u => (
                <option key={u.id} value={u.id} className="bg-[#2e313a] text-white">
                  {formatPersonName(u.name, u.role, u.title)} ({u.allocatedAnnualPto ?? 30}d Annual Allotment)
                </option>
              ))}
            </select>
          </div>

          {/* Child 2: Absence Category Select */}
          <div>
            <label className="block meta-mono text-slate-200 font-semibold mb-1">
              Absence Category
            </label>
            <select
              style={{ backgroundColor: '#2e313a' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-bold text-[#a0c9eb] focus:outline-none focus:border-[#a0c9eb] cursor-pointer"
            >
              {absenceCategories.length > 0 ? (
                absenceCategories.map(cat => (
                  <option key={cat.id} value={cat.name} className="bg-[#2e313a] text-white">
                    {cat.name} {cat.isPaid ? '(Paid)' : '(Unpaid)'}
                  </option>
                ))
              ) : (
                <>
                  <option value="Clinical PTO (Vacation)" className="bg-[#2e313a] text-white">Clinical PTO (Vacation)</option>
                  <option value="CME Training Course" className="bg-[#2e313a] text-white">CME Training Course</option>
                  <option value="Academic Conference / RSNA" className="bg-[#2e313a] text-white">Academic Conference / RSNA</option>
                  <option value="Academic Research Day" className="bg-[#2e313a] text-white">Academic Research Day</option>
                  <option value="Fellowship Lecturing" className="bg-[#2e313a] text-white">Fellowship Lecturing</option>
                  <option value="Personal / Family Medical Leave" className="bg-[#2e313a] text-white">Personal / Family Medical Leave</option>
                  <option value="Medical / Sick Leave" className="bg-[#2e313a] text-white">Medical / Sick Leave</option>
                </>
              )}
            </select>
          </div>

          {/* Child 3: Dates & Duration Configuration */}
          <div className="space-y-3">
            {/* Direct Child 1: Start Date (Matches CSS selector 2) */}
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                {durationType === 'MULTI_DAY' ? 'Start Date' : 'Absence Date'}
              </label>
              <input
                style={{ backgroundColor: '#2e313a' }}
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (durationType !== 'MULTI_DAY') {
                    setEndDate(e.target.value);
                  }
                }}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white font-bold focus:outline-none focus:border-[#a0c9eb]"
              />
            </div>

            {/* Direct Child 2: End Date (Matches CSS selector 1) */}
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                {durationType === 'MULTI_DAY' ? 'End Date (Consecutive Calendar Days)' : 'Shift Portion Date'}
              </label>
              <input
                style={{ backgroundColor: '#2e313a' }}
                type="date"
                value={durationType === 'MULTI_DAY' ? endDate : startDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={durationType !== 'MULTI_DAY'}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white font-bold focus:outline-none focus:border-[#a0c9eb] disabled:opacity-50"
              />
            </div>

            {/* Direct Child 3: Duration & Increment Selector */}
            <div className="space-y-1">
              <label className="block meta-mono text-slate-200 font-semibold text-[11px]">
                Duration & Increment (Determined in Days: 1/2 or Full Day)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'FULL_DAY', label: 'Full Day (1.0d)', desc: 'Whole day' },
                  { id: 'HALF_DAY_AM', label: '1/2 Day AM (0.5d)', desc: 'Morning session' },
                  { id: 'HALF_DAY_PM', label: '1/2 Day PM (0.5d)', desc: 'Afternoon session' },
                  { id: 'MULTI_DAY', label: 'Multi-Day (Consec.)', desc: 'Continuous block' }
                ].map(opt => {
                  const isActive = durationType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDurationType(opt.id as any)}
                      className={`py-1.5 px-2 rounded-xs border text-center font-mono text-[11px] font-bold cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#a0c9eb] text-[#111] border-[#a0c9eb] shadow-xs'
                          : 'bg-[#2e313a] text-slate-200 border-white/15 hover:border-white/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Child 4: Live Duration Calculation & Exceeds Alert */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono bg-[#282b35] px-3 py-2 rounded-xs border border-white/15">
                <span className="text-slate-300 font-semibold">Total Requested Time:</span>
                <span className="text-[#a0c9eb] font-bold">
                  {dayCount} {dayCount === 1 ? 'Day' : 'Days'} ({dayCount * 8}h equivalent)
                </span>
              </div>

              {durationType === 'MULTI_DAY' && (
                <p className="text-[10px] text-amber-300 font-mono">
                  &bull; Consecutive window: all calendar days between start and end dates are counted.
                </p>
              )}

              {!isValidDateRange && (
                <p className="text-[11px] text-rose-400 font-bold font-mono">
                  Error: End date must be on or after start date.
                </p>
              )}

              {/* PTO Balance Exceeded Alert */}
              {isBalanceExceeded && (
                <div className="bg-amber-950/70 border border-amber-500/60 p-3 rounded-xs text-amber-200 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>ALERT: REQUEST EXCEEDS AVAILABLE PTO BALANCE</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    You are requesting <strong>{dayCount} Days</strong> of PTO, but only <strong>{availablePtoDays.toFixed(1)} Days</strong> remain available in your annual allotment. 
                    Submitting this will create a deficit of -{(dayCount - availablePtoDays).toFixed(1)} days and requires Chief / Administrator override approval.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Child 4: Covering Colleague Select */}
          <div>
            <label className="block meta-mono text-slate-200 font-semibold mb-1">
              Covering Colleague
            </label>
            <select
              style={{ backgroundColor: '#2e313a' }}
              value={backupDoc}
              onChange={(e) => setBackupDoc(e.target.value)}
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist text-white focus:outline-none focus:border-[#a0c9eb] cursor-pointer"
            >
              <option value="Pool Coverage" className="bg-[#2e313a] text-white">Pool Coverage / Float Pool</option>
              {users.filter(u => !u.isArchived && u.id !== radId).map(u => (
                <option key={u.id} value={u.name} className="bg-[#2e313a] text-white">
                  {formatPersonName(u.name, u.role, u.title)}
                </option>
              ))}
            </select>
          </div>

          {/* Child 5: Description & Notes Input (and Email notice) */}
          <div className="space-y-2">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Description & Notes
              </label>
              <input
                style={{ backgroundColor: '#2e313a' }}
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. RSNA annual meeting presentation / Personal time"
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#a0c9eb]"
              />
            </div>

            {/* Email Routing Notice */}
            <div className="bg-[#282b35] p-2.5 rounded-xs border border-white/15 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-200">
                <Mail className="w-3.5 h-3.5 text-[#a0c9eb]" />
                <span className="font-semibold">Notice Emailed To:</span>
                <span className="font-mono text-[#a0c9eb] font-bold">{managerEmail}</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Auto-Dispatched
              </span>
            </div>
          </div>

          {/* Child 6: Action Buttons Container (Matches CSS selector 8 and button selector 7) */}
          <div className="flex justify-end gap-2 pt-2 border-t border-white/15">
            <button
              style={{ color: '#ee8979' }}
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xs border border-white/20 text-[#ee8979] hover:text-white cursor-pointer font-mono text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidDateRange}
              className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold px-4 py-2 rounded-xs shadow-xs cursor-pointer transition-colors font-mono text-xs disabled:opacity-50"
            >
              {isAdmin ? 'Record Approved Leave' : 'Submit & Email Request'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
