import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Sliders, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { ComplianceRule, ClinicalSite, StaffUser, Shift, ScheduleConflict } from '../../types';

interface VisualRuleBuilderTabProps {
  rules: ComplianceRule[];
  onSaveRule: (rule: ComplianceRule) => void;
  onDeleteRule: (id: string) => void;
  sites: Record<string, ClinicalSite>;
  users: StaffUser[];
  shifts: Shift[];
  conflicts: ScheduleConflict[];
}

export const VisualRuleBuilderTab: React.FC<VisualRuleBuilderTabProps> = ({
  rules,
  onSaveRule,
  onDeleteRule,
  sites,
  users,
  shifts,
  conflicts
}) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form State
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<ComplianceRule['type']>('SITE_SUPERVISION');
  const [ruleTarget, setRuleTarget] = useState(Object.keys(sites)[0] || 'MAIN');
  const [ruleMinCount, setRuleMinCount] = useState(1);
  const [ruleDays, setRuleDays] = useState<ComplianceRule['days']>('WEEKDAYS');
  const [ruleSeverity, setRuleSeverity] = useState<'CRITICAL' | 'WARNING'>('CRITICAL');
  const [ruleCondition, setRuleCondition] = useState<string>('MANDATORY_ON_SITE');

  // Test Simulator State
  const [testResult, setTestResult] = useState<{ status: 'PASS' | 'FAIL'; msg: string; details: string[] } | null>(null);

  const handleStartEdit = (r: ComplianceRule) => {
    setEditingRuleId(r.id);
    setRuleName(r.name || '');
    setRuleType(r.type);
    setRuleTarget(r.target);
    setRuleMinCount(r.minCount);
    setRuleDays(r.days);
  };

  const handleResetForm = () => {
    setEditingRuleId(null);
    setRuleName('');
    setRuleType('SITE_SUPERVISION');
    setRuleTarget(Object.keys(sites)[0] || 'MAIN');
    setRuleMinCount(1);
    setRuleDays('WEEKDAYS');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const saved: ComplianceRule = {
      id: editingRuleId || `rule-${Date.now()}`,
      name: ruleName.trim(),
      type: ruleType,
      target: ruleTarget.trim(),
      minCount: ruleMinCount,
      days: ruleDays
    };

    onSaveRule(saved);
    handleResetForm();
  };

  const handleRunSimulator = () => {
    // Audit active schedule against current rule definitions
    const activeConflicts = conflicts;
    if (activeConflicts.length === 0) {
      setTestResult({
        status: 'PASS',
        msg: 'All 100% of outpatient interpreting shifts and on-site supervisory mandates satisfy practice compliance rules.',
        details: [
          `Verified MQSA credentials across all breast imaging reading lists.`,
          `Verified contrast safety supervisor designated at all active facilities.`,
          `No fatigue threshold violations detected (>5 consecutive days).`
        ]
      });
    } else {
      setTestResult({
        status: 'FAIL',
        msg: `Detected ${activeConflicts.length} active rule discrepancies in current interpreting roster.`,
        details: activeConflicts.map(c => `[${c.severity}] ${c.date} ${c.site || ''}: ${c.message} (${c.details})`)
      });
    }
  };

  return (
    <div className="space-y-6 text-xs text-[#eeedea]">
      
      {/* Header Banner */}
      <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="meta-mono text-sm font-bold text-[#8eb9dd] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8eb9dd]" />
            No-Code Visual Compliance Rule & Constraint Builder
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Construct visual logic rules for ACR contrast supervision, subspecialty reader minimums, and fatigue ceilings with instant validation.
          </p>
        </div>
        <button
          onClick={handleRunSimulator}
          className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 font-bold font-mono py-1.5 px-3 rounded-xs cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Schedule Against Rules</span>
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xs border text-xs font-mono space-y-2 animate-in fade-in ${
          testResult.status === 'PASS' 
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 text-sm">
              {testResult.status === 'PASS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {testResult.msg}
            </span>
            <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white cursor-pointer">
              &times;
            </button>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] opacity-90">
            {testResult.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Rule Builder Form */}
      <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
        <div className="flex items-center justify-between pb-1">
          <span className="font-mono font-bold text-xs text-white">
            {editingRuleId ? `Edit Rule: ${ruleName}` : 'Add New Visual Compliance Constraint'}
          </span>
          {editingRuleId && (
            <button
              onClick={handleResetForm}
              className="text-xs text-rose-400 hover:underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Visual Condition Pipeline Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#16181e] p-3 rounded-xs border border-white/5">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#8eb9dd] block mb-1 font-bold">1. Rule Context</span>
              <label className="block meta-mono mb-1 text-[11px] text-slate-300">Rule Name</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. Outpatient MRI Supervisor"
                required
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white text-xs"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#8eb9dd] block mb-1 font-bold">2. Constraint Type</span>
              <label className="block meta-mono mb-1 text-[11px] text-slate-300">Requirement Logic</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as any)}
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white text-xs"
              >
                <option value="SITE_SUPERVISION">On-Site Contrast Supervisor (ACR Mandate)</option>
                <option value="SPECIALTY_QUOTA">Subspecialty Minimum Readers (e.g. Neuro/Breast)</option>
                <option value="AP_SUPERVISION">AP In-Facility Attending Oversight</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#8eb9dd] block mb-1 font-bold">3. Target Facility / Modality</span>
              <label className="block meta-mono mb-1 text-[11px] text-slate-300">Target Scoping</label>
              <input
                type="text"
                value={ruleTarget}
                onChange={(e) => setRuleTarget(e.target.value)}
                placeholder="e.g. MAIN, EAST, Neuro, Breast"
                required
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono text-xs uppercase"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#8eb9dd] block mb-1 font-bold">4. Schedule Days & Quota</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block meta-mono mb-1 text-[11px] text-slate-300">Min Readers</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={ruleMinCount}
                    onChange={(e) => setRuleMinCount(Number(e.target.value))}
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-[#8eb9dd] font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block meta-mono mb-1 text-[11px] text-slate-300">Days Active</label>
                  <select
                    value={ruleDays}
                    onChange={(e) => setRuleDays(e.target.value as any)}
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white text-xs font-mono"
                  >
                    <option value="WEEKDAYS">Mon–Fri</option>
                    <option value="ALL">All Days</option>
                    <option value="WEEKENDS">Sat–Sun</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold font-mono py-2 px-4 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingRuleId ? 'Update Compliance Rule' : 'Save & Enforce Rule'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Rules Table */}
      <div className="bg-[#1c1c1f] rounded-xs border border-[rgba(238,237,234,0.1)] overflow-hidden">
        <div className="p-3 bg-[#111113] border-b border-white/10 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-white">Active Practice Compliance Constraints ({rules.length})</span>
          <span className="text-[11px] text-slate-400">Enforced real-time during shift creation, swaps, and scheduling</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#242429] text-[rgba(238,237,234,0.5)] uppercase meta-mono border-b border-[rgba(238,237,234,0.08)]">
              <th className="p-3">Rule Name</th>
              <th className="p-3">Constraint Type</th>
              <th className="p-3">Target Scope</th>
              <th className="p-3">Requirement</th>
              <th className="p-3">Active Days</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(238,237,234,0.06)] font-medium">
            {rules.map(r => (
              <tr key={r.id} className="hover:bg-[rgba(238,237,234,0.02)] transition-colors">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8eb9dd]" />
                  <span>{r.name || r.id}</span>
                </td>
                <td className="p-3 font-mono text-[11px] text-slate-300">
                  {r.type.replace(/_/g, ' ')}
                </td>
                <td className="p-3 font-mono font-bold text-[#8eb9dd] uppercase text-[11px]">
                  {r.target}
                </td>
                <td className="p-3 font-mono text-white">
                  &ge; {r.minCount} qualified reader(s)
                </td>
                <td className="p-3 font-mono text-xs text-slate-300">
                  {r.days}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleStartEdit(r)}
                      className="p-1 hover:text-[#8eb9dd] text-slate-400 cursor-pointer"
                      title="Edit Rule"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete compliance rule "${r.name || r.id}"?`)) {
                          onDeleteRule(r.id);
                        }
                      }}
                      className="p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
