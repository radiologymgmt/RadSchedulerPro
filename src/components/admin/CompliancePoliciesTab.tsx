import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Syringe, 
  Flame, 
  CalendarX2, 
  Award, 
  Stethoscope,
  Save,
  RotateCcw
} from 'lucide-react';
import { SystemSettings } from '../../types';

interface CompliancePoliciesTabProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  addAuditLog: (action: string, details: string) => void;
}

export const CompliancePoliciesTab: React.FC<CompliancePoliciesTabProps> = ({
  settings,
  onSaveSettings,
  addAuditLog
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key: keyof SystemSettings) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    addAuditLog('UPDATE_POLICIES', 'Updated clinical compliance & supervision governance policies.');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8eb9dd]" />
            <h3 className="meta-mono text-base font-bold text-white">
              Clinical Compliance & Supervision Governance Policies
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure regulatory guardrails, ACR supervision mandates, and fatigue thresholds directly from the UI without modifying source code.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xs flex items-center gap-1.5 animate-pulse">
            <Check className="w-4 h-4" />
            <span>Policies Saved & Active</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: ACR Contrast Supervision */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Syringe className="w-4 h-4 text-[#8eb9dd]" />
                <span>On-Site IV Contrast Supervision</span>
              </div>
              <input
                type="checkbox"
                checked={formData.requireContrastSupervision}
                onChange={() => handleToggle('requireContrastSupervision')}
                className="w-5 h-5 accent-[#8eb9dd] cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When enabled, facilities administering iodinated or gadolinium IV contrast must have at least one certified Attending Radiologist or Credentialed Advanced Practitioner physically on-site. Flagged as a CRITICAL violation if missing.
            </p>
            <div className="text-[11px] font-mono text-[#8eb9dd] pt-1">
              Status: {formData.requireContrastSupervision ? 'MANDATORY (ENFORCED)' : 'OPTIONAL (DISABLED)'}
            </div>
          </div>

          {/* Card 2: FDA MQSA Mammography Requirement */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Award className="w-4 h-4 text-pink-400" />
                <span>FDA MQSA Mammography Credentialing</span>
              </div>
              <input
                type="checkbox"
                checked={formData.requireMqsaForMammo}
                onChange={() => handleToggle('requireMqsaForMammo')}
                className="w-5 h-5 accent-pink-400 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces federal Mammography Quality Standards Act compliance. Only radiologists marked with active MQSA qualification can be assigned to Breast imaging, screening mammo, or 3D tomosynthesis worklists.
            </p>
            <div className="text-[11px] font-mono text-pink-400 pt-1">
              Status: {formData.requireMqsaForMammo ? 'MQSA ENFORCED' : 'UNRESTRICTED'}
            </div>
          </div>

          {/* Card 3: Advanced Practitioner Procedure Supervision */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>AP Procedural Direct MD Supervision</span>
              </div>
              <input
                type="checkbox"
                checked={formData.requireApSupervision}
                onChange={() => handleToggle('requireApSupervision')}
                className="w-5 h-5 accent-emerald-400 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mandates that RPAs/NPs performing fluoroscopy, lumbar punctures, or joint arthrograms have a supervising Attending Radiologist (MD/DO) physically present at the same clinical facility.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 pt-1">
              Status: {formData.requireApSupervision ? 'SUPERVISION MANDATORY' : 'INDEPENDENT SCOPE'}
            </div>
          </div>

          {/* Card 4: Post-Shift Fatigue Guardrail */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Consecutive Shift Fatigue Ceiling</span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                Max {formData.fatigueLimitDays} Days
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sets the upper threshold for consecutive outpatient diagnostic shifts before triggering a clinician fatigue overload warning.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="4"
                max="7"
                step="1"
                value={formData.fatigueLimitDays}
                onChange={(e) => setFormData({ ...formData, fatigueLimitDays: parseInt(e.target.value, 10) || 5 })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="font-mono text-sm font-bold text-white w-12 text-center">
                {formData.fatigueLimitDays} days
              </span>
            </div>
          </div>

          {/* Card 5: Quota & Workload Metrics */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-sm">
                Daily Attending Target Workload (RVU)
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Expected daily diagnostic Relative Value Unit expectation for full-time attending radiologists across outpatient sites.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="20"
                max="120"
                value={55}
                disabled
                className="w-24 bg-[#111113] border border-white/20 rounded-xs p-2 text-white font-mono font-bold text-center"
              />
              <span className="text-xs font-mono text-slate-400">Target RVU / 8-hr Shift</span>
            </div>
          </div>

          {/* Card 6: Concurrent Leave Ceiling */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CalendarX2 className="w-4 h-4 text-purple-400" />
                <span>Max Concurrent Leave per Facility</span>
              </div>
              <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                {formData.maxConcurrentLeave} Physicians
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maximum allowable simultaneous clinical time-off (PTO/CME) approvals before the system flags coverage shortfall warnings.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                max="5"
                value={formData.maxConcurrentLeave}
                onChange={(e) => setFormData({ ...formData, maxConcurrentLeave: parseInt(e.target.value, 10) || 1 })}
                className="w-24 bg-[#111113] border border-white/20 rounded-xs p-2 text-white font-mono font-bold text-center"
              />
              <span className="text-xs font-mono text-slate-400">Physicians Max Off per Day</span>
            </div>
          </div>

        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-extrabold text-xs py-3 px-6 rounded-xs shadow-lg cursor-pointer flex items-center gap-2 font-mono transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Commit Compliance Governance Policies</span>
          </button>
        </div>
      </form>

    </div>
  );
};
