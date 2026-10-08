import React, { useState } from 'react';
import { 
  BarChart3, 
  Syringe, 
  Calendar as CalendarIcon, 
  Layers 
} from 'lucide-react';
import { Shift, StaffUser, ClinicalSite, LeaveRequest, PtoAccrual } from '../types';
import { formatPersonName, formatDateWithDay } from '../utils/formatters';

interface AnalyticsViewProps {
  shifts: Shift[];
  users: StaffUser[];
  sites: Record<string, ClinicalSite>;
  leaves: LeaveRequest[];
  accruals: Record<string, PtoAccrual>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  shifts,
  users,
  sites,
  leaves,
  accruals
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(users[0]?.id || '');

  const userMap = new Map<string, StaffUser>();
  users.forEach(u => userMap.set(u.id, u));

  const totalShifts = shifts.filter(s => s.radId !== 'NO_RAD_NEEDED').length;
  const contrastSupervisionShifts = shifts.filter(s => s.isSupervisor).length;
  const procedureShifts = shifts.filter(s => s.procedureType).length;
  const totalApprovedLeaves = leaves.filter(l => l.status === 'Approved').length;

  const selectedStaff = userMap.get(selectedStaffId);
  const staffShifts = shifts.filter(s => s.radId === selectedStaffId);
  const staffSupervisionShifts = staffShifts.filter(s => s.isSupervisor).length;
  const staffAccrual = accruals[selectedStaffId] || { annualPto: 25, cmeDays: 5, maxConsecutive: 10, usedPto: 2, usedCme: 0 };

  return (
    <div className="space-y-6 text-[#eeedea]">
      
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] flex items-center gap-3.5">
          <div className="p-3 bg-[#242429] text-[#8eb9dd] rounded-xs border border-[rgba(142, 185, 221,0.2)]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="meta-mono">Total Clinical Shifts</p>
            <h3 className="text-2xl font-light text-[#eeedea] font-mono mt-0.5">
              {totalShifts}
            </h3>
          </div>
        </div>

        <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] flex items-center gap-3.5">
          <div className="p-3 bg-[#242429] text-emerald-400 rounded-xs border border-[rgba(52,211,153,0.2)]">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <p className="meta-mono">Contrast Supervisions</p>
            <h3 className="text-2xl font-light text-emerald-400 font-mono mt-0.5">
              {contrastSupervisionShifts}
            </h3>
          </div>
        </div>

        <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] flex items-center gap-3.5">
          <div className="p-3 bg-[#242429] text-[#38bdf8] rounded-xs border border-[rgba(56,189,248,0.2)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="meta-mono">AP Procedures</p>
            <h3 className="text-2xl font-light text-[#38bdf8] font-mono mt-0.5">
              {procedureShifts}
            </h3>
          </div>
        </div>

        <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] flex items-center gap-3.5">
          <div className="p-3 bg-[#242429] text-purple-400 rounded-xs border border-[rgba(192,132,252,0.2)]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="meta-mono">Approved Leaves</p>
            <h3 className="text-2xl font-light text-purple-400 font-mono mt-0.5">
              {totalApprovedLeaves}
            </h3>
          </div>
        </div>
      </div>

      {/* Staff Inspector & Workload Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Clinician Performance & Inspector Card */}
        <div className="lg:col-span-8 bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(238,237,234,0.1)]">
            <div>
              <h3 className="text-base font-bold text-[#eeedea] font-brand italic">
                Clinician Workload Inspector
              </h3>
            </div>

            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs px-3 py-1.5 text-xs font-geist text-[#eeedea] focus:outline-none focus:border-[#8eb9dd]"
            >
              {users.filter(u => !u.isArchived).map(u => (
                <option key={u.id} value={u.id} className="bg-[#111113] text-[#eeedea]">
                  {formatPersonName(u.name, u.role, u.title)} ({u.role === 'CHIEF' ? 'Chief' : u.role === 'ATTENDING_RAD' ? 'MD' : u.role === 'ADVANCED_PRACTITIONER' ? 'AP' : 'Admin'})
                </option>
              ))}
            </select>
          </div>

          {selectedStaff && (
            <div className="space-y-4">
              
              {/* Clinician Summary Bar */}
              <div className="p-4 bg-[#242429] rounded-xs border border-[rgba(238,237,234,0.08)] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-sm text-[#eeedea]">
                    {formatPersonName(selectedStaff.name, selectedStaff.role, selectedStaff.title)}
                  </h4>
                  <p className="text-xs text-[rgba(238,237,234,0.6)] font-medium">
                    {selectedStaff.specialties.join(', ')} &bull; Primary Facility: {selectedStaff.primarySite}
                  </p>
                </div>

                <div className="flex items-center gap-5 text-xs font-mono">
                  <div className="text-center">
                    <span className="meta-mono block">Shifts</span>
                    <span className="text-lg font-bold text-[#8eb9dd]">{staffShifts.length}</span>
                  </div>
                  <div className="text-center">
                    <span className="meta-mono block">Supervision</span>
                    <span className="text-lg font-bold text-emerald-400">{staffSupervisionShifts}</span>
                  </div>
                  <div className="text-center">
                    <span className="meta-mono block">PTO Days</span>
                    <span className="text-lg font-bold text-purple-400">{staffAccrual.annualPto - staffAccrual.usedPto} rem</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Shifts Stream */}
              <div className="space-y-2">
                <span className="meta-mono block text-[rgba(238,237,234,0.5)]">
                  Scheduled Assignments ({staffShifts.length})
                </span>

                {staffShifts.length === 0 ? (
                  <p className="meta-mono py-8 text-center opacity-30 bg-[#242429] rounded-xs">
                    NO SCHEDULED ASSIGNMENTS FOR THIS CLINICIAN
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {staffShifts.map(sh => (
                      <div 
                        key={sh.id}
                        className="p-3 bg-[#242429] rounded-xs border border-[rgba(238,237,234,0.08)] space-y-1 text-xs"
                      >
                        <div className="meta-mono flex items-center justify-between text-[#8eb9dd]">
                          <span>{formatDateWithDay(sh.date)}</span>
                          <span>{sh.site}</span>
                        </div>
                        <p className="text-xs text-[#eeedea] font-medium">{sh.hours}</p>
                        <p className="meta-mono text-[10px] opacity-60">{sh.modality}</p>
                        {sh.isSupervisor && (
                          <span className="meta-mono text-emerald-400 block pt-1 border-t border-[rgba(238,237,234,0.06)]">
                            [On-Site Contrast Supervisor]
                          </span>
                        )}
                        {sh.procedureType && (
                          <span className="meta-mono text-[#38bdf8] block pt-1 border-t border-[rgba(238,237,234,0.06)]">
                            Proc: {sh.procedureType}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Facility Load Distribution */}
        <div className="lg:col-span-4 bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-4">
          <div className="pb-3 border-b border-[rgba(238,237,234,0.1)]">
            <h3 className="text-base font-bold text-[#eeedea] font-brand italic">
              Facility Volume Allocation
            </h3>
            <p className="meta-mono mt-0.5">
              Total reading slots staffed per facility
            </p>
          </div>

          <div className="space-y-3.5">
            {Object.values(sites).map(st => {
              const siteCount = shifts.filter(s => s.site === st.id && s.radId !== 'NO_RAD_NEEDED').length;
              const percent = totalShifts > 0 ? Math.round((siteCount / totalShifts) * 100) : 0;

              return (
                <div key={st.id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-[#eeedea]">{st.name} ({st.label})</span>
                    <span className="font-mono text-xs text-[rgba(238,237,234,0.6)]">{siteCount} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-[#242429] rounded-xs h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#8eb9dd] h-full rounded-xs transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#242429] border border-[rgba(238,237,234,0.08)] rounded-xs text-[11px] text-[rgba(238,237,234,0.7)] space-y-1">
            <span className="meta-mono text-[#8eb9dd] block">Operations Telemetry:</span>
            <p>
              Teleradiology over-reads account for peak volume, while on-site procedural presence is concentrated at physical hospital hubs.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
