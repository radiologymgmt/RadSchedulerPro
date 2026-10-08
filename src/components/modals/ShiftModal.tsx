import React, { useState, useEffect } from 'react';
import { X, CalendarPlus, Syringe, Split, Stethoscope } from 'lucide-react';
import { Shift, StaffUser, ClinicalSite, Specialty, Workstation } from '../../types';
import { formatPersonName } from '../../utils/formatters';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveShift: (shift: Shift) => void;
  editingShift: Shift | null;
  users: StaffUser[];
  sites: Record<string, ClinicalSite>;
  workstations: Workstation[];
  modalities: string[];
  initialDate?: string;
  initialSite?: string;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSaveShift,
  editingShift,
  users,
  sites,
  workstations,
  modalities,
  initialDate,
  initialSite
}) => {
  const [radId, setRadId] = useState<string>(users[0]?.id || 'CHIEF-001');
  const [specialty, setSpecialty] = useState<Specialty>('Body');
  const [modality, setModality] = useState<string>(modalities[0] || 'Cross-Sectional CT & MRI');
  const [site, setSite] = useState<string>(initialSite || Object.keys(sites)[0] || 'MAIN');
  const [workstationId, setWorkstationId] = useState<string>('');
  const [hours, setHours] = useState<string>('07:30 - 16:00');
  const [date, setDate] = useState<string>(initialDate || '2026-10-02');
  const [isSupervisor, setIsSupervisor] = useState<boolean>(false);
  const [isSplit, setIsSplit] = useState<boolean>(false);
  const [splitSite, setSplitSite] = useState<string>('REMOTE');
  const [splitDetails, setSplitDetails] = useState<string>('');
  const [supervisingRadId, setSupervisingRadId] = useState<string>('');
  const [procedureType, setProcedureType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingShift) {
      setRadId(editingShift.radId);
      setSpecialty(editingShift.specialty);
      setModality(editingShift.modality);
      setSite(editingShift.site);
      setWorkstationId(editingShift.workstationId || '');
      setHours(editingShift.hours);
      setDate(editingShift.date);
      setIsSupervisor(!!editingShift.isSupervisor);
      setIsSplit(!!editingShift.isSplit);
      setSplitSite(editingShift.splitSite || 'REMOTE');
      setSplitDetails(editingShift.splitDetails || '');
      setSupervisingRadId(editingShift.supervisingRadId || '');
      setProcedureType(editingShift.procedureType || '');
      setNotes(editingShift.notes || '');
    } else {
      const defaultUser = users.find(u => !u.isArchived) || users[0];
      const fallbackSite = initialSite || defaultUser?.primarySite || Object.keys(sites)[0] || 'MAIN';
      setRadId(defaultUser ? defaultUser.id : (users[0]?.id || 'CHIEF-001'));
      setSpecialty(defaultUser?.specialties[0] || 'Body');
      setSite(fallbackSite);
      setDate(initialDate || '2026-10-02');
      setIsSupervisor(false);
      setIsSplit(false);
      setSplitDetails('');
      setSupervisingRadId('');
      setProcedureType('');
      setNotes('');
      
      const siteModalities = sites[fallbackSite]?.modalities || modalities;
      setModality(siteModalities[0] || modalities[0]);
    }
  }, [editingShift, isOpen, initialDate, initialSite]);

  if (!isOpen) return null;

  const selectedUser = users.find(u => u.id === radId);
  const isAP = selectedUser?.role === 'ADVANCED_PRACTITIONER';
  const siteObj = sites[site];
  const availableModalities = (siteObj?.modalities && siteObj.modalities.length > 0) 
    ? siteObj.modalities 
    : modalities;

  const availableWorkstations = workstations.filter(w => 
    w.site === site || (site === 'REMOTE' && w.isHome)
  );

  const handleRadChange = (newRadId: string) => {
    setRadId(newRadId);
    if (newRadId === 'NO_RAD_NEEDED') {
      setHours('Site Dark / No Coverage');
      setIsSupervisor(false);
      return;
    }
    const user = users.find(u => u.id === newRadId);
    if (user) {
      if (user.specialties && user.specialties.length > 0) {
        setSpecialty(user.specialties[0]);
      }
      if (user.primarySite && sites[user.primarySite]) {
        setSite(user.primarySite);
      }
      if (user.role === 'ADVANCED_PRACTITIONER') {
        setIsSupervisor(false);
        const attendingOnSite = users.find(u => u.role === 'ATTENDING_RAD' && u.primarySite === user.primarySite);
        if (attendingOnSite) setSupervisingRadId(attendingOnSite.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shiftData: Shift = {
      id: editingShift ? editingShift.id : `shift-${Date.now()}`,
      radId,
      specialty,
      modality,
      site,
      workstationId: workstationId || undefined,
      hours,
      date,
      isSupervisor: radId !== 'NO_RAD_NEEDED' ? isSupervisor : false,
      isSplit,
      splitSite: isSplit ? splitSite : undefined,
      splitDetails: isSplit ? splitDetails : undefined,
      supervisingRadId: isAP ? supervisingRadId : undefined,
      procedureType: isAP ? procedureType : undefined,
      notes: notes || undefined
    };
    onSaveShift(shiftData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="modal-window bg-[#434856] rounded-md border border-[rgba(255,255,255,0.24)] w-full max-w-lg overflow-hidden shadow-2xl text-white">
        
        {/* Modal Header */}
        <div 
          className="modal-header bg-[#4e5465] px-5 py-4 border-b border-[rgba(255,255,255,0.20)] flex justify-between items-center"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#383d4c] text-[#a0c9eb] flex items-center justify-center border border-[rgba(160,201,235,0.4)]">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {editingShift ? 'Edit Clinical Assignment' : 'Assign Clinical Shift'}
              </h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-300 hover:text-white cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="p-5 space-y-4 text-xs bg-[#434856] text-white"
        >
          
          {/* Provider & Subspecialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Staff Clinician
              </label>
              <select
                value={radId}
                onChange={(e) => handleRadChange(e.target.value)}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-semibold text-white focus:outline-none focus:border-[#a0c9eb]"
              >
                <option value="NO_RAD_NEEDED" className="bg-[#2e313a]">-- Dark Day / Procedural Slot Only --</option>
                <optgroup label="Department Chief & Attending Radiologists (MD/DO)" className="bg-[#2e313a]">
                  {users.filter(u => !u.isArchived && (u.role === 'CHIEF' || u.role === 'ATTENDING_RAD' || u.role === 'ADMIN')).map(u => (
                    <option key={u.id} value={u.id} className="bg-[#2e313a]">
                      {formatPersonName(u.name, u.role, u.title)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Advanced Practitioners (RPA / NP)" className="bg-[#2e313a]">
                  {users.filter(u => !u.isArchived && u.role === 'ADVANCED_PRACTITIONER').map(u => (
                    <option key={u.id} value={u.id} className="bg-[#2e313a]">
                      {formatPersonName(u.name, u.role, u.title)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Subspecialty Worklist
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as Specialty)}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-bold text-[#a0c9eb] focus:outline-none focus:border-[#a0c9eb]"
              >
                <option value="Body" className="bg-[#2e313a]">Body</option>
                <option value="Neuro" className="bg-[#2e313a]">Neuro</option>
                <option value="MSK" className="bg-[#2e313a]">MSK</option>
                <option value="PET" className="bg-[#2e313a]">PET</option>
                <option value="Breast" className="bg-[#2e313a]">Breast</option>
                <option value="Breast MRI" className="bg-[#2e313a]">Breast MRI</option>
                <option value="Interventional" className="bg-[#2e313a]">Interventional</option>
              </select>
            </div>
          </div>

          {/* Site & Modality Worklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Clinical Facility
              </label>
              <select
                value={site}
                onChange={(e) => {
                  setSite(e.target.value);
                  const nextSiteMods = sites[e.target.value]?.modalities || modalities;
                  if (!nextSiteMods.includes(modality)) {
                    setModality(nextSiteMods[0] || modalities[0]);
                  }
                }}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist text-white focus:outline-none focus:border-[#a0c9eb]"
              >
                {Object.values(sites).map(s => (
                  <option key={s.id} value={s.id} className="bg-[#2e313a]">
                    {s.name} ({s.label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Modality / Worklist
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist text-white focus:outline-none focus:border-[#a0c9eb]"
              >
                {availableModalities.map(m => (
                  <option key={m} value={m} className="bg-[#2e313a]">{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Workstation PC & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Diagnostic Workstation
              </label>
              <select
                value={workstationId}
                onChange={(e) => setWorkstationId(e.target.value)}
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-[#a0c9eb] focus:outline-none focus:border-[#a0c9eb]"
              >
                <option value="" className="bg-[#2e313a]">Auto Diagnostic Workstation</option>
                <option value="NO_WORKSTATION_REQUIRED" className="bg-[#2e313a]">No Specific Workstation Required</option>
                {availableWorkstations.map(ws => (
                  <option key={ws.id} value={ws.id} className="bg-[#2e313a]">
                    {ws.id} ({ws.room})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Shift Window
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white focus:outline-none focus:border-[#a0c9eb]"
              >
                <option value="07:30 - 16:00" className="bg-[#2e313a]">Day Shift (07:30 - 16:00)</option>
                <option value="08:00 - 17:00" className="bg-[#2e313a]">Standard Day (08:00 - 17:00)</option>
                <option value="08:30 - 17:00" className="bg-[#2e313a]">Mid Day (08:30 - 17:00)</option>
                <option value="12:00 - 21:00" className="bg-[#2e313a]">Evening Swing (12:00 - 21:00)</option>
                <option value="16:00 - 23:00" className="bg-[#2e313a]">Night Call (16:00 - 23:00)</option>
                <option value="Flexible Pool" className="bg-[#2e313a]">Flexible / Unscheduled Pool</option>
                <option value="Site Dark / No Coverage" className="bg-[#2e313a]">Site Dark / No Coverage</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block meta-mono text-slate-200 font-semibold mb-1">
              Assignment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white font-bold focus:outline-none focus:border-[#a0c9eb]"
            />
          </div>

          {/* AP Regulatory Supervision Box */}
          {isAP && (
            <div className="p-3.5 rounded-xs border border-[rgba(56,189,248,0.3)] bg-[rgba(56,189,248,0.06)] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#38bdf8] text-xs">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Advanced Practitioner Regulatory Supervision</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-tight">
                ACR and state licensing guidelines require a supervising Attending Radiologist (MD/DO) for fluoroscopy, joint arthrograms, and invasive procedures.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block meta-mono text-slate-300 mb-0.5 font-semibold">
                    Supervising Attending MD
                  </label>
                  <select
                    value={supervisingRadId}
                    onChange={(e) => setSupervisingRadId(e.target.value)}
                    required={isAP}
                    className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2 font-bold text-white focus:outline-none focus:border-[#a0c9eb]"
                  >
                    <option value="" className="bg-[#2e313a]">Select Supervising MD</option>
                    {users.filter(u => u.role === 'CHIEF' || u.role === 'ATTENDING_RAD' || u.role === 'ADMIN').map(md => (
                      <option key={md.id} value={md.id} className="bg-[#2e313a]">
                        {formatPersonName(md.name, md.role, md.title)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block meta-mono text-slate-300 mb-0.5 font-semibold">
                    Procedure Scope
                  </label>
                  <input
                    type="text"
                    value={procedureType}
                    onChange={(e) => setProcedureType(e.target.value)}
                    placeholder="e.g. GI Fluoroscopy & Joint Injections"
                    className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#a0c9eb]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Split Reading Assignment */}
          <div className="p-3.5 rounded-xs border border-[rgba(129,140,248,0.25)] bg-[rgba(129,140,248,0.05)] space-y-2">
            <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#818cf8]">
              <input
                type="checkbox"
                checked={isSplit}
                onChange={(e) => setIsSplit(e.target.checked)}
                className="accent-[#818cf8] rounded"
              />
              <span 
                style={{ color: '#f1f5f9' }}
                className="flex items-center gap-1.5 font-semibold"
              >
                <Split className="w-3.5 h-3.5" />
                Enable Split Assignment (On-site procedural + Remote teleradiology)
              </span>
            </label>

            {isSplit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[rgba(129,140,248,0.2)]">
                <div>
                  <label className="block meta-mono text-slate-300 mb-1 font-semibold">
                    Secondary Facility / Remote
                  </label>
                  <select
                    value={splitSite}
                    onChange={(e) => setSplitSite(e.target.value)}
                    className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2 text-xs text-white focus:outline-none focus:border-[#a0c9eb]"
                  >
                    {Object.values(sites).map(s => (
                      <option key={s.id} value={s.id} className="bg-[#2e313a]">{s.name} ({s.label})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block meta-mono text-slate-300 mb-1 font-semibold">
                    Split Details
                  </label>
                  <input
                    type="text"
                    value={splitDetails}
                    onChange={(e) => setSplitDetails(e.target.value)}
                    placeholder="e.g. 08:00-12:00 In-Person | 12:00-16:30 Remote"
                    className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-[#a0c9eb]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* On-Site Contrast Supervisor Designation */}
          {radId !== 'NO_RAD_NEEDED' && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#a0c9eb] bg-[rgba(160,201,235,0.12)] p-3 rounded-xs border border-[rgba(160,201,235,0.3)] hover:border-[#a0c9eb] transition-colors">
                <input
                  type="checkbox"
                  checked={isSupervisor}
                  onChange={(e) => setIsSupervisor(e.target.checked)}
                  className="accent-[#a0c9eb] rounded"
                />
                <span 
                  style={{ color: '#f1f5f9' }}
                  className="flex items-center gap-1.5 font-semibold"
                >
                  <Syringe className="w-3.5 h-3.5 text-[#a0c9eb]" />
                  Designated On-Site IV Contrast Supervisor for {siteObj?.name || site}
                </span>
              </label>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(238,237,234,0.1)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-[rgba(255,255,255,0.22)] text-slate-200 hover:text-white bg-[#343844] hover:bg-[#3d4250] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold px-4 py-2 rounded shadow-xs cursor-pointer transition-colors font-mono"
            >
              {editingShift ? 'Save Changes' : 'Assign Shift'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
