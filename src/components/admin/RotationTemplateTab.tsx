import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Sparkles, 
  Clock, 
  Check, 
  Layers, 
  ArrowRight,
  Building2,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';
import { RotationTemplate, StaffUser, Shift, ClinicalSite } from '../../types';
import { addDaysISO } from '../../utils/formatters';

interface RotationTemplateTabProps {
  templates: RotationTemplate[];
  onSaveTemplate: (template: RotationTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  users: StaffUser[];
  sites: Record<string, ClinicalSite>;
  onApplyRotationToSchedule: (newShifts: Shift[]) => void;
}

export const RotationTemplateTab: React.FC<RotationTemplateTabProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  users,
  sites,
  onApplyRotationToSchedule
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Template Form State
  const [formName, setFormName] = useState('');
  const [formWeeks, setFormWeeks] = useState(2);
  const [formDescription, setFormDescription] = useState('');
  const [formPattern, setFormPattern] = useState<RotationTemplate['pattern']>([]);

  // Apply Rotation State
  const [applyRadId, setApplyRadId] = useState<string>(users[0]?.id || '');
  const [applyStartDate, setApplyStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [applyCycles, setApplyCycles] = useState<number>(2);
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleStartNewTemplate = () => {
    setEditingTemplateId(null);
    setFormName('New Outpatient Rotation');
    setFormWeeks(2);
    setFormDescription('Standard bi-weekly clinical interpretation rotation pattern.');
    setFormPattern([
      { week: 1, dayOfWeek: 1, modality: 'Neuro', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 1, dayOfWeek: 2, modality: 'Neuro', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 1, dayOfWeek: 3, modality: 'Neuro', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 1, dayOfWeek: 4, modality: 'Neuro', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 1, dayOfWeek: 5, modality: 'Neuro', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 1, modality: 'Body', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 2, modality: 'Body', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 3, modality: 'Body', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 4, modality: 'Body', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' },
      { week: 2, dayOfWeek: 5, modality: 'Body', site: Object.keys(sites)[0] || 'MAIN', hours: '08:00 - 17:00' }
    ]);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (tmpl: RotationTemplate) => {
    setEditingTemplateId(tmpl.id);
    setFormName(tmpl.name);
    setFormWeeks(tmpl.cycleWeeks);
    setFormDescription(tmpl.description);
    setFormPattern([...tmpl.pattern]);
    setIsEditorOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const saved: RotationTemplate = {
      id: editingTemplateId || `rot-${Date.now()}`,
      name: formName.trim(),
      cycleWeeks: formWeeks,
      description: formDescription,
      pattern: formPattern
    };

    onSaveTemplate(saved);
    setSelectedTemplateId(saved.id);
    setIsEditorOpen(false);
  };

  const handleAddPatternItem = () => {
    setFormPattern(prev => [
      ...prev,
      {
        week: 1,
        dayOfWeek: 1,
        modality: 'Body',
        site: Object.keys(sites)[0] || 'MAIN',
        hours: '08:00 - 17:00'
      }
    ]);
  };

  const handleRemovePatternItem = (idx: number) => {
    setFormPattern(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdatePatternItem = (idx: number, updates: Partial<RotationTemplate['pattern'][0]>) => {
    setFormPattern(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item));
  };

  // Execution: Bulk apply rotation pattern into active schedules
  const handleExecuteApplyRotation = () => {
    if (!activeTemplate || !applyRadId || !applyStartDate) return;

    const rad = users.find(u => u.id === applyRadId);
    if (!rad) return;

    // Find nearest Monday for start date
    const d = new Date(applyStartDate + 'T12:00:00Z');
    const day = d.getUTCDay();
    const diffToMonday = day === 0 ? 1 : (1 - day);
    const mondayD = new Date(d);
    mondayD.setUTCDate(d.getUTCDate() + diffToMonday);
    const baseMondayISO = mondayD.toISOString().slice(0, 10);

    const generatedShifts: Shift[] = [];
    const totalWeeks = activeTemplate.cycleWeeks * applyCycles;

    for (let c = 0; c < applyCycles; c++) {
      const cycleWeekOffset = c * activeTemplate.cycleWeeks;
      activeTemplate.pattern.forEach((slot, sIdx) => {
        // slot.week is 1-indexed, slot.dayOfWeek: 1=Mon, 2=Tue... 6=Sat, 0=Sun
        const weekNum = (slot.week - 1) + cycleWeekOffset;
        const dayOffset = (slot.dayOfWeek === 0 ? 6 : (slot.dayOfWeek - 1));
        const totalDaysAhead = (weekNum * 7) + dayOffset;
        const targetDate = addDaysISO(baseMondayISO, totalDaysAhead);

        generatedShifts.push({
          id: `rot-shift-${Date.now()}-${c}-${sIdx}`,
          radId: rad.id,
          specialty: (slot.modality as any) || rad.specialties[0] || 'Body',
          modality: `${slot.modality} Outpatient Interpretation`,
          site: slot.site,
          hours: slot.hours,
          date: targetDate,
          isSupervisor: slot.hours.includes('08:00') && slot.site.includes('MAIN'),
          workstationId: `WS-${slot.site}-01`,
          rvuEstimate: 52
        });
      });
    }

    onApplyRotationToSchedule(generatedShifts);
    setApplyFeedback(`Successfully generated ${generatedShifts.length} rotating shifts for ${rad.name} over ${totalWeeks} weeks starting ${baseMondayISO}.`);
    setTimeout(() => setApplyFeedback(null), 6000);
  };

  const DAYS_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 text-xs text-[#eeedea]">
      
      {/* Header Banner */}
      <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="meta-mono text-sm font-bold text-[#8eb9dd] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8eb9dd]" />
            Multi-Week Recurring Rotation Template Engine
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Construct 2-week, 4-week, or custom recurring clinical rotation cycles and bulk populate assignments onto provider rosters.
          </p>
        </div>
        <button
          onClick={handleStartNewTemplate}
          className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold font-mono py-1.5 px-3 rounded-xs cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Rotation Template</span>
        </button>
      </div>

      {/* Editor Modal / Drawer */}
      {isEditorOpen && (
        <div className="bg-[#242429] p-5 rounded-xs border border-[#8eb9dd]/40 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h4 className="font-bold text-white text-sm">
              {editingTemplateId ? `Edit: ${formName}` : 'Create Multi-Week Rotation Template'}
            </h4>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="text-slate-400 hover:text-white cursor-pointer font-mono"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block meta-mono mb-1 text-[11px]">Template Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="e.g. 4-Week Academic Inpatient/Outpatient"
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-geist"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1 text-[11px]">Cycle Length (Weeks)</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={formWeeks}
                  onChange={(e) => setFormWeeks(Number(e.target.value))}
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-[#8eb9dd] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block meta-mono mb-1 text-[11px]">Clinical Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief summary of subspecialty rotation balance"
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-geist"
                />
              </div>
            </div>

            {/* Pattern Slots Builder */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-300 font-bold">
                  Shift Pattern Slots ({formPattern.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddPatternItem}
                  className="text-xs font-mono text-[#8eb9dd] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Shift Slot</span>
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 border border-white/10 p-2 rounded-xs bg-[#16181e]">
                {formPattern.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-[#20222a] rounded-xs text-xs font-mono">
                    <span className="w-16 text-slate-400">Week {slot.week}:</span>
                    <select
                      value={slot.week}
                      onChange={(e) => handleUpdatePatternItem(idx, { week: Number(e.target.value) })}
                      className="bg-[#111113] border border-white/15 px-2 py-1 rounded text-white text-xs"
                    >
                      {Array.from({ length: formWeeks }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                      ))}
                    </select>

                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => handleUpdatePatternItem(idx, { dayOfWeek: Number(e.target.value) })}
                      className="bg-[#111113] border border-white/15 px-2 py-1 rounded text-white text-xs"
                    >
                      <option value={1}>Mon</option>
                      <option value={2}>Tue</option>
                      <option value={3}>Wed</option>
                      <option value={4}>Thu</option>
                      <option value={5}>Fri</option>
                      <option value={6}>Sat</option>
                      <option value={0}>Sun</option>
                    </select>

                    <input
                      type="text"
                      value={slot.modality}
                      onChange={(e) => handleUpdatePatternItem(idx, { modality: e.target.value })}
                      placeholder="Modality (e.g. Neuro)"
                      className="bg-[#111113] border border-white/15 px-2 py-1 rounded text-white text-xs flex-1 min-w-[90px]"
                    />

                    <select
                      value={slot.site}
                      onChange={(e) => handleUpdatePatternItem(idx, { site: e.target.value })}
                      className="bg-[#111113] border border-white/15 px-2 py-1 rounded text-white text-xs"
                    >
                      {Object.keys(sites).map(s => (
                        <option key={s} value={s}>{sites[s]?.label || s}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={slot.hours}
                      onChange={(e) => handleUpdatePatternItem(idx, { hours: e.target.value })}
                      className="bg-[#111113] border border-white/15 px-2 py-1 rounded text-white text-xs w-28"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemovePatternItem(idx)}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-mono font-bold rounded cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main View: Template Selection & Apply Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Templates List */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Available Rotation Cycles ({templates.length})
          </div>
          <div className="space-y-2">
            {templates.map(tmpl => {
              const isSelected = tmpl.id === (activeTemplate?.id || '');
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-3.5 rounded-xs border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#282d38] border-[#8eb9dd] shadow-md'
                      : 'bg-[#1c1c1f] border-[rgba(238,237,234,0.1)] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{tmpl.name}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-[#8eb9dd] border border-[#8eb9dd]/30">
                      {tmpl.cycleWeeks}-WK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2">
                    <span>{tmpl.pattern.length} shifts / cycle</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(tmpl);
                        }}
                        className="hover:text-[#8eb9dd] text-slate-400 p-0.5"
                        title="Edit Template Pattern"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete template "${tmpl.name}"?`)) {
                            onDeleteTemplate(tmpl.id);
                          }
                        }}
                        className="hover:text-rose-400 text-slate-400 p-0.5"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Template Details & Bulk Apply Generator */}
        <div className="lg:col-span-2 space-y-4">
          {activeTemplate ? (
            <>
              {/* Pattern Overview */}
              <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h4 className="font-bold text-sm text-white">{activeTemplate.name}</h4>
                    <p className="text-[11px] text-slate-400">{activeTemplate.description}</p>
                  </div>
                  <span className="font-mono text-xs text-[#8eb9dd] bg-[#111113] px-2 py-1 rounded border border-white/10">
                    {activeTemplate.cycleWeeks} Weeks &bull; {activeTemplate.pattern.length} Shifts per Cycle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                  {activeTemplate.pattern.map((p, idx) => (
                    <div key={idx} className="p-2 bg-[#16181e] rounded border border-white/5 flex items-center justify-between font-mono text-[11px]">
                      <div>
                        <strong className="text-white">W{p.week} {DAYS_LABEL[p.dayOfWeek]}:</strong> {p.modality}
                      </div>
                      <span className="text-[#8eb9dd] text-[10px] bg-black/40 px-1.5 py-0.5 rounded">
                        {p.site}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulk Apply Generator */}
              <div className="bg-[#1f232c] p-4 rounded-xs border border-[#8eb9dd]/30 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Sparkles className="w-4 h-4 text-[#8eb9dd]" />
                  <span>Apply Rotation Cycle to Provider Roster</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Automatically populates scheduled interpreter shifts according to this multi-week cycle.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block meta-mono mb-1 text-[11px] text-slate-300">Assign Clinician</label>
                    <select
                      value={applyRadId}
                      onChange={(e) => setApplyRadId(e.target.value)}
                      className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block meta-mono mb-1 text-[11px] text-slate-300">Cycle Start Date (Monday)</label>
                    <input
                      type="date"
                      value={applyStartDate}
                      onChange={(e) => setApplyStartDate(e.target.value)}
                      className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block meta-mono mb-1 text-[11px] text-slate-300">Cycle Repeats</label>
                    <select
                      value={applyCycles}
                      onChange={(e) => setApplyCycles(Number(e.target.value))}
                      className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono"
                    >
                      <option value={1}>1 Cycle ({activeTemplate.cycleWeeks} Weeks)</option>
                      <option value={2}>2 Cycles ({activeTemplate.cycleWeeks * 2} Weeks)</option>
                      <option value={3}>3 Cycles ({activeTemplate.cycleWeeks * 3} Weeks)</option>
                      <option value={4}>4 Cycles ({activeTemplate.cycleWeeks * 4} Weeks)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">
                    Will generate {activeTemplate.pattern.length * applyCycles} shifts
                  </span>
                  <button
                    onClick={handleExecuteApplyRotation}
                    className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold font-mono text-xs px-4 py-2 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate & Apply Shifts</span>
                  </button>
                </div>

                {applyFeedback && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded text-emerald-200 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{applyFeedback}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 font-mono">
              Select or create a rotation template to inspect pattern details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
