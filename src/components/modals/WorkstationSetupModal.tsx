import React, { useState } from 'react';
import { X, Monitor, CheckCircle2 } from 'lucide-react';
import { ClinicalSite, Workstation } from '../../types';

interface WorkstationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  workstations: Workstation[];
  sites: Record<string, ClinicalSite>;
  monitorProfiles: string[];
  currentWorkstation: string;
  onSaveWorkstation: (pcName: string, site: string, room: string, monitorProfile: string) => void;
}

export const WorkstationSetupModal: React.FC<WorkstationSetupModalProps> = ({
  isOpen,
  onClose,
  workstations,
  sites,
  monitorProfiles,
  currentWorkstation,
  onSaveWorkstation
}) => {
  const currentWsObj = workstations.find(w => w.id === currentWorkstation);
  const [pcName, setPcName] = useState<string>(currentWorkstation);
  const [site, setSite] = useState<string>(currentWsObj?.site || Object.keys(sites)[0] || 'MAIN');
  const [room, setRoom] = useState<string>(currentWsObj?.room || 'Reading Pod 1');
  const [monitorProfile, setMonitorProfile] = useState<string>(currentWsObj?.monitorType || monitorProfiles[0]);

  if (!isOpen) return null;

  const handleSelectExisting = (selectedId: string) => {
    const ws = workstations.find(w => w.id === selectedId);
    if (ws) {
      setPcName(ws.id);
      setSite(ws.site);
      setRoom(ws.room);
      setMonitorProfile(ws.monitorType);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pcName.trim()) return;
    onSaveWorkstation(pcName.trim().toUpperCase(), site, room, monitorProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-md overflow-hidden shadow-2xl text-[#fdfdfd]">
        
        <div className="bg-[#2e313a] px-5 py-4 border-b border-white/15 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40 flex items-center justify-center font-bold">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-brand italic text-base text-[#fdfdfd] font-bold">
                Workstation Setup
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
          
          <div>
            <label className="block meta-mono text-slate-200 font-semibold mb-1">
              Select Registered Terminal
            </label>
            <select
              value={workstations.some(w => w.id === pcName) ? pcName : ''}
              onChange={(e) => handleSelectExisting(e.target.value)}
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-[#a0c9eb] font-bold focus:outline-none focus:border-[#a0c9eb]"
            >
              <option value="" className="bg-[#2e313a]">-- Or configure custom terminal asset tag --</option>
              {workstations.map(w => (
                <option key={w.id} value={w.id} className="bg-[#2e313a]">
                  {w.id} ({w.room} &bull; {w.site})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block meta-mono text-slate-200 font-semibold mb-1">
              Local Terminal Asset Tag / Hostname
            </label>
            <input
              type="text"
              value={pcName}
              onChange={(e) => setPcName(e.target.value.toUpperCase())}
              required
              placeholder="e.g. RAD-WS-NHP-01"
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-[#a0c9eb] font-bold focus:outline-none focus:border-[#a0c9eb]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Facility
              </label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist text-white font-bold focus:outline-none focus:border-[#a0c9eb]"
              >
                {Object.values(sites).map(s => (
                  <option key={s.id} value={s.id} className="bg-[#2e313a]">{s.name} ({s.label})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Reading Pod Room
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
                placeholder="e.g. Neuro Pod B"
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist text-white placeholder-slate-400 focus:outline-none focus:border-[#a0c9eb]"
              />
            </div>
          </div>

          <div>
            <label className="block meta-mono text-slate-200 font-semibold mb-1">
              Display Calibration Profile
            </label>
            <select
              value={monitorProfile}
              onChange={(e) => setMonitorProfile(e.target.value)}
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#a0c9eb]"
            >
              {monitorProfiles.map(p => (
                <option key={p} value={p} className="bg-[#2e313a]">{p}</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-[#282b35] border border-white/15 rounded-xs text-[11px] text-slate-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#a0c9eb] shrink-0 mt-0.5" />
            <p>
              Your local client browser caches this terminal asset tag so shifts mapped to this PC are automatically prioritized in your active view.
            </p>
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
              Save Profile
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
