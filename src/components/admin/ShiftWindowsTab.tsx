import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle,
  Flame,
  Coffee
} from 'lucide-react';
import { ShiftWindow } from '../../types';

interface ShiftWindowsTabProps {
  shiftWindows: ShiftWindow[];
  onSaveShiftWindow: (sw: ShiftWindow) => void;
  onDeleteShiftWindow: (swId: string) => void;
}

export const ShiftWindowsTab: React.FC<ShiftWindowsTabProps> = ({
  shiftWindows,
  onSaveShiftWindow,
  onDeleteShiftWindow
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [hours, setHours] = useState('');
  const [category, setCategory] = useState<ShiftWindow['category']>('DAY');
  const [rvuEstimate, setRvuEstimate] = useState<number>(55);
  const [isUndesirable, setIsUndesirable] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleStartEdit = (sw: ShiftWindow) => {
    setEditingId(sw.id);
    setLabel(sw.label);
    setHours(sw.hours);
    setCategory(sw.category);
    setRvuEstimate(sw.rvuEstimate);
    setIsUndesirable(!!sw.isUndesirableSlot);
    setIsFormOpen(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setLabel('');
    setHours('');
    setCategory('DAY');
    setRvuEstimate(55);
    setIsUndesirable(false);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !hours.trim()) return;

    const id = editingId || `shift-${Date.now()}`;
    onSaveShiftWindow({
      id,
      label: label.trim(),
      hours: hours.trim(),
      category,
      rvuEstimate,
      isUndesirableSlot: isUndesirable
    });

    handleResetForm();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#8eb9dd]" />
            <h3 className="meta-mono text-base font-bold text-white">
              Shift Windows & Time Preset Registry
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Define daily operating windows, on-call blocks, and weekend outpatient clinic hours without code changes.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs py-2 px-3 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shift Window</span>
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-[#1c1c1f] p-5 rounded-xs border-2 border-[#8eb9dd] shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h4 className="meta-mono text-sm font-bold text-white">
              {editingId ? `Edit Window: ${label}` : 'Register New Shift Time Window'}
            </h4>
            <button onClick={handleResetForm} className="text-slate-400 hover:text-white cursor-pointer p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block meta-mono text-slate-400 mb-1">Window Title / Label</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  placeholder="e.g. Standard Day (08:00 - 17:00)"
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block meta-mono text-slate-400 mb-1">Time Range (e.g. 08:00 - 17:00)</label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                  placeholder="08:00 - 17:00"
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block meta-mono text-slate-400 mb-1">Shift Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-bold"
                >
                  <option value="DAY">Day Shift (Morning)</option>
                  <option value="MID">Mid Day Shift</option>
                  <option value="SWING">Evening Swing</option>
                  <option value="NIGHT">Night Call</option>
                  <option value="WEEKEND">Weekend Outpatient Clinic</option>
                  <option value="FLEX">Flexible Pool</option>
                </select>
              </div>

              <div>
                <label className="block meta-mono text-slate-400 mb-1">RVU Target Yield</label>
                <input
                  type="number"
                  value={rvuEstimate}
                  onChange={(e) => setRvuEstimate(parseInt(e.target.value, 10) || 0)}
                  min="0"
                  max="200"
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400">
                <input
                  type="checkbox"
                  checked={isUndesirable}
                  onChange={(e) => setIsUndesirable(e.target.checked)}
                  className="accent-amber-400 rounded"
                />
                <span>Flags as Undesirable / High-Burden Slot (e.g. Saturday or Late Night)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-xs border border-white/20 text-slate-400 hover:text-white cursor-pointer font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold px-5 py-2 rounded-xs shadow-md cursor-pointer font-mono flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? 'Save Window' : 'Register Window'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Shift Windows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shiftWindows.map(sw => (
          <div
            key={sw.id}
            className="bg-[#1c1c1f] p-4 rounded-xs border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-black/40 text-[#8eb9dd] border border-white/5">
                  {sw.category}
                </span>
                {sw.isUndesirableSlot ? (
                  <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    BURDEN
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400">STANDARD</span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">
                  {sw.label}
                </h4>
                <div className="text-xs font-mono text-[#8eb9dd] font-bold mt-1">
                  {sw.hours}
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400 pt-1">
                Yield: <strong className="text-white">~{sw.rvuEstimate} RVUs</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleStartEdit(sw)}
                className="text-xs font-mono text-[#8eb9dd] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Remove shift window "${sw.label}"?`)) {
                    onDeleteShiftWindow(sw.id);
                  }
                }}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                title="Delete Shift Window"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
