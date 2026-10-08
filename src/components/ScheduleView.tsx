import React, { useState } from 'react';
import { 
  Syringe, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Split,
  Stethoscope
} from 'lucide-react';
import { 
  Shift, 
  StaffUser, 
  ClinicalSite, 
  Specialty, 
  ScheduleConflict, 
  UserRole 
} from '../types';
import { 
  formatDateWithDay, 
  formatPersonName, 
  getMondayISO, 
  addDaysISO, 
  formatMonthYear 
} from '../utils/formatters';

interface ScheduleViewProps {
  shifts: Shift[];
  users: StaffUser[];
  sites: Record<string, ClinicalSite>;
  conflicts: ScheduleConflict[];
  activeDate: string;
  setActiveDate: (date: string) => void;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  selectedSites: Set<string>;
  setSelectedSites: React.Dispatch<React.SetStateAction<Set<string>>>;
  activeSpecialty?: Specialty | 'ALL';
  setActiveSpecialty?: (spec: Specialty | 'ALL') => void;
  selectedSpecialties?: Set<string>;
  selectedRoleFilter: UserRole | 'ALL';
  setSelectedRoleFilter: (role: UserRole | 'ALL') => void;
  selectedDates: Set<string>;
  onOpenDateFilterModal: () => void;
  onResetDateFilter: () => void;
  onOpenShiftModal: (date?: string, site?: string) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onOpenContrastModal: (site?: string, date?: string) => void;
  onOpenCopyModal: () => void;
  onExportCsv: () => void;
  onMoveShift: (shiftId: string, targetDate: string, targetSite?: string) => void;
  onSwapShifts: (shiftIdA: string, shiftIdB: string) => void;
  onSelectConflict: (conflict: ScheduleConflict) => void;
  displayMode?: 'GRID' | 'SLOTS' | 'MOBILE';
  searchQuery?: string;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  shifts,
  users,
  sites,
  conflicts,
  activeDate,
  setActiveDate,
  activeMonth,
  selectedSites,
  activeSpecialty = 'ALL',
  selectedSpecialties = new Set(),
  selectedRoleFilter,
  selectedDates,
  onOpenShiftModal,
  onEditShift,
  onDeleteShift,
  onOpenContrastModal,
  onMoveShift,
  onSwapShifts,
  onSelectConflict,
  displayMode = 'GRID',
  searchQuery = ''
}) => {
  const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null);

  const userMap = new Map<string, StaffUser>();
  users.forEach(u => userMap.set(u.id, u));

  const defaultSiteKey = selectedSites.size === 1 ? Array.from(selectedSites)[0] : (Object.keys(sites)[0] || 'SITE-1');

  // Filter shifts based on active filters
  const filteredShifts = shifts.filter(s => {
    if (selectedSpecialties.size > 0) {
      if (!selectedSpecialties.has(s.specialty)) return false;
    } else if (activeSpecialty !== 'ALL' && s.specialty !== activeSpecialty) {
      return false;
    }
    if (selectedSites.size > 0 && !selectedSites.has(s.site)) return false;

    if (selectedRoleFilter !== 'ALL') {
      const user = userMap.get(s.radId);
      if (user?.role !== selectedRoleFilter) return false;
    }

    if (selectedDates.size > 0) {
      if (!selectedDates.has(s.date)) return false;
    } else if (activeMonth) {
      if (s.date.substring(0, 7) !== activeMonth) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const user = userMap.get(s.radId);
      const docName = user ? user.name.toLowerCase() : '';
      const siteName = (sites[s.site]?.name || s.site).toLowerCase();
      const modality = (s.modality || '').toLowerCase();
      const ws = (s.workstationId || '').toLowerCase();
      const proc = (s.procedureType || '').toLowerCase();
      if (!docName.includes(q) && !siteName.includes(q) && !modality.includes(q) && !ws.includes(q) && !proc.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Calculate target mondays for grid mode
  let targetMondays: string[] = [];
  if (selectedDates.size > 0) {
    const mondays = new Set<string>();
    selectedDates.forEach(d => mondays.add(getMondayISO(d)));
    targetMondays = Array.from(mondays).sort();
  } else {
    const [y, m] = activeMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const mondays = new Set<string>();
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      mondays.add(getMondayISO(dStr));
    }
    targetMondays = Array.from(mondays).sort();
  }

  // Group shifts by date for quick lookup
  const shiftsByDate: Record<string, Shift[]> = {};
  filteredShifts.forEach(s => {
    if (!shiftsByDate[s.date]) shiftsByDate[s.date] = [];
    shiftsByDate[s.date].push(s);
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, shiftId: string) => {
    setDraggedShiftId(shiftId);
    e.dataTransfer.setData('text/plain', shiftId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnDate = (e: React.DragEvent, targetDate: string, targetSite?: string) => {
    e.preventDefault();
    if (!draggedShiftId) return;
    onMoveShift(draggedShiftId, targetDate, targetSite);
    setDraggedShiftId(null);
  };

  const handleDropOnShift = (e: React.DragEvent, targetShiftId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedShiftId || draggedShiftId === targetShiftId) return;
    onSwapShifts(draggedShiftId, targetShiftId);
    setDraggedShiftId(null);
  };

  const timelineHours = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Primary active conflict for toast banner
  const primaryConflict = conflicts.find(c => c.severity === 'CRITICAL') || conflicts[0];

  return (
    <div className="space-y-6">
      
      {/* 1. Conflict Toast */}
      {primaryConflict && (
        <div className="bg-[#3b1820] border-2 border-[#ef4444] p-4 rounded flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ef4444] shadow-[0_0_12px_#ef4444] shrink-0 animate-pulse" />
            <div className="min-w-0">
              <div className="font-mono text-xs font-black uppercase text-[#ef4444] mb-0.5 tracking-wider">
                COMPLIANCE FAULT &bull; {primaryConflict.type.replace(/_/g, ' ')}
              </div>
              <div className="text-sm font-bold text-white truncate">
                {primaryConflict.message} &mdash; <span className="text-rose-200">{primaryConflict.details}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onSelectConflict(primaryConflict)}
            className="font-mono text-xs font-black bg-[#ef4444] hover:bg-[#dc2626] px-4 py-2 text-black rounded cursor-pointer transition-colors shrink-0 shadow"
          >
            RESOLVE NOW
          </button>
        </div>
      )}

      {/* 2. Main Section Title Banner */}
      <div 
        style={{ height: '36px', paddingBottom: '0px', marginBottom: '4px', borderStyle: 'none' }}
        className="flex flex-wrap justify-between items-baseline gap-3 pb-0 border-none"
      >
        <div>
          <h1 
            style={{ fontSize: '26px', lineHeight: '26px' }}
            className="text-3xl sm:text-5xl font-black text-white tracking-tight"
          >
            {formatMonthYear(activeMonth)}
          </h1>
        </div>
        <div className="font-mono text-xs font-bold text-[#8eb9dd] bg-[#282c35] px-3 py-1.5 rounded border border-[rgba(142, 185, 221,0.3)]">
          VIEWING MONTH &bull; <strong className="text-white font-black">{filteredShifts.length}</strong> ACTIVE ASSIGNMENTS
        </div>
      </div>

      {/* 3. CALENDAR GRID VIEW */}
      {displayMode === 'GRID' && (
        <div className="space-y-8">
          {targetMondays.length === 0 ? (
            <div className="bg-[#282c35] rounded border border-[rgba(255,255,255,0.16)] p-12 text-center text-slate-300 font-mono text-sm font-bold">
              NO CLINICAL ASSIGNMENTS FOUND FOR APPLIED FILTERS
            </div>
          ) : (
            targetMondays.map(monStr => {
              // Outpatient week includes Mon-Fri + Saturday (08:00-13:00)
              const weekDays = Array.from({ length: 6 }, (_, i) => addDaysISO(monStr, i));
              const monDate = new Date(monStr + 'T12:00:00Z');
              const satDate = new Date(addDaysISO(monStr, 5) + 'T12:00:00Z');

              return (
                <div key={monStr} className="space-y-3 bg-[#1f232c] p-4 rounded-xl border border-[rgba(255,255,255,0.12)] shadow-md">
                  
                  {/* Week Indicator */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 uppercase tracking-wider pb-1">
                    <span className="text-white font-extrabold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8eb9dd] shadow-[0_0_8px_#8eb9dd]" />
                      OUTPATIENT WEEK: {monDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &mdash; {satDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[#8eb9dd] bg-[#16181e] px-2.5 py-0.5 rounded border border-[rgba(142, 185, 221,0.25)] font-mono font-black">
                      {weekDays.reduce((acc, d) => acc + (shiftsByDate[d]?.length || 0), 0)} SHIFTS SCHEDULED
                    </span>
                  </div>

                  {/* 6-Column Day Boxes (Mon-Sat Outpatient Window) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
                    {weekDays.map(dateStr => {
                      const dayShifts = shiftsByDate[dateStr] || [];
                      const dayConflicts = conflicts.filter(c => c.date === dateStr);
                      const hasCritical = dayConflicts.some(c => c.severity === 'CRITICAL');
                      const contrastSupervisors = dayShifts.filter(s => s.isSupervisor);
                      const isTodayActive = activeDate === dateStr;
                      const dateObj = new Date(dateStr + 'T12:00:00Z');
                      const dayAbbrev = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getUTCDay()];
                      const dayNum = String(dateObj.getUTCDate()).padStart(2, '0');

                      return (
                        <div
                          key={dateStr}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnDate(e, dateStr)}
                          className={`flex flex-col gap-2.5 min-h-[360px] p-3 rounded-lg border transition-all ${
                            isTodayActive
                              ? 'bg-[#2b303e] border-[#8eb9dd] shadow-[0_0_12px_rgba(142, 185, 221,0.15)] ring-1 ring-[#8eb9dd]'
                              : hasCritical
                                ? 'bg-[#302126] border-rose-500'
                                : 'bg-[#252934] border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)]'
                          }`}
                        >
                          {/* Day Label Bar */}
                          <div 
                            onClick={() => setActiveDate(dateStr)}
                            className={`pb-2 flex justify-between items-baseline border-b transition-colors cursor-pointer ${
                              isTodayActive 
                                ? 'border-[#8eb9dd] text-[#8eb9dd]' 
                                : hasCritical 
                                  ? 'border-rose-500 text-rose-300' 
                                  : 'border-[rgba(255,255,255,0.15)] text-white hover:text-[#8eb9dd]'
                            }`}
                          >
                            <span className="font-mono text-sm font-black text-inherit">
                              {dayAbbrev} {dayNum}
                            </span>
                            <span className="font-mono text-xs font-extrabold px-1.5 py-0.5 rounded bg-[#16181e] text-white">
                              {dayShifts.length}
                            </span>
                          </div>

                          {/* Contrast Supervisor Indicator */}
                          {contrastSupervisors.length > 0 ? (
                            <div className="text-xs font-mono font-bold text-black bg-[#8eb9dd] px-2 py-1 rounded flex items-center justify-between shadow-xs">
                              <span className="truncate">
                                {contrastSupervisors.map(s => `${s.site}: ${userMap.get(s.radId)?.name.replace(/^Dr\.\s*/, '')}`).join(', ')}
                              </span>
                              <Syringe className="w-3.5 h-3.5 text-black shrink-0" />
                            </div>
                          ) : (
                            <button
                              onClick={() => onOpenContrastModal(defaultSiteKey, dateStr)}
                              style={{ backgroundColor: '#41282b', borderColor: '#8f4e5e' }}
                              className="text-xs font-mono font-bold text-rose-200 bg-[#41282b] border border-[#8f4e5e] hover:bg-[#541e27] px-2 py-1 rounded text-left cursor-pointer transition-colors"
                            >
                              (!) No Contrast Supervisor
                            </button>
                          )}

                          {/* Shift Cards */}
                          <div className="space-y-2.5 flex-1">
                            {dayShifts.length === 0 ? (
                              <div className="font-mono text-xs font-bold py-10 text-center text-slate-400">
                                -- NO SHIFTS --
                              </div>
                            ) : (
                              dayShifts.map(shift => {
                                const user = userMap.get(shift.radId);
                                const isAP = user?.role === 'ADVANCED_PRACTITIONER';
                                const isNoRad = shift.radId === 'NO_RAD_NEEDED';
                                const shiftConflicts = conflicts.filter(c => c.shiftId === shift.id || (c.date === shift.date && c.radId === shift.radId));
                                const hasError = shiftConflicts.length > 0;

                                return (
                                  <div
                                    key={shift.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, shift.id)}
                                    onDrop={(e) => handleDropOnShift(e, shift.id)}
                                    onDragOver={handleDragOver}
                                    onClick={() => onEditShift(shift)}
                                    className={`p-3 rounded border transition-all cursor-pointer group relative shadow-sm ${
                                      hasError 
                                        ? 'bg-[#3b1c24] border-2 border-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.4)]' 
                                        : 'bg-[#2b303d] hover:bg-[#343a49] border-[rgba(255,255,255,0.14)] hover:border-[#8eb9dd]'
                                    }`}
                                  >
                                    {/* Card Meta Row */}
                                    <div className="font-mono mb-1.5 flex items-center justify-between text-xs font-bold">
                                      <span className={hasError ? 'text-[#ef4444] font-black' : 'text-[#8eb9dd] font-black'}>
                                        {shift.specialty} &bull; {shift.hours.split('-')[0].trim()}
                                      </span>
                                      <span className="text-white font-bold bg-[#242831] px-1.5 py-0.5 rounded text-[10px]">
                                        {shift.site}
                                      </span>
                                    </div>

                                    {/* Clinician Name */}
                                    <div className="font-bold text-sm text-white leading-tight flex items-center gap-1.5">
                                      {isAP && <Stethoscope className="w-4 h-4 text-[#38bdf8] shrink-0" />}
                                      <span className="truncate">
                                        {isNoRad ? 'No Rad Needed' : formatPersonName(user?.name || 'Physician', user?.role, user?.title)}
                                      </span>
                                    </div>

                                    {/* AP Procedure / Split Badge */}
                                    {shift.procedureType && (
                                      <div className="font-mono text-xs font-bold text-[#38bdf8] mt-1.5 truncate bg-[#1e2738] px-1.5 py-0.5 rounded">
                                        Proc: {shift.procedureType}
                                      </div>
                                    )}

                                    {shift.isSplit && (
                                      <div className="font-mono text-xs font-bold text-[#a5b4fc] mt-1.5 truncate bg-[#25283f] px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Split className="w-3 h-3" />
                                        <span>Split: {shift.splitDetails || (shift.splitSite || 'Remote')}</span>
                                      </div>
                                    )}

                                    {/* Conflict Warning */}
                                    {hasError && (
                                      <div className="font-mono text-xs text-white bg-rose-600 px-1.5 py-1 rounded mt-2 font-black flex items-center gap-1">
                                        <span>(!)</span> {shiftConflicts[0].message}
                                      </div>
                                    )}

                                    {/* Hover Actions */}
                                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-[#242831] p-1 rounded border border-white">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditShift(shift);
                                        }}
                                        className="p-1 text-white hover:text-[#8eb9dd] cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteShift(shift.id);
                                        }}
                                        className="p-1 text-white hover:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Quick Add Button */}
                          <button
                            onClick={() => onOpenShiftModal(dateStr, defaultSiteKey)}
                            className="w-full text-center font-mono text-xs font-bold text-white hover:text-black hover:bg-[#8eb9dd] py-1.5 border border-[rgba(255,255,255,0.2)] rounded cursor-pointer transition-colors"
                          >
                            + ADD SHIFT
                          </button>

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. HOURLY TIMELINE VIEW */}
      {displayMode === 'SLOTS' && (
        <div className="bg-[#282c35] border border-[rgba(255,255,255,0.16)] rounded-xl p-5 space-y-4 overflow-x-auto shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.16)]">
            <span className="font-mono text-sm font-black text-[#8eb9dd]">
              Diagnostic Reading Windows (07:00 &ndash; 18:00)
            </span>
            <span className="font-mono text-xs font-bold text-white bg-[#1e2128] px-2.5 py-1 rounded">Drag cards between hours</span>
          </div>

          {targetMondays.map(monStr => {
            const weekDays = Array.from({ length: 5 }, (_, i) => addDaysISO(monStr, i));
            return (
              <div key={`tl-${monStr}`} className="border border-[rgba(255,255,255,0.14)] rounded overflow-hidden min-w-[850px] mb-6">
                
                {/* Header Row */}
                <div className="grid grid-cols-6 bg-[#1e2128] border-b border-[rgba(255,255,255,0.16)] py-3 px-2 text-center font-mono font-black text-xs text-white">
                  <div className="text-slate-400 uppercase">Time Block</div>
                  {weekDays.map(dStr => (
                    <div key={dStr} className="text-white font-extrabold">
                      {formatDateWithDay(dStr)}
                    </div>
                  ))}
                </div>

                {/* Hours rows */}
                {timelineHours.map(hourStr => {
                  const hourNum = parseInt(hourStr.split(':')[0], 10);
                  return (
                    <div key={hourStr} className="grid grid-cols-6 border-b border-[rgba(255,255,255,0.1)] min-h-[48px] hover:bg-[#323742] transition-colors">
                      <div className="p-2 text-xs font-mono font-bold text-slate-300 flex items-center justify-center bg-[#242831] border-r border-[rgba(255,255,255,0.1)]">
                        {hourStr}
                      </div>

                      {weekDays.map(dStr => {
                        const dayShifts = shiftsByDate[dStr] || [];
                        const activeInHour = dayShifts.filter(s => {
                          const match = s.hours.match(/(\d{1,2}):\d{2}\s*-\s*(\d{1,2}):\d{2}/);
                          if (match) {
                            const startH = parseInt(match[1], 10);
                            const endH = parseInt(match[2], 10);
                            return hourNum >= startH && hourNum < endH;
                          }
                          return hourNum >= 8 && hourNum < 17;
                        });

                        return (
                          <div
                            key={`${dStr}-${hourStr}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropOnDate(e, dStr)}
                            className="p-1 border-r border-[rgba(255,255,255,0.1)] flex flex-wrap gap-1.5 items-center"
                          >
                            {activeInHour.map(s => {
                              const user = userMap.get(s.radId);
                              return (
                                <div
                                  key={s.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, s.id)}
                                  onClick={() => onEditShift(s)}
                                  className="bg-[#333844] hover:bg-[#3d4352] text-white hover:text-[#8eb9dd] border border-[rgba(255,255,255,0.2)] hover:border-[#8eb9dd] px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors shadow-xs"
                                >
                                  {user?.name.replace(/^Dr\.\s*/, '')} ({s.site})
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

              </div>
            );
          })}
        </div>
      )}

      {/* 5. MOBILE AGENDA STREAM VIEW */}
      {displayMode === 'MOBILE' && (
        <div className="bg-[#282c35] border border-[rgba(255,255,255,0.16)] rounded-xl p-5 space-y-4 max-w-xl mx-auto shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.16)]">
            <button
              onClick={() => setActiveDate(addDaysISO(activeDate, -1))}
              className="font-mono text-xs font-bold bg-[#1e2128] border border-[rgba(255,255,255,0.2)] hover:border-[#8eb9dd] px-3.5 py-2 rounded cursor-pointer text-white hover:text-[#8eb9dd]"
            >
              &larr; PREV
            </button>
            <div className="text-center">
              <span className="font-black text-base text-[#8eb9dd] block">
                {formatDateWithDay(activeDate)}
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {(shiftsByDate[activeDate] || []).length} SHIFTS
              </span>
            </div>
            <button
              onClick={() => setActiveDate(addDaysISO(activeDate, 1))}
              className="font-mono text-xs font-bold bg-[#1e2128] border border-[rgba(255,255,255,0.2)] hover:border-[#8eb9dd] px-3.5 py-2 rounded cursor-pointer text-white hover:text-[#8eb9dd]"
            >
              NEXT &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {(shiftsByDate[activeDate] || []).length === 0 ? (
              <p className="text-center font-mono text-xs font-bold py-10 text-slate-400">NO ASSIGNMENTS SCHEDULED</p>
            ) : (
              (shiftsByDate[activeDate] || []).map(s => {
                const user = userMap.get(s.radId);
                return (
                  <div key={s.id} className="p-3.5 bg-[#333844] border border-[rgba(255,255,255,0.15)] rounded space-y-1.5">
                    <div className="font-mono flex justify-between text-xs font-bold text-[#8eb9dd]">
                      <span>{s.specialty} &bull; {s.hours}</span>
                      <span className="bg-[#242831] px-2 py-0.5 rounded text-white">{s.site}</span>
                    </div>
                    <div className="font-bold text-base text-white">
                      {formatPersonName(user?.name || 'Physician', user?.role, user?.title)}
                    </div>
                    {s.isSupervisor && (
                      <div className="font-mono text-xs font-black text-emerald-400">
                        [ON-SITE CONTRAST SUPERVISOR]
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
