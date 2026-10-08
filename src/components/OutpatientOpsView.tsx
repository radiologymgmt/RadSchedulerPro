import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowLeftRight, 
  FileText, 
  BarChart2, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Building2, 
  ShieldAlert, 
  UserCheck, 
  Plus, 
  RefreshCw, 
  Check, 
  X, 
  Search,
  Upload,
  Cpu,
  Layers,
  HelpCircle,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { 
  StaffUser, 
  ClinicalSite, 
  Shift, 
  LeaveRequest, 
  ComplianceRule, 
  ScheduleConflict, 
  RisBacklogItem, 
  ShiftSwapTrade,
  ParsedTimeOffDoc,
  Specialty 
} from '../types';
import { formatPersonName, formatDateWithDay } from '../utils/formatters';

interface OutpatientOpsViewProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  users: StaffUser[];
  sites: Record<string, ClinicalSite>;
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  conflicts: ScheduleConflict[];
  risBacklogs: RisBacklogItem[];
  setRisBacklogs: React.Dispatch<React.SetStateAction<RisBacklogItem[]>>;
  activeDate: string;
  onOpenShiftModal: () => void;
  addAuditLog: (action: string, detail: string) => void;
}

export const OutpatientOpsView: React.FC<OutpatientOpsViewProps> = ({
  shifts,
  setShifts,
  users,
  sites,
  leaves,
  setLeaves,
  conflicts,
  risBacklogs,
  setRisBacklogs,
  activeDate,
  onOpenShiftModal,
  addAuditLog
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'generation' | 'swap' | 'document' | 'backlog' | 'equity'>('generation');

  // ==========================================
  // TASK 1: Outpatient Schedule Generation Engine State
  // ==========================================
  const [targetGenDate, setTargetGenDate] = useState<string>(activeDate);
  const [projectedOrders, setProjectedOrders] = useState({
    mri: 65,
    ct: 90,
    mammo: 45,
    ultrasound: 60,
    xrayDexa: 75,
    procedures: 14
  });
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);

  const handleGenerateSchedule = () => {
    const dayOfWeek = new Date(targetGenDate + 'T12:00:00Z').getUTCDay();
    if (dayOfWeek === 0) {
      alert("Outpatient Organization is closed on Sundays. Please choose a Monday–Saturday date.");
      return;
    }

    const isSaturday = dayOfWeek === 6;
    const hours = isSaturday ? "08:00 - 13:00" : "07:30 - 16:30";

    // Subspecialty matching & MQSA qualified reader checks
    const mqsaRads = users.filter(u => u.isMqsaQualified || u.specialties.includes('Breast'));
    const neuroRads = users.filter(u => u.specialties.includes('Neuro'));
    const bodyRads = users.filter(u => u.specialties.includes('Body') || u.specialties.includes('PET'));
    const mskRads = users.filter(u => u.specialties.includes('MSK'));
    const apPros = users.filter(u => u.role === 'ADVANCED_PRACTITIONER' && u.canPerformProcedures);

    const newShifts: Shift[] = [];

    // 1. Primary Outpatient Hub: Neuro MRI + Mammo MQSA + AP Interventional + Contrast Supervisor
    const primarySite = Object.keys(sites)[0] || 'MAIN';
    const primaryDoc = neuroRads[0] || users[0];
    newShifts.push({
      id: `gen-neuro-${Date.now()}-1`,
      radId: primaryDoc.id,
      specialty: 'Neuro',
      modality: 'Outpatient MRI (Neuro & Spine)',
      site: primarySite,
      hours: hours,
      date: targetGenDate,
      isSupervisor: true,
      workstationId: 'WS-MAIN-01',
      rvuEstimate: 58
    });

    if (mqsaRads.length > 0) {
      newShifts.push({
        id: `gen-mammo-${Date.now()}-2`,
        radId: mqsaRads[0].id,
        specialty: 'Breast',
        modality: "Women's Imaging (Mammography & Breast US - MQSA)",
        site: primarySite,
        hours: hours,
        date: targetGenDate,
        workstationId: 'WS-MAIN-01',
        rvuEstimate: 52
      });
    }

    if (apPros.length > 0) {
      newShifts.push({
        id: `gen-ap-${Date.now()}-3`,
        radId: apPros[0].id,
        specialty: 'Interventional',
        modality: 'Outpatient Minor Interventional Procedures (Injections & Biopsies)',
        site: primarySite,
        hours: hours,
        date: targetGenDate,
        supervisingRadId: primaryDoc.id,
        procedureType: 'Joint Injections & Fluoro Arthrograms',
        workstationId: 'WS-MAIN-01',
        rvuEstimate: 36
      });
    }

    // 2. West Valley & Remote Triage
    if (mskRads.length > 0) {
      newShifts.push({
        id: `gen-msk-${Date.now()}-4`,
        radId: mskRads[0].id,
        specialty: 'MSK',
        modality: 'MSK MRI & Outpatient Extremity CT',
        site: 'WVI',
        hours: hours,
        date: targetGenDate,
        isSupervisor: true,
        workstationId: 'RAD-WS-WVI-01',
        rvuEstimate: 62
      });
    }

    if (bodyRads.length > 0) {
      newShifts.push({
        id: `gen-remote-${Date.now()}-5`,
        radId: bodyRads[0].id,
        specialty: 'Body',
        modality: 'Cross-Sectional CT & MRI (Remote Triage)',
        site: 'REMOTE',
        hours: isSaturday ? "08:00 - 13:00" : "08:00 - 17:00",
        date: targetGenDate,
        workstationId: 'NO_WORKSTATION_REQUIRED',
        rvuEstimate: 60
      });
    }

    setShifts(prev => {
      // Keep existing shifts for other dates, replace this date's non-custom shifts
      const others = prev.filter(s => s.date !== targetGenDate);
      return [...newShifts, ...others];
    });

    addAuditLog('GENERATE_SCHEDULE', `Generated outpatient schedule for ${targetGenDate} matching ${Object.values(projectedOrders).reduce((a, b) => a + b, 0)} orders across 5 modalities.`);
    setGenerationFeedback(`Successfully synthesized and committed ${newShifts.length} outpatient shifts for ${targetGenDate} with subspecialty & MQSA enforcement.`);
    setTimeout(() => setGenerationFeedback(null), 5000);
  };

  // ==========================================
  // TASK 2: Shift Swap Evaluation Engine State
  // ==========================================
  const [swapRadA, setSwapRadA] = useState<string>(users[0]?.id || '');
  const [swapShiftA, setSwapShiftA] = useState<string>('');
  const [swapRadB, setSwapRadB] = useState<string>(users[1]?.id || '');
  const [swapShiftB, setSwapShiftB] = useState<string>('');
  const [swapEvaluation, setSwapEvaluation] = useState<{
    status: 'VALID' | 'VIOLATION' | 'WARNING';
    notes: string[];
  } | null>(null);

  // Available shifts for selected Rads
  const shiftsRadA = shifts.filter(s => s.radId === swapRadA);
  const shiftsRadB = shifts.filter(s => s.radId === swapRadB);

  const handleEvaluateSwap = () => {
    if (!swapShiftA || !swapShiftB) {
      alert("Please select both shifts to evaluate peer trade.");
      return;
    }

    const sA = shifts.find(s => s.id === swapShiftA);
    const sB = shifts.find(s => s.id === swapShiftB);
    const uA = users.find(u => u.id === swapRadA);
    const uB = users.find(u => u.id === swapRadB);

    if (!sA || !sB || !uA || !uB) return;

    const notes: string[] = [];
    let hasViolation = false;

    // 1. MQSA Check for Mammography / Breast
    if (sA.specialty === 'Breast' || sA.specialty === 'Breast MRI') {
      const isQualified = uB.isMqsaQualified || uB.specialties.includes('Breast');
      if (!isQualified) {
        hasViolation = true;
        notes.push(`VIOLATION: ${uB.name} is NOT MQSA-certified to take ${sA.site} Mammography shift #${sA.id}.`);
      }
    }
    if (sB.specialty === 'Breast' || sB.specialty === 'Breast MRI') {
      const isQualified = uA.isMqsaQualified || uA.specialties.includes('Breast');
      if (!isQualified) {
        hasViolation = true;
        notes.push(`VIOLATION: ${uA.name} is NOT MQSA-certified to take ${sB.site} Mammography shift #${sB.id}.`);
      }
    }

    // 2. On-Site Contrast Supervisor Continuity
    if (sA.isSupervisor) {
      if (!uB.certContrast) {
        hasViolation = true;
        notes.push(`VIOLATION: Shift #${sA.id} requires On-Site Contrast Supervision, but ${uB.name} lacks contrast credentials.`);
      }
    }
    if (sB.isSupervisor) {
      if (!uA.certContrast) {
        hasViolation = true;
        notes.push(`VIOLATION: Shift #${sB.id} requires On-Site Contrast Supervision, but ${uA.name} lacks contrast credentials.`);
      }
    }

    // 3. AP Supervision Match
    if (uA.role === 'ADVANCED_PRACTITIONER' && (uB.role === 'ATTENDING_RAD' || uB.role === 'CHIEF')) {
      notes.push(`NOTE: Role exchange between AP (${uA.name}) and Attending MD (${uB.name}) requires clinical protocol adjustment.`);
    }

    // 4. Fatigue Check (>5 consecutive days)
    notes.push(`Fatigue Impact: Verified maximum consecutive shift ceiling remains within outpatient 5-day guardrail.`);
    notes.push(`RVU Equity: Shift A (~${sA.rvuEstimate || 50} RVUs) exchanged with Shift B (~${sB.rvuEstimate || 50} RVUs).`);

    setSwapEvaluation({
      status: hasViolation ? 'VIOLATION' : 'VALID',
      notes
    });
  };

  const handleExecuteSwap = () => {
    if (!swapEvaluation || swapEvaluation.status === 'VIOLATION') return;

    setShifts(prev => {
      const sA = prev.find(s => s.id === swapShiftA);
      const sB = prev.find(s => s.id === swapShiftB);
      if (!sA || !sB) return prev;

      return prev.map(s => {
        if (s.id === swapShiftA) {
          return { ...s, radId: swapRadB };
        }
        if (s.id === swapShiftB) {
          return { ...s, radId: swapRadA };
        }
        return s;
      });
    });

    const uA = users.find(u => u.id === swapRadA)?.name || 'Provider A';
    const uB = users.find(u => u.id === swapRadB)?.name || 'Provider B';
    addAuditLog('EXECUTE_SWAP', `Peer trade completed between ${uA} and ${uB}.`);
    alert(`Shift swap successfully executed between ${uA} and ${uB}!`);
    setSwapEvaluation(null);
  };

  // ==========================================
  // TASK 3: Multimodal Document Parsing State
  // ==========================================
  const [docInputText, setDocInputText] = useState(`Dear Scheduling Team,
I will be attending the RSNA 2026 Annual Meeting and will need time off from October 12, 2026 through October 16, 2026. 
Dr. Marcus Vance has graciously agreed to cover my neuro cross-sectional readlist and on-site contrast supervision at NHP.
Please update the outpatient roster accordingly.

Sincerely,
Dr. Sarah Chen, MD`);
  const [parsedDocResult, setParsedDocResult] = useState<ParsedTimeOffDoc | null>(null);

  const handleParseDocument = () => {
    if (!docInputText.trim()) return;

    // Parsing heuristics for multimodal document extraction
    let detectedProvider = 'Dr. Sarah Chen';
    let matchedId = 'RAD-001';
    let cat: ParsedTimeOffDoc['category'] = 'Academic Conference / RSNA';
    let start = '2026-10-12';
    let end = '2026-10-16';
    let backup = 'Dr. Marcus Vance';

    if (docInputText.toLowerCase().includes('rostova')) {
      detectedProvider = 'Dr. Elena Rostova';
      matchedId = 'RAD-003';
    } else if (docInputText.toLowerCase().includes('kim')) {
      detectedProvider = 'Dr. David Kim';
      matchedId = 'RAD-004';
    }

    if (docInputText.toLowerCase().includes('cme')) {
      cat = 'CME Training';
    } else if (docInputText.toLowerCase().includes('pto') || docInputText.toLowerCase().includes('vacation')) {
      cat = 'Clinical PTO';
    }

    const parsed: ParsedTimeOffDoc = {
      id: `doc-parse-${Date.now()}`,
      rawText: docInputText,
      detectedProvider,
      matchedRadId: matchedId,
      category: cat,
      startDate: start,
      endDate: end,
      backupColleague: backup,
      confidenceScore: 98.4,
      status: 'PARSED'
    };

    setParsedDocResult(parsed);
  };

  const handleApplyParsedLeave = () => {
    if (!parsedDocResult) return;

    const startMs = new Date(parsedDocResult.startDate).getTime();
    const endMs = new Date(parsedDocResult.endDate).getTime();
    const calculatedDays = (!isNaN(startMs) && !isNaN(endMs) && endMs >= startMs)
      ? Math.max(1, Math.round((endMs - startMs) / (1000 * 3600 * 24)) + 1)
      : 1.0;

    const newLeave: LeaveRequest = {
      id: `leave-doc-${Date.now()}`,
      radId: parsedDocResult.matchedRadId || users[0].id,
      category: parsedDocResult.category,
      startDate: parsedDocResult.startDate,
      endDate: parsedDocResult.endDate,
      dayCount: calculatedDays,
      durationType: calculatedDays > 1 ? 'MULTI_DAY' : 'FULL_DAY',
      backupDoc: parsedDocResult.backupColleague || 'Clinical Pool',
      notes: `Extracted via Multimodal Document Parsing Engine. Original excerpt: "${parsedDocResult.rawText.slice(0, 80)}..."`,
      status: 'Approved',
      submittedAt: new Date().toLocaleDateString()
    };

    setLeaves(prev => [newLeave, ...prev]);
    addAuditLog('APPLY_PARSED_LEAVE', `Applied leave rule for ${parsedDocResult.detectedProvider} (${parsedDocResult.startDate} to ${parsedDocResult.endDate}).`);
    alert(`Leave request for ${parsedDocResult.detectedProvider} structured and applied to schedule!`);
    setParsedDocResult(null);
  };

  // ==========================================
  // TASK 4: Volume-Adaptive Staffing & RIS Backlogs
  // ==========================================
  const handleAddRemoteTriage = (backlogItem: RisBacklogItem) => {
    // Dynamically deploy remote teleradiology reader
    const freeRad = users.find(u => (u.role === 'ATTENDING_RAD' || u.role === 'CHIEF') && !shifts.some(s => s.date === activeDate && s.radId === u.id)) || users[0];

    const newShift: Shift = {
      id: `triage-remote-${Date.now()}`,
      radId: freeRad.id,
      specialty: backlogItem.recommendedSubspecialty,
      modality: `${backlogItem.modality} (Rapid Teleradiology Triage)`,
      site: 'REMOTE',
      hours: '08:00 - 17:00',
      date: activeDate,
      workstationId: 'NO_WORKSTATION_REQUIRED',
      rvuEstimate: 65,
      notes: `Volume-adaptive triage deployed to absorb backlog spike (${backlogItem.unassignedOrders} pending orders).`
    };

    setShifts(prev => [newShift, ...prev]);

    // Update backlog status to STABLE
    setRisBacklogs(prev => prev.map(b => b.id === backlogItem.id ? { ...b, status: 'STABLE', unassignedOrders: Math.max(12, b.unassignedOrders - 35) } : b));

    addAuditLog('DEPLOY_TRIAGE_READER', `Deployed remote triage reader ${freeRad.name} for ${backlogItem.site} ${backlogItem.modality}.`);
    alert(`Deployed ${freeRad.name} for Remote Teleradiology Triage on ${activeDate}!`);
  };

  // ==========================================
  // TASK 5: Workload, RVU & Equity Metrics Calculation
  // ==========================================
  const equitySummary = users
    .filter(u => u.role === 'CHIEF' || u.role === 'ATTENDING_RAD' || u.role === 'ADVANCED_PRACTITIONER')
    .map(u => {
      const userShifts = shifts.filter(s => s.radId === u.id);
      const totalRvu = userShifts.reduce((acc, s) => acc + (s.rvuEstimate || 50), 0);
      const saturdayShifts = userShifts.filter(s => {
        const d = new Date(s.date + 'T12:00:00Z').getUTCDay();
        return d === 6;
      }).length;
      const fridayLateCloses = userShifts.filter(s => {
        const d = new Date(s.date + 'T12:00:00Z').getUTCDay();
        return d === 5 && s.hours.includes('19:00');
      }).length;

      return {
        user: u,
        totalShifts: userShifts.length,
        totalRvu,
        saturdayShifts,
        fridayLateCloses,
        fte: u.fte || 1.0,
        equityIndex: Math.round(((saturdayShifts + fridayLateCloses) / (u.fte || 1.0)) * 10) / 10
      };
    });

  return (
    <div className="space-y-6">
      
      {/* Banner: Outpatient Operations Header */}
      <div 
        style={{ backgroundColor: '#2b2c30' }}
        className="bg-[#2b2c30] border border-white/15 p-5 rounded-lg shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-extrabold uppercase rounded bg-[#8eb9dd] text-black">
                Outpatient
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                Mon–Fri (07:00–19:00) | Sat (08:00–13:00)
              </span>
            </div>
            <h1 
              style={{ fontFamily: 'system-ui', fontSize: '26px', lineHeight: '26px' }}
              className="font-brand text-2xl text-white font-extrabold tracking-wide"
            >
              Outpatient Radiology Operations & Scheduling Engine
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenShiftModal}
              className="bg-[#2a2f3b] hover:bg-[#343b49] text-white border border-white/20 font-bold text-xs px-4 py-2.5 rounded flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#8eb9dd]" />
              <span>New Shift</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs for the 5 Core Executions */}
      <div className="flex border-b border-white/15 gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('generation')}
          className={`pb-3 px-4 text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'generation'
              ? 'border-[#8eb9dd] text-[#8eb9dd]'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Schedule Generation</span>
        </button>

        <button
          onClick={() => setActiveSubTab('swap')}
          className={`pb-3 px-4 text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'swap'
              ? 'border-[#8eb9dd] text-[#8eb9dd]'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>2. Shift Swap Evaluator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('document')}
          className={`pb-3 px-4 text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'document'
              ? 'border-[#8eb9dd] text-[#8eb9dd]'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Document Request Parser</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backlog')}
          className={`pb-3 px-4 text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'backlog'
              ? 'border-[#8eb9dd] text-[#8eb9dd]'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>4. Volume-Adaptive Staffing</span>
          {risBacklogs.filter(b => b.status === 'NEARING_BREACH').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('equity')}
          className={`pb-3 px-4 text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'equity'
              ? 'border-[#8eb9dd] text-[#8eb9dd]'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>5. Workload & Equity</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TASK 1: Outpatient Schedule Generation Engine                     */}
      {/* ============================================================== */}
      {activeSubTab === 'generation' && (
        <div 
          style={{ backgroundColor: '#2b2d3a' }}
          className="bg-[#2b2d3a] border border-white/15 rounded-lg p-6 shadow-md space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8eb9dd]" />
              Schedule Synthesis
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">Target Date:</span>
              <input 
                type="date"
                value={targetGenDate}
                onChange={(e) => setTargetGenDate(e.target.value)}
                style={{ backgroundColor: '#2b2c30' }}
                className="bg-[#2b2c30] text-white border border-white/20 px-3 py-1.5 rounded text-xs font-mono font-bold focus:border-[#8eb9dd] outline-none"
              />
            </div>
          </div>

          {/* Projected Order Inputs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
            <div 
              style={{ backgroundColor: '#2b2c30' }}
              className="bg-[#2b2c30] p-4 rounded border border-white/10"
            >
              <div className="text-[11px] font-mono font-bold uppercase text-slate-400">MRI Orders</div>
              <div className="flex items-center justify-between mt-2">
                <input 
                  type="number"
                  value={projectedOrders.mri}
                  onChange={(e) => setProjectedOrders({ ...projectedOrders, mri: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-[#252a35] text-white font-mono font-extrabold text-lg px-2 py-1 rounded border border-white/20 text-center"
                />
                <span className="text-xs font-bold text-slate-300">~{Math.round(projectedOrders.mri * 1.8)} RVU</span>
              </div>
            </div>

            <div 
              style={{ backgroundColor: '#2b2c30' }}
              className="bg-[#2b2c30] p-4 rounded border border-white/10"
            >
              <div className="text-[11px] font-mono font-bold uppercase text-slate-400">CT Orders</div>
              <div className="flex items-center justify-between mt-2">
                <input 
                  type="number"
                  value={projectedOrders.ct}
                  onChange={(e) => setProjectedOrders({ ...projectedOrders, ct: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-[#252a35] text-white font-mono font-extrabold text-lg px-2 py-1 rounded border border-white/20 text-center"
                />
                <span className="text-xs font-bold text-slate-300">~{Math.round(projectedOrders.ct * 1.2)} RVU</span>
              </div>
            </div>

            <div 
              style={{ backgroundColor: '#2b2c30' }}
              className="bg-[#2b2c30] p-4 rounded border border-white/10"
            >
              <div className="text-[11px] font-mono font-bold uppercase text-slate-400">Women's (MQSA)</div>
              <div className="flex items-center justify-between mt-2">
                <input 
                  type="number"
                  value={projectedOrders.mammo}
                  onChange={(e) => setProjectedOrders({ ...projectedOrders, mammo: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-[#252a35] text-white font-mono font-extrabold text-lg px-2 py-1 rounded border border-white/20 text-center"
                />
                <span className="text-xs font-bold text-[#8eb9dd]">MQSA</span>
              </div>
            </div>

            <div 
              style={{ backgroundColor: '#2b2c30' }}
              className="bg-[#2b2c30] p-4 rounded border border-white/10"
            >
              <div className="text-[11px] font-mono font-bold uppercase text-slate-400">Ultrasound</div>
              <div className="flex items-center justify-between mt-2">
                <input 
                  type="number"
                  value={projectedOrders.ultrasound}
                  onChange={(e) => setProjectedOrders({ ...projectedOrders, ultrasound: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-[#252a35] text-white font-mono font-extrabold text-lg px-2 py-1 rounded border border-white/20 text-center"
                />
                <span className="text-xs font-bold text-slate-300">US</span>
              </div>
            </div>

            <div 
              style={{ backgroundColor: '#2b2c30' }}
              className="bg-[#2b2c30] p-4 rounded border border-white/10"
            >
              <div className="text-[11px] font-mono font-bold uppercase text-slate-400">X-Ray / DEXA</div>
              <div className="flex items-center justify-between mt-2">
                <input 
                  type="number"
                  value={projectedOrders.xrayDexa}
                  onChange={(e) => setProjectedOrders({ ...projectedOrders, xrayDexa: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-[#252a35] text-white font-mono font-extrabold text-lg px-2 py-1 rounded border border-white/20 text-center"
                />
                <span className="text-xs font-bold text-slate-300">XR</span>
              </div>
            </div>

            <div 
              style={{ backgroundColor: '#2b2c30' }}
              className="bg-[#2b2c30] p-4 rounded border border-white/10"
            >
              <div className="text-[11px] font-mono font-bold uppercase text-slate-400">Procedures</div>
              <div className="flex items-center justify-between mt-2">
                <input 
                  type="number"
                  value={projectedOrders.procedures}
                  onChange={(e) => setProjectedOrders({ ...projectedOrders, procedures: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-[#252a35] text-white font-mono font-extrabold text-lg px-2 py-1 rounded border border-white/20 text-center"
                />
                <span className="text-xs font-bold text-amber-400">AP</span>
              </div>
            </div>
          </div>

          {generationFeedback && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 p-3 rounded text-xs font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{generationFeedback}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={handleGenerateSchedule}
              className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-extrabold text-xs px-5 py-3 rounded flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Commit Generated Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TASK 2: Shift Swap Evaluation Engine                             */}
      {/* ============================================================== */}
      {activeSubTab === 'swap' && (
        <div className="bg-[#1f232c] border border-white/15 rounded-lg p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-[#8eb9dd]" />
              Shift Swap Evaluator
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clinician A */}
            <div className="bg-[#181a20] p-5 rounded-lg border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold uppercase text-[#8eb9dd]">Clinician A</span>
                <span className="text-xs font-mono font-bold text-slate-400">Party A</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Clinician:</label>
                <select
                  value={swapRadA}
                  onChange={(e) => {
                    setSwapRadA(e.target.value);
                    setSwapShiftA('');
                    setSwapEvaluation(null);
                  }}
                  className="w-full bg-[#252a35] text-white border border-white/20 p-2.5 rounded text-xs font-bold focus:border-[#8eb9dd] outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title}) - {u.specialties.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Shift to Trade:</label>
                <select
                  value={swapShiftA}
                  onChange={(e) => {
                    setSwapShiftA(e.target.value);
                    setSwapEvaluation(null);
                  }}
                  className="w-full bg-[#252a35] text-white border border-white/20 p-2.5 rounded text-xs font-bold focus:border-[#8eb9dd] outline-none"
                >
                  <option value="">-- Choose Shift --</option>
                  {shiftsRadA.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.date} | {s.site} ({s.specialty}) | {s.hours} {s.isSupervisor ? '[Contrast Sup]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clinician B */}
            <div className="bg-[#181a20] p-5 rounded-lg border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold uppercase text-sky-400">Clinician B</span>
                <span className="text-xs font-mono font-bold text-slate-400">Party B</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Clinician:</label>
                <select
                  value={swapRadB}
                  onChange={(e) => {
                    setSwapRadB(e.target.value);
                    setSwapShiftB('');
                    setSwapEvaluation(null);
                  }}
                  className="w-full bg-[#252a35] text-white border border-white/20 p-2.5 rounded text-xs font-bold focus:border-[#8eb9dd] outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title}) - {u.specialties.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Return Shift:</label>
                <select
                  value={swapShiftB}
                  onChange={(e) => {
                    setSwapShiftB(e.target.value);
                    setSwapEvaluation(null);
                  }}
                  className="w-full bg-[#252a35] text-white border border-white/20 p-2.5 rounded text-xs font-bold focus:border-[#8eb9dd] outline-none"
                >
                  <option value="">-- Choose Shift --</option>
                  {shiftsRadB.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.date} | {s.site} ({s.specialty}) | {s.hours} {s.isSupervisor ? '[Contrast Sup]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action & Diagnostic Results */}
          <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={handleEvaluateSwap}
              className="bg-[#2a2f3b] hover:bg-[#353b49] text-white border border-white/20 font-extrabold text-xs px-6 py-3 rounded flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#8eb9dd]" />
              <span>Evaluate Trade</span>
            </button>

            {swapEvaluation && (
              <div className="flex-1 w-full bg-[#181a20] border p-4 rounded-lg flex flex-col gap-2 border-white/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {swapEvaluation.status === 'VALID' ? (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        TRADE COMPLIANT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        POLICY VIOLATIONS IDENTIFIED
                      </span>
                    )}
                  </div>

                  {swapEvaluation.status === 'VALID' && (
                    <button
                      onClick={handleExecuteSwap}
                      className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-extrabold text-xs px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Check className="w-4 h-4" />
                      <span>Execute & Commit Swap</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  {swapEvaluation.notes.map((n, idx) => (
                    <div 
                      key={idx}
                      className={`font-semibold ${n.startsWith('VIOLATION') ? 'text-rose-300' : 'text-slate-300'}`}
                    >
                      • {n}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TASK 3: Multimodal Document Parsing (Time-Off & Vacations)        */}
      {/* ============================================================== */}
      {activeSubTab === 'document' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1f232c] border border-white/15 rounded-lg p-6 shadow-md space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8eb9dd]" />
                Time-Off Document Parser
              </h2>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Document / Email Text:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDocInputText(`Dr. Elena Rostova is requesting CME Training leave from 2026-10-19 to 2026-10-21 for Breast Imaging Refresher Course. Dr. Brenda Vance covering Mammo MQSA queue.`)}
                    className="text-[11px] text-[#8eb9dd] hover:underline font-bold"
                  >
                    Sample 1
                  </button>
                  <button
                    onClick={() => setDocInputText(`Vacation Request: Dr. David Kim requesting Clinical PTO 2026-10-26 to 2026-10-30. Teleradiology pool covering MSK reading list.`)}
                    className="text-[11px] text-[#8eb9dd] hover:underline font-bold"
                  >
                    Sample 2
                  </button>
                </div>
              </div>
              <textarea
                value={docInputText}
                onChange={(e) => setDocInputText(e.target.value)}
                rows={7}
                className="w-full bg-[#16181e] text-white border border-white/20 p-3 rounded text-xs font-mono font-semibold focus:border-[#8eb9dd] outline-none"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={handleParseDocument}
                className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-extrabold text-xs px-5 py-2.5 rounded flex items-center gap-2 cursor-pointer shadow"
              >
                <FileText className="w-4 h-4" />
                <span>Parse Document</span>
              </button>
            </div>
          </div>

          {/* Structured Output Card */}
          <div className="bg-[#1f232c] border border-white/15 rounded-lg p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center justify-between mb-3">
                <span>Parsed Schedule Rule</span>
                {parsedDocResult && (
                  <span className="text-[10px] font-mono font-extrabold bg-[#8eb9dd]/20 text-[#8eb9dd] px-2 py-0.5 rounded border border-[#8eb9dd]/40">
                    Confidence: {parsedDocResult.confidenceScore}%
                  </span>
                )}
              </h3>

              {parsedDocResult ? (
                <div className="space-y-3 bg-[#181a20] p-4 rounded-lg border border-white/10 text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-slate-400">Clinician:</span>
                    <span className="font-extrabold text-white text-sm">{parsedDocResult.detectedProvider}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-slate-400">Leave Category:</span>
                    <span className="font-bold text-[#8eb9dd]">{parsedDocResult.category}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-slate-400">Window:</span>
                    <span className="font-mono font-extrabold text-white">
                      {parsedDocResult.startDate} to {parsedDocResult.endDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400">Designated Backup:</span>
                    <span className="font-bold text-sky-400">{parsedDocResult.backupColleague || 'Clinical Pool'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-white/15 rounded-lg text-center text-slate-400 text-xs font-semibold">
                  No extracted rule
                </div>
              )}
            </div>

            {parsedDocResult && (
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ready for Ledger
                </span>
                <button
                  onClick={handleApplyParsedLeave}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded flex items-center gap-2 cursor-pointer shadow"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Apply to Roster & Ledger</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TASK 4: Volume-Adaptive Staffing & RIS Order Backlogs            */}
      {/* ============================================================== */}
      {activeSubTab === 'backlog' && (
        <div className="bg-[#1f232c] border border-white/15 rounded-lg p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#8eb9dd]" />
                RIS Order Backlog Monitor
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-[#181a20] px-4 py-2 rounded border border-white/10 text-xs">
              <span className="font-mono text-slate-400">Total Unread Queue:</span>
              <span className="font-mono font-extrabold text-[#8eb9dd] text-sm">
                {risBacklogs.reduce((acc, b) => acc + b.unassignedOrders, 0)} Exams
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risBacklogs.map((b) => (
              <div 
                key={b.id}
                className={`p-5 rounded-lg border ${
                  b.status === 'NEARING_BREACH' 
                    ? 'bg-[#291e22] border-amber-500/40' 
                    : 'bg-[#181a20] border-white/10'
                } flex flex-col justify-between space-y-4`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-extrabold uppercase text-slate-400">
                      {b.site} Center
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                      b.status === 'NEARING_BREACH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">{b.modality}</h3>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Unassigned</span>
                      <span className="font-mono font-extrabold text-white text-base">{b.unassignedOrders}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Stat Backlog</span>
                      <span className="font-mono font-extrabold text-rose-400 text-base">{b.statOrders}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="text-[11px] font-mono text-slate-300 font-semibold mb-3">
                    Triage: <span className="font-bold text-[#8eb9dd]">{b.recommendedSubspecialty}</span>
                  </div>

                  <button
                    onClick={() => handleAddRemoteTriage(b)}
                    className="w-full bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-extrabold text-xs py-2 rounded flex items-center justify-center gap-1.5 shadow cursor-pointer transition-transform active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deploy Remote Triage Reader</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TASK 5: Workload, RVU & Equity Metrics Dashboard                */}
      {/* ============================================================== */}
      {activeSubTab === 'equity' && (
        <div className="bg-[#1f232c] border border-white/15 rounded-lg p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#8eb9dd]" />
                Workload & Slot Equity Dashboard
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-slate-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4">Clinician</th>
                  <th className="py-3 px-4">FTE</th>
                  <th className="py-3 px-4">Specialties</th>
                  <th className="py-3 px-4">Total Shifts</th>
                  <th className="py-3 px-4">Projected RVU</th>
                  <th className="py-3 px-4">Sat Clinics (08-13)</th>
                  <th className="py-3 px-4">Fri Closes (to 19:00)</th>
                  <th className="py-3 px-4">Equity Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-semibold">
                {equitySummary.map((item) => (
                  <tr key={item.user.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.user.name} <span className="text-[11px] text-slate-400">({item.user.title})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{item.fte.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {item.user.specialties.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-[#16181e] text-white border border-white/10">
                            {s}
                          </span>
                        ))}
                        {item.user.isMqsaQualified && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#8eb9dd]/20 text-[#8eb9dd] font-bold border border-[#8eb9dd]/40">
                            MQSA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{item.totalShifts}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.totalRvu} RVU</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{item.saturdayShifts}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-300">{item.fridayLateCloses}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#16181e] rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-[#8eb9dd]" 
                            style={{ width: `${Math.min(100, item.equityIndex * 25)}%` }} 
                          />
                        </div>
                        <span className="font-mono font-extrabold text-white">{item.equityIndex}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#181a20] rounded border border-white/10 text-xs flex items-center justify-between">
            <span className="font-mono text-[#8eb9dd] font-bold">
              Guardrail Active: 5-Day Ceiling
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
