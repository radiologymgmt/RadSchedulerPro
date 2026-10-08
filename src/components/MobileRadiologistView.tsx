import React, { useState } from 'react';
import { 
  StaffUser, 
  ClinicalSite, 
  Shift, 
  LeaveRequest, 
  Workstation,
  Specialty
} from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Syringe, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  CalendarX2, 
  Monitor, 
  Maximize2, 
  Smartphone,
  PhoneCall,
  Search
} from 'lucide-react';
import { formatPersonName } from '../utils/formatters';

interface MobileRadiologistViewProps {
  currentUser: StaffUser;
  setCurrentUser: (user: StaffUser) => void;
  users: StaffUser[];
  shifts: Shift[];
  sites: Record<string, ClinicalSite>;
  workstations: Workstation[];
  leaves: LeaveRequest[];
  activeDate: string;
  setActiveDate: (date: string) => void;
  onOpenLeaveModal: () => void;
  onExitMobile: () => void;
  contrastSupervisorSiteMap?: Record<string, string>; // siteKey -> radId
}

export const MobileRadiologistView: React.FC<MobileRadiologistViewProps> = ({
  currentUser,
  setCurrentUser,
  users,
  shifts,
  sites,
  workstations,
  leaves,
  activeDate,
  setActiveDate,
  onOpenLeaveModal,
  onExitMobile,
}) => {
  const [mobileTab, setMobileTab] = useState<'MY_DUTY' | 'ROSTER' | 'MY_WEEK'>('MY_DUTY');
  const [rosterSiteFilter, setRosterSiteFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Step dates
  const handleStepDay = (delta: number) => {
    const d = new Date(activeDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setActiveDate(d.toISOString().slice(0, 10));
  };

  const handleSetToday = () => {
    setActiveDate(new Date().toISOString().slice(0, 10));
  };

  // Find current user's shift for activeDate
  const myTodayShifts = shifts.filter(s => s.radId === currentUser.id && s.date === activeDate);
  const myPrimaryShift = myTodayShifts[0];

  // Find if user is on leave today
  const myTodayLeave = leaves.find(l => 
    l.radId === currentUser.id && 
    l.status === 'Approved' && 
    activeDate >= l.startDate && 
    activeDate <= l.endDate
  );

  // Shifts for all users on activeDate
  const allTodayShifts = shifts.filter(s => s.date === activeDate);

  // Find site supervisor for active site
  const siteKey = myPrimaryShift?.site || Object.keys(sites)[0] || 'MAIN';
  const siteInfo = sites[siteKey];
  const activeWs = workstations.find(ws => ws.id === myPrimaryShift?.workstationId);

  // Find who the contrast supervisor is at my site today
  const siteContrastShift = allTodayShifts.find(s => s.site === siteKey && s.isSupervisor);
  const contrastSupervisorUser = siteContrastShift ? users.find(u => u.id === siteContrastShift.radId) : null;
  const isMeContrastSupervisor = myPrimaryShift?.isSupervisor;

  // Filtered roster for active date
  const filteredRoster = allTodayShifts.filter(s => {
    if (rosterSiteFilter !== 'ALL' && s.site !== rosterSiteFilter) return false;
    if (searchQuery.trim()) {
      const u = users.find(usr => usr.id === s.radId);
      const q = searchQuery.toLowerCase();
      const matchName = u?.name.toLowerCase().includes(q);
      const matchSpec = s.specialty.toLowerCase().includes(q);
      const matchMod = s.modality.toLowerCase().includes(q);
      return matchName || matchSpec || matchMod;
    }
    return true;
  });

  // Calculate upcoming 7 days for currentUser
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeDate + 'T12:00:00');
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayShifts = shifts.filter(s => s.radId === currentUser.id && s.date === dateStr);
    const dayLeave = leaves.find(l => 
      l.radId === currentUser.id && 
      l.status === 'Approved' && 
      dateStr >= l.startDate && 
      dateStr <= l.endDate
    );
    return {
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      shifts: dayShifts,
      leave: dayLeave,
      isToday: dateStr === new Date().toISOString().slice(0, 10)
    };
  });

  const formattedActiveDate = new Date(activeDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] text-slate-900 pb-20 select-none">
      
      {/* 1. Mobile Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {(currentUser.name || 'MD').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 leading-tight">
                  {formatPersonName(currentUser.name)}
                </span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-mono font-bold px-1.5 py-0.5 rounded">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {currentUser.specialties.join(', ') || 'Diagnostic Radiology'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* User Switcher Dropdown */}
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = users.find(usr => usr.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="text-xs bg-slate-100 border border-slate-300 text-slate-700 rounded px-2 py-1.5 font-medium outline-none"
              title="Switch Physician Profile"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>

            {/* Exit to Desktop */}
            <button
              onClick={onExitMobile}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded transition-colors"
              title="Switch to Full Desktop View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Interactive Date Stepper */}
        <div className="mt-3 flex items-center justify-between bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => handleStepDay(-1)}
            className="p-2 hover:bg-white rounded-md text-slate-700 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <div className="text-xs font-bold text-slate-900">
              {formattedActiveDate}
            </div>
            <button
              onClick={handleSetToday}
              className="text-[10px] text-sky-700 hover:text-sky-800 font-mono font-bold underline cursor-pointer"
            >
              Jump to Today
            </button>
          </div>

          <button 
            onClick={() => handleStepDay(1)}
            className="p-2 hover:bg-white rounded-md text-slate-700 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Main Content Views */}
      <main className="p-4 space-y-4 max-w-lg mx-auto w-full flex-1">
        
        {/* TAB 1: MY DUTY (Personal Clinical Status) */}
        {mobileTab === 'MY_DUTY' && (
          <div className="space-y-4">
            
            {/* Shift Status Hero Card */}
            {myTodayLeave ? (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 text-amber-800 rounded-full">
                    <CalendarX2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                      Approved Clinical Absence
                    </span>
                    <h2 className="text-lg font-bold text-amber-950">
                      On {myTodayLeave.category} Leave
                    </h2>
                    <p className="text-xs text-amber-800 mt-0.5">
                      {myTodayLeave.notes || 'Scheduled time off logged in department portal.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : myPrimaryShift ? (
              <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Active Shift Assignment
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {myPrimaryShift.modality}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      On Duty
                    </span>
                  </div>
                </div>

                {/* Key Assignment Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      <span>Shift Hours</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm font-mono">
                      {myPrimaryShift.hours}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" />
                      <span>Facility / Site</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm truncate" title={siteInfo?.label}>
                      {siteInfo?.label || myPrimaryShift.site}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                      <Monitor className="w-3.5 h-3.5 text-slate-600" />
                      <span>Assigned Reading Workstation</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {myPrimaryShift.workstationId || 'Reading Pod 1'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {activeWs?.monitorType || 'Diagnostic Dual Display'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contrast Supervision Card */}
                {isMeContrastSupervisor ? (
                  <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                    <Syringe className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-emerald-900">
                        You Are The Contrast Supervisor
                      </div>
                      <p className="text-emerald-800 text-[11px] mt-0.5 leading-snug">
                        You are designated as the on-site contrast supervisor for <strong>{siteInfo?.label}</strong>. You must remain on premise to supervise IV contrast administrations.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-sky-700 shrink-0" />
                      <div>
                        <div className="font-bold text-sky-900">Contrast Supervisor on Duty:</div>
                        <div className="text-slate-700 text-xs">
                          {contrastSupervisorUser ? formatPersonName(contrastSupervisorUser.name) : 'No supervisor designated yet'}
                        </div>
                      </div>
                    </div>
                    {contrastSupervisorUser && (
                      <span className="text-[10px] bg-white px-2 py-1 rounded border border-sky-300 font-bold text-sky-800">
                        On-Site
                      </span>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-slate-300 rounded-xl p-8 text-center shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">No Shift Scheduled Today</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    You have no scheduled clinical reading assignments or contrast duties on {formattedActiveDate}.
                  </p>
                </div>
                <button
                  onClick={onOpenLeaveModal}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-3 py-2 rounded-lg border border-sky-200 cursor-pointer"
                >
                  <CalendarX2 className="w-4 h-4" />
                  Request Future Time Off
                </button>
              </div>
            )}

            {/* Quick Department Protocols / Contact Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                <span>Department Emergency Contacts</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Reading Room Lead</span>
                  <span className="font-bold text-slate-800 font-mono">Ext. 4101</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">CT/MRI Control Tech</span>
                  <span className="font-bold text-slate-800 font-mono">Ext. 4108</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Rapid Response / Code</span>
                  <span className="font-bold text-rose-700 font-mono">Ext. 5555</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">PACS / IT Helpdesk</span>
                  <span className="font-bold text-slate-800 font-mono">Ext. 2200</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DEPARTMENT ROSTER (Who else is on duty today) */}
        {mobileTab === 'ROSTER' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Department On-Duty Roster ({filteredRoster.length})
              </h2>
              <span className="text-[11px] font-mono text-slate-500">
                {formattedActiveDate}
              </span>
            </div>

            {/* Search & Site Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by radiologist, specialty, or modality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-600"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setRosterSiteFilter('ALL')}
                  className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap text-xs transition-colors ${
                    rosterSiteFilter === 'ALL'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All Facilities
                </button>
                {Object.entries(sites).map(([k, s]) => (
                  <button
                    key={k}
                    onClick={() => setRosterSiteFilter(k)}
                    className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap text-xs transition-colors ${
                      rosterSiteFilter === k
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Roster Cards */}
            <div className="space-y-2">
              {filteredRoster.length === 0 ? (
                <div className="bg-white border border-slate-300 rounded-xl p-6 text-center text-slate-500 text-xs">
                  No scheduled shifts matching criteria for {formattedActiveDate}.
                </div>
              ) : (
                filteredRoster.map(s => {
                  const rad = users.find(u => u.id === s.radId);
                  const isMe = s.radId === currentUser.id;
                  return (
                    <div 
                      key={s.id}
                      className={`bg-white border rounded-xl p-3 shadow-xs space-y-2 ${
                        isMe ? 'border-sky-400 ring-1 ring-sky-300' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                            isMe ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {(rad?.name || 'MD').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>{formatPersonName(rad?.name || 'Attending')}</span>
                              {isMe && (
                                <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1 rounded">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {s.specialty} &bull; {rad?.role || 'ATTENDING'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {s.hours}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {sites[s.site]?.label || s.site}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {s.isSupervisor && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Syringe className="w-3 h-3 text-emerald-600" />
                              Contrast Sup
                            </span>
                          )}
                          <span className="font-mono text-slate-500 text-[10px]">
                            {s.workstationId || 'Pod 1'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MY WEEK (7-Day Personal Schedule) */}
        {mobileTab === 'MY_WEEK' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  My 7-Day Outlook
                </h2>
                <p className="text-[11px] text-slate-500">
                  {formatPersonName(currentUser.name)}
                </p>
              </div>
              <button
                onClick={onOpenLeaveModal}
                className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-200 flex items-center gap-1 cursor-pointer"
              >
                <CalendarX2 className="w-3.5 h-3.5" />
                Request Off
              </button>
            </div>

            <div>
              <div className="space-y-2">
                {upcomingDays.map((day, idx) => {
                  const cardBg = '#41282b';
                  const cardColor = idx >= 2 ? '#eaa2a2' : undefined;
                  const leftColor = (idx === 0 || idx === 1 || idx === 3) ? '#eaa2a2' : undefined;

                  return (
                    <div 
                      key={day.date}
                      onClick={() => {
                        setActiveDate(day.date);
                        setMobileTab('MY_DUTY');
                      }}
                      style={{
                        backgroundColor: cardBg,
                        ...(cardColor ? { color: cardColor } : {})
                      }}
                      className={`border rounded-xl p-3 shadow-xs cursor-pointer transition-colors ${
                        day.date === activeDate ? 'border-rose-400/60 ring-1 ring-rose-400' : 'border-[#5a383c]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Child div 1: Left content */}
                        <div 
                          className="flex items-center gap-3"
                          style={leftColor ? { color: leftColor } : {}}
                        >
                          <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                            day.isToday ? 'bg-rose-900 text-rose-100' : 'bg-black/30 text-rose-200'
                          }`}>
                            <span 
                              style={{ color: '#eaa2a2' }}
                              className="text-[10px] font-bold uppercase leading-none"
                            >
                              {day.dayName}
                            </span>
                            <span 
                              style={{ color: '#eaa2a2' }}
                              className="text-xs font-black leading-none mt-0.5"
                            >
                              {day.date.split('-')[2]}
                            </span>
                          </div>

                          <div>
                            <div className="text-xs font-bold" style={{ color: '#eaa2a2' }}>
                              <span style={{ color: '#eaa2a2' }}>{day.formattedDate}</span>
                              {day.isToday && <span style={{ color: '#eaa2a2' }} className="font-bold ml-1">(Today)</span>}
                            </div>
                            {day.leave ? (
                              <span style={{ color: '#eaa2a2' }} className="text-[11px] font-bold flex items-center gap-1 mt-0.5">
                                <CalendarX2 className="w-3 h-3 text-[#eaa2a2]" />
                                <span style={{ color: '#eaa2a2' }}>{day.leave.category} Leave</span>
                              </span>
                            ) : day.shifts.length > 0 ? (
                              <div style={{ color: '#eaa2a2' }} className="text-[11px] font-medium mt-0.5">
                                <span style={{ color: '#eaa2a2' }}>{day.shifts[0].modality} &bull; {sites[day.shifts[0].site]?.label || day.shifts[0].site}</span>
                              </div>
                            ) : (
                              <div style={{ color: '#eaa2a2' }} className="text-[11px] mt-0.5">
                                <span style={{ color: '#eaa2a2' }}>No shift assigned</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Child div 2: Right content */}
                        <div className="text-right">
                          <span 
                            style={{ color: '#eaa2a2' }}
                            className="text-[10px] font-mono font-bold bg-black/40 px-2 py-1 rounded border border-white/10"
                          >
                            {day.shifts.length > 0 ? day.shifts[0].hours : 'OFF'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 4. Mobile Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-300 py-1.5 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setMobileTab('MY_DUTY')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            mobileTab === 'MY_DUTY'
              ? 'text-sky-700 bg-sky-50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>My Duty</span>
        </button>

        <button
          onClick={() => setMobileTab('ROSTER')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            mobileTab === 'ROSTER'
              ? 'text-sky-700 bg-sky-50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Department</span>
        </button>

        <button
          onClick={() => setMobileTab('MY_WEEK')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            mobileTab === 'MY_WEEK'
              ? 'text-sky-700 bg-sky-50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Week</span>
        </button>

        <button
          onClick={onExitMobile}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Desktop</span>
        </button>
      </nav>

    </div>
  );
};
