import React, { useState } from 'react';
import { 
  Layers, 
  Stethoscope, 
  Split, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { Shift, StaffUser, ClinicalSite, Specialty, ComplianceRule } from '../types';
import { formatDateWithDay, formatPersonName, addDaysISO, getSpecialtyColor } from '../utils/formatters';

interface SpecialtyMatrixViewProps {
  shifts: Shift[];
  users: StaffUser[];
  sites: Record<string, ClinicalSite>;
  rules: ComplianceRule[];
  activeDate: string;
  setActiveDate: (date: string) => void;
  onEditShift: (shift: Shift) => void;
  onOpenShiftModal: (date?: string, site?: string) => void;
}

export const SpecialtyMatrixView: React.FC<SpecialtyMatrixViewProps> = ({
  shifts,
  users,
  sites,
  rules,
  activeDate,
  setActiveDate,
  onEditShift,
  onOpenShiftModal
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'matrix' | 'ap'>('matrix');

  const userMap = new Map<string, StaffUser>();
  users.forEach(u => userMap.set(u.id, u));

  const dayShifts = shifts.filter(s => s.date === activeDate && s.radId !== 'NO_RAD_NEEDED');
  const apShifts = dayShifts.filter(s => {
    const u = userMap.get(s.radId);
    return u?.role === 'ADVANCED_PRACTITIONER' || s.procedureType;
  });

  const specialties: Specialty[] = [
    'Body', 'Neuro', 'MSK', 'PET', 'Breast', 'Breast MRI', 'Interventional'
  ];

  return (
    <div className="space-y-6">
      
      {/* Date Header & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(238,237,234,0.1)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveDate(addDaysISO(activeDate, -1))}
            className="p-1.5 rounded-xs bg-[#1c1c1f] hover:bg-[#242429] text-[rgba(238,237,234,0.6)] hover:text-white border border-[rgba(238,237,234,0.15)] cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#8eb9dd]" />
              <h2 className="text-xl sm:text-2xl font-light text-[#eeedea] tracking-tight">
                {formatDateWithDay(activeDate)}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setActiveDate(addDaysISO(activeDate, 1))}
            className="p-1.5 rounded-xs bg-[#1c1c1f] hover:bg-[#242429] text-[rgba(238,237,234,0.6)] hover:text-white border border-[rgba(238,237,234,0.15)] cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedSubTab('matrix')}
            className={`meta-mono px-3 py-1.5 rounded-xs border transition-colors cursor-pointer ${
              selectedSubTab === 'matrix' 
                ? 'bg-[#8eb9dd] text-black border-[#8eb9dd] font-bold' 
                : 'bg-transparent text-[rgba(238,237,234,0.6)] border-[rgba(238,237,234,0.15)] hover:text-white'
            }`}
          >
            Subspecialty Quotas ({specialties.length})
          </button>
          <button
            onClick={() => setSelectedSubTab('ap')}
            className={`meta-mono px-3 py-1.5 rounded-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedSubTab === 'ap' 
                ? 'bg-[#8eb9dd] text-black border-[#8eb9dd] font-bold' 
                : 'bg-transparent text-[rgba(238,237,234,0.6)] border-[rgba(238,237,234,0.15)] hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>AP Procedures ({apShifts.length})</span>
          </button>
        </div>
      </div>

      {selectedSubTab === 'matrix' && (
        <div className="space-y-6">
          
          {/* Subspecialty Quota Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {specialties.map(spec => {
              const activeCount = dayShifts.filter(s => s.specialty === spec).length;
              const rule = rules.find(r => r.type === 'SPECIALTY_QUOTA' && r.target === spec);
              const minReq = rule?.minCount || 1;
              const isDeficit = activeCount < minReq;

              return (
                <div
                  key={spec}
                  style={{
                    backgroundColor: '#41282b',
                    color: '#eaa2a2'
                  }}
                  className={`p-3.5 rounded-xs border transition-all ${
                    isDeficit 
                      ? 'border-[#7f1d1d]' 
                      : 'border-[rgba(238,237,234,0.1)] hover:border-[rgba(142, 185, 221,0.3)]'
                  }`}
                >
                  <span className="meta-mono block truncate text-[rgba(238,237,234,0.5)]">
                    {spec}
                  </span>
                  <div 
                    style={{ color: '#eaa2a2' }}
                    className="flex items-baseline justify-between mt-1"
                  >
                    <span 
                      style={{ color: '#eaa2a2' }}
                      className="text-2xl font-light font-mono"
                    >
                      {activeCount}
                    </span>
                    <span className="meta-mono opacity-50">
                      /{minReq}
                    </span>
                  </div>
                  <div className="mt-2 pt-1 border-t border-[rgba(238,237,234,0.06)] flex items-center justify-between meta-mono text-[9px]">
                    <span style={{ color: '#eaa2a2' }}>
                      {isDeficit ? 'DEFICIT' : 'COVERED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Specialty Coverage Table */}
          <div className="bg-[#1c1c1f] rounded-xs border border-[rgba(238,237,234,0.1)] overflow-hidden">
            <div className="p-3.5 bg-[#111113] border-b border-[rgba(238,237,234,0.1)] flex justify-between items-center text-xs">
              <span className="meta-mono text-[#eeedea]">
                Active Staffed Worklists for {formatDateWithDay(activeDate)}
              </span>
              <button
                onClick={() => onOpenShiftModal(activeDate)}
                className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs py-1 px-3 rounded-xs cursor-pointer font-mono"
              >
                + Assign Worklist
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#242429] text-[rgba(238,237,234,0.5)] uppercase meta-mono border-b border-[rgba(238,237,234,0.08)]">
                    <th className="p-3">Clinician</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Subspecialty</th>
                    <th className="p-3">Modality Worklist</th>
                    <th className="p-3">Facility</th>
                    <th className="p-3">Workstation</th>
                    <th className="p-3">Hours</th>
                    <th className="p-3">Split Details</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(238,237,234,0.06)] font-medium text-xs">
                  {dayShifts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center meta-mono opacity-30">
                        NO STAFFED READING WORKLISTS SCHEDULED
                      </td>
                    </tr>
                  ) : (
                    dayShifts.map(s => {
                      const user = userMap.get(s.radId);
                      const isAP = user?.role === 'ADVANCED_PRACTITIONER';

                      return (
                        <tr key={s.id} className="hover:bg-[rgba(238,237,234,0.02)] transition-colors">
                          <td className="p-3 font-semibold text-[#eeedea]">
                            {formatPersonName(user?.name || 'Physician', user?.role, user?.title)}
                          </td>
                          <td className="p-3 meta-mono">
                            {isAP ? <span className="text-[#38bdf8]">AP</span> : <span>MD</span>}
                          </td>
                          <td className="p-3 meta-mono text-[#8eb9dd] font-bold">
                            {s.specialty}
                          </td>
                          <td className="p-3 font-mono text-xs text-[rgba(238,237,234,0.8)]">
                            {s.modality}
                          </td>
                          <td className="p-3 font-medium text-[#eeedea]">
                            {sites[s.site]?.name || s.site}
                          </td>
                          <td className="p-3 font-mono text-[rgba(238,237,234,0.5)]">
                            {s.workstationId || 'Auto Pod'}
                          </td>
                          <td className="p-3 font-mono text-[rgba(238,237,234,0.6)]">
                            {s.hours}
                          </td>
                          <td className="p-3">
                            {s.isSplit ? (
                              <span className="text-[#818cf8] font-mono text-[11px] flex items-center gap-1">
                                <Split className="w-3 h-3" />
                                {s.splitDetails || (s.splitSite || 'Remote')}
                              </span>
                            ) : (
                              <span className="opacity-30">&mdash;</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onEditShift(s)}
                              className="meta-mono bg-transparent hover:border-[#8eb9dd] hover:text-[#8eb9dd] border border-[rgba(238,237,234,0.15)] px-2 py-1 rounded-xs cursor-pointer"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {selectedSubTab === 'ap' && (
        <div className="space-y-4">
          
          <div className="p-4 bg-[rgba(56,189,248,0.06)] border border-[rgba(56,189,248,0.25)] rounded-xs space-y-1.5 text-xs text-[rgba(238,237,234,0.9)]">
            <div className="flex items-center gap-2 font-bold text-[#38bdf8]">
              <Stethoscope className="w-4 h-4" />
              <span>Radiology Advanced Practitioner Protocol</span>
            </div>
            <p className="text-[11px] text-[rgba(238,237,234,0.7)] leading-relaxed">
              Radiology Advanced Practitioners provide clinical capacity by performing fluoroscopy, invasive minor procedures (lumbar puncture, joint injections, paracentesis), and preliminary triage reads under indirect/direct physician oversight.
            </p>
          </div>

          <div className="bg-[#1c1c1f] rounded-xs border border-[rgba(238,237,234,0.1)] overflow-hidden">
            <div className="p-3.5 bg-[#111113] border-b border-[rgba(238,237,234,0.1)] flex justify-between items-center text-xs">
              <span className="meta-mono text-[#eeedea]">
                Scheduled AP Procedures & Supervising Physicians ({apShifts.length})
              </span>
              <button
                onClick={() => onOpenShiftModal(activeDate)}
                className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs py-1 px-3 rounded-xs cursor-pointer font-mono"
              >
                + Schedule AP Procedure
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#242429] text-[rgba(238,237,234,0.5)] uppercase meta-mono border-b border-[rgba(238,237,234,0.08)]">
                    <th className="p-3">Advanced Practitioner</th>
                    <th className="p-3">License</th>
                    <th className="p-3">Procedure Type</th>
                    <th className="p-3">Facility</th>
                    <th className="p-3">Shift Window</th>
                    <th className="p-3">Supervising MD</th>
                    <th className="p-3">Supervision Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(238,237,234,0.06)] font-medium text-xs">
                  {apShifts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center meta-mono opacity-30">
                        NO ADVANCED PRACTITIONER PROCEDURES SCHEDULED
                      </td>
                    </tr>
                  ) : (
                    apShifts.map(s => {
                      const user = userMap.get(s.radId);
                      const supUser = s.supervisingRadId ? userMap.get(s.supervisingRadId) : null;
                      const hasAttendingOnSite = shifts.some(os => os.date === activeDate && os.site === s.site && (userMap.get(os.radId)?.role === 'ATTENDING_RAD' || userMap.get(os.radId)?.role === 'CHIEF' || userMap.get(os.radId)?.role === 'ADMIN'));

                      return (
                        <tr key={s.id} className="hover:bg-[rgba(238,237,234,0.02)] transition-colors">
                          <td className="p-3 font-semibold text-[#eeedea]">
                            {formatPersonName(user?.name || 'RPA', user?.role, user?.title)}
                          </td>
                          <td className="p-3 font-mono text-[rgba(238,237,234,0.5)]">
                            {user?.apLicenseNumber || 'State Registered'}
                          </td>
                          <td className="p-3 font-bold text-[#38bdf8]">
                            {s.procedureType || s.modality}
                          </td>
                          <td className="p-3 font-medium text-[#eeedea]">
                            {s.site} &bull; {s.workstationId || 'Procedure Suite'}
                          </td>
                          <td className="p-3 font-mono text-[rgba(238,237,234,0.6)]">
                            {s.hours}
                          </td>
                          <td className="p-3 font-bold text-[#eeedea]">
                            {supUser ? formatPersonName(supUser.name, supUser.role, supUser.title) : 'Attending Pool'}
                          </td>
                          <td className="p-3">
                            {hasAttendingOnSite ? (
                              <span className="meta-mono text-emerald-400 flex items-center gap-1 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                On-Site MD Active
                              </span>
                            ) : (
                              <span className="meta-mono text-[#ef4444] flex items-center gap-1 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
                                No On-Site MD
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onEditShift(s)}
                              className="meta-mono bg-transparent hover:border-[#8eb9dd] hover:text-[#8eb9dd] border border-[rgba(238,237,234,0.15)] px-2 py-1 rounded-xs cursor-pointer"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
