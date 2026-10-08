import React, { useState, useEffect } from 'react';
import { X, Syringe, CheckCircle2, AlertCircle } from 'lucide-react';
import { Shift, StaffUser, ClinicalSite, Workstation } from '../../types';
import { formatPersonName } from '../../utils/formatters';

interface ContrastSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignSupervisor: (shiftData: Partial<Shift>) => void;
  sites: Record<string, ClinicalSite>;
  users: StaffUser[];
  workstations: Workstation[];
  shifts: Shift[];
  presetSite?: string;
  presetDate?: string;
}

export const ContrastSupervisorModal: React.FC<ContrastSupervisorModalProps> = ({
  isOpen,
  onClose,
  onAssignSupervisor,
  sites,
  users,
  workstations,
  shifts,
  presetSite,
  presetDate
}) => {
  const [site, setSite] = useState<string>(presetSite || Object.keys(sites)[0] || 'MAIN');
  const [date, setDate] = useState<string>(presetDate || '2026-10-02');
  const [radId, setRadId] = useState<string>('');
  const [hours, setHours] = useState<string>('07:30 - 16:00');
  const [workstationId, setWorkstationId] = useState<string>('');

  const eligibleClinicians = users.filter(u => !u.isArchived && u.certContrast);
  const physicalSites = Object.values(sites).filter(s => s.id !== 'REMOTE' && s.id !== 'NO_ASSIGNMENT' && s.requiresContrast);

  useEffect(() => {
    if (presetSite) setSite(presetSite);
    if (presetDate) setDate(presetDate);
  }, [presetSite, presetDate, isOpen]);

  useEffect(() => {
    const existing = shifts.find(s => s.date === date && s.site === site && s.isSupervisor);
    if (existing) {
      setRadId(existing.radId);
      setHours(existing.hours);
      setWorkstationId(existing.workstationId || '');
    } else {
      const match = eligibleClinicians.find(u => u.primarySite === site) || eligibleClinicians[0];
      if (match) setRadId(match.id);
    }
  }, [site, date, shifts, isOpen]);

  if (!isOpen) return null;

  const existingSupervisor = shifts.find(s => s.date === date && s.site === site && s.isSupervisor);
  const availableWorkstations = workstations.filter(w => w.site === site && !w.isHome);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!radId) return;

    onAssignSupervisor({
      site,
      date,
      radId,
      hours,
      workstationId: workstationId || undefined,
      isSupervisor: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-lg overflow-hidden shadow-2xl text-[#fdfdfd]">
        
        <div className="bg-[#2e313a] px-5 py-4 border-b border-white/15 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40 flex items-center justify-center font-bold">
              <Syringe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-brand italic text-base text-[#fdfdfd] font-bold">
                Designate Contrast Supervisor
              </h3>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Clinical Facility
              </label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-semibold text-white focus:outline-none focus:border-[#a0c9eb]"
              >
                {physicalSites.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#2e313a]">{s.name} ({s.label})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Supervision Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white font-bold focus:outline-none focus:border-[#a0c9eb]"
              />
            </div>
          </div>

          <div>
            <label className="block meta-mono text-slate-200 font-semibold mb-1">
              Designated Supervising Clinician
            </label>
            <select
              value={radId}
              onChange={(e) => setRadId(e.target.value)}
              required
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-bold text-[#a0c9eb] focus:outline-none focus:border-[#a0c9eb]"
            >
              {eligibleClinicians.map(c => (
                <option key={c.id} value={c.id} className="bg-[#2e313a]">
                  {formatPersonName(c.name, c.role, c.title)} ({c.role === 'CHIEF' ? 'Chief Radiologist' : c.role === 'ATTENDING_RAD' ? 'Attending MD' : 'Credentialed AP'})
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 text-[11px] text-[#a0c9eb] mt-1.5 font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified On-site IV Contrast Administration & Acute Reaction Certification</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Shift Window
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white focus:outline-none focus:border-[#a0c9eb]"
              >
                <option value="07:30 - 16:00" className="bg-[#2e313a]">Full Day Supervision (07:30 - 16:00)</option>
                <option value="08:00 - 17:00" className="bg-[#2e313a]">Standard Day (08:00 - 17:00)</option>
                <option value="07:30 - 12:00" className="bg-[#2e313a]">Morning Block (07:30 - 12:00)</option>
                <option value="12:00 - 17:00" className="bg-[#2e313a]">Afternoon Block (12:00 - 17:00)</option>
              </select>
            </div>

            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Workstation / Pod
              </label>
              <select
                value={workstationId}
                onChange={(e) => setWorkstationId(e.target.value)}
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-[#a0c9eb] focus:outline-none focus:border-[#a0c9eb]"
              >
                <option value="" className="bg-[#2e313a]">Auto Supervision Workstation</option>
                {availableWorkstations.map(ws => (
                  <option key={ws.id} value={ws.id} className="bg-[#2e313a]">{ws.id} ({ws.room})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Facility Status */}
          <div className="p-3 bg-[#282b35] rounded-xs border border-white/15 text-[11px] space-y-1">
            <span className="meta-mono text-slate-300 font-semibold block">Existing Facility Coverage Status:</span>
            {existingSupervisor ? (
              <p className="text-[#a0c9eb] font-mono font-bold">
                Currently Assigned: {formatPersonName(users.find(u => u.id === existingSupervisor.radId)?.name || 'MD')} ({existingSupervisor.hours})
              </p>
            ) : (
              <p className="text-rose-300 font-mono flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                No physician or credentialed supervisor designated on this date.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xs border border-white/20 text-slate-300 hover:text-white cursor-pointer font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold px-4 py-2 rounded-xs shadow-xs cursor-pointer transition-colors font-mono"
            >
              Assign Supervisor
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
