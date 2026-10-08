import React, { useState } from 'react';
import { X, Copy, ArrowRight } from 'lucide-react';
import { ClinicalSite, Shift } from '../../types';
import { addDaysISO } from '../../utils/formatters';

interface CopyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Record<string, ClinicalSite>;
  shifts: Shift[];
  onExecuteCopy: (newShifts: Shift[]) => void;
  activeDate: string;
}

export const CopyScheduleModal: React.FC<CopyScheduleModalProps> = ({
  isOpen,
  onClose,
  sites,
  shifts,
  onExecuteCopy,
  activeDate
}) => {
  const siteKeys = Object.keys(sites);
  const [sourceSite, setSourceSite] = useState<string>(siteKeys[0] || 'MAIN');
  const [targetSite, setTargetSite] = useState<string>(siteKeys[0] || 'MAIN');
  const [periodType, setPeriodType] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [sourceStartDate, setSourceStartDate] = useState<string>(activeDate);
  const [targetStartDate, setTargetStartDate] = useState<string>(addDaysISO(activeDate, 7));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const daysToCopy = periodType === 'WEEK' ? 7 : (periodType === 'MONTH' ? 30 : 1);
    const generatedShifts: Shift[] = [];

    for (let i = 0; i < daysToCopy; i++) {
      const srcDate = addDaysISO(sourceStartDate, i);
      const tgtDate = addDaysISO(targetStartDate, i);

      const matching = shifts.filter(s => s.date === srcDate && s.site === sourceSite);
      for (const s of matching) {
        generatedShifts.push({
          ...s,
          id: `shift-copy-${Date.now()}-${generatedShifts.length}-${Math.random().toString(36).substring(2, 6)}`,
          date: tgtDate,
          site: targetSite
        });
      }
    }

    onExecuteCopy(generatedShifts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-md overflow-hidden shadow-2xl text-[#fdfdfd]">
        
        <div className="bg-[#2e313a] px-5 py-4 border-b border-white/15 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40 flex items-center justify-center font-bold">
              <Copy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-brand italic text-base text-[#fdfdfd] font-bold">
                Copy Schedule Patterns
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
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Source Facility
              </label>
              <select
                value={sourceSite}
                onChange={(e) => setSourceSite(e.target.value)}
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-semibold text-white focus:outline-none focus:border-[#a0c9eb]"
              >
                {Object.values(sites).map(s => (
                  <option key={s.id} value={s.id} className="bg-[#2e313a]">{s.name} ({s.label})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Time Window Scope
              </label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as any)}
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-bold text-[#a0c9eb] focus:outline-none focus:border-[#a0c9eb]"
              >
                <option value="DAY" className="bg-[#2e313a]">Single Day Pattern</option>
                <option value="WEEK" className="bg-[#2e313a]">Full Week (7 Days)</option>
                <option value="MONTH" className="bg-[#2e313a]">Full Month (30 Days)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/15">
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Source Start Date
              </label>
              <input
                type="date"
                value={sourceStartDate}
                onChange={(e) => setSourceStartDate(e.target.value)}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white font-bold focus:outline-none focus:border-[#a0c9eb]"
              />
            </div>
            <div>
              <label className="block meta-mono text-slate-200 font-semibold mb-1">
                Target Start Date
              </label>
              <input
                type="date"
                value={targetStartDate}
                onChange={(e) => setTargetStartDate(e.target.value)}
                required
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white font-bold focus:outline-none focus:border-[#a0c9eb]"
              />
            </div>
          </div>

          <div>
            <label className="block meta-mono text-slate-200 font-semibold mb-1">
              Destination Target Facility
            </label>
            <select
              value={targetSite}
              onChange={(e) => setTargetSite(e.target.value)}
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-geist font-semibold text-white focus:outline-none focus:border-[#a0c9eb]"
            >
              {Object.values(sites).map(s => (
                <option key={s.id} value={s.id} className="bg-[#2e313a]">{s.name} ({s.label})</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-[#282b35] border border-white/15 rounded-xs text-[11px] text-slate-200 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#a0c9eb] shrink-0" />
            <p>
              Shifts will be replicated with new unique IDs. Real-time conflict engine will automatically validate target slots upon insertion.
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
              Execute Copy
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
