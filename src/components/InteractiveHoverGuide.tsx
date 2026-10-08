import React, { useEffect, useState } from 'react';
import { HelpCircle, BookOpen, X, MousePointer, Info, Lightbulb } from 'lucide-react';

interface InteractiveHoverGuideProps {
  isActive: boolean;
  onClose: () => void;
  onOpenManual: () => void;
}

interface HoverTip {
  title: string;
  category: string;
  explanation: string;
  shortcut?: string;
}

export const InteractiveHoverGuide: React.FC<InteractiveHoverGuideProps> = ({
  isActive,
  onClose,
  onOpenManual
}) => {
  const [hoverTip, setHoverTip] = useState<HoverTip | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) {
      setHoverTip(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleMouseMove = (e: MouseEvent) => {
      // Find element or closest marked element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Keep tooltip within visible viewport bounds
      const x = Math.min(e.clientX + 16, window.innerWidth - 320);
      const y = Math.min(e.clientY + 16, window.innerHeight - 160);
      setTooltipPos({ x, y });

      // Determine explanation based on target element context
      const closestButton = target.closest('button');
      const text = target.innerText?.toLowerCase() || '';
      const closestShift = target.closest('[data-shift-id]') || target.closest('.rounded-lg') || target.closest('[draggable]');
      const closestHeader = target.closest('header');
      const closestSidebar = target.closest('aside');
      const closestTable = target.closest('table');

      if (closestShift && (text.includes('mri') || text.includes('ct') || text.includes('us') || text.includes('rad') || text.includes('sup') || text.includes('hrs') || text.includes('shift'))) {
        setHoverTip({
          title: 'Reading Room Interpreting Shift',
          category: 'CLINICAL ASSIGNMENT',
          explanation: 'Assigned physician interpreting shift. Displays subspecialty modality, hours, workstation, and estimated RVUs. Drag and drop onto another day to reschedule, or click to edit/reassign.',
          shortcut: 'Tip: Click Shift Swap in header to trade with a colleague.'
        });
      } else if (closestButton && (text.includes('swap') || text.includes('trade'))) {
        setHoverTip({
          title: 'Shift Swap Marketplace',
          category: 'PEER-TO-PEER TRADING',
          explanation: 'Open marketplace where clinicians offer and claim coverage for weekends, call duties, or conferences without needing managerial intervention.',
          shortcut: 'Automatic compliance & roster update upon claim.'
        });
      } else if (closestButton && (text.includes('ical') || text.includes('sync'))) {
        setHoverTip({
          title: 'Personal iCal / Webcal Subscription Feed',
          category: 'CALENDAR SYNC',
          explanation: 'Live RFC-5545 calendar feed. Subscribes your personal iPhone, Google Calendar, or Outlook to interpreting shifts and approved leaves with real-time updates.',
          shortcut: 'Click to copy your personal webcal:// subscription URL.'
        });
      } else if (closestButton && text.includes('credential')) {
        setHoverTip({
          title: 'Credential & Compliance Monitor',
          category: 'PRACTICE GOVERNANCE',
          explanation: 'Tracks state medical licenses, ACR contrast supervision certifications, and MQSA biennial mammography case thresholds (960 minimum required).',
          shortcut: 'Alerts trigger at 60 days before expiration.'
        });
      } else if (closestHeader && (text.includes('ws-') || text.includes('workstation'))) {
        setHoverTip({
          title: 'Interpretation Workstation',
          category: 'CLIENT TELEMETRY',
          explanation: 'Auto-detected diagnostic PACS workstation identifier tied to your current physical reading room terminal.',
          shortcut: 'Automatically assigned based on reading room location.'
        });
      } else if (closestSidebar && (text.includes('site') || text.includes('facility') || text.includes('main') || text.includes('east') || text.includes('west'))) {
        setHoverTip({
          title: 'Clinical Facility Scoping Filter',
          category: 'OUTPATIENT FILTER',
          explanation: 'Filters reading assignments and supervisor rosters across inpatient and satellite outpatient imaging centers.',
          shortcut: 'Click individual sites to isolate or multi-select.'
        });
      } else if (closestSidebar && (text.includes('specialty') || text.includes('body') || text.includes('neuro') || text.includes('msk') || text.includes('breast'))) {
        setHoverTip({
          title: 'Clinical Subspecialty Filter',
          category: 'RAD SPECIALTY',
          explanation: 'Filters interpretations by subspecialty category. Ensures high-complexity cases route only to credentialed fellowship-trained interpreters.',
          shortcut: 'Select a specialty to audit matching quota coverage.'
        });
      } else if (text.includes('leave') || text.includes('pto') || text.includes('cme') || text.includes('vacation')) {
        setHoverTip({
          title: 'Physician Leave & PTO Portal',
          category: 'TIME OFF GOVERNANCE',
          explanation: 'Day-based PTO and CME tracking. Allows half-day (0.5d) or multi-day requests with auto-deduction from annual allocations upon approval.',
          shortcut: 'Submissions notify practice administrators via email.'
        });
      } else if (text.includes('conflict') || text.includes('crit') || text.includes('warn') || text.includes('ok')) {
        setHoverTip({
          title: 'Real-Time Compliance Guardrail',
          category: 'PATIENT SAFETY & ACCREDITATION',
          explanation: 'Instant audit engine detecting missing on-site contrast supervisors, uncredentialed readers, fatigue violations (>5 consecutive days), and coverage gaps.',
          shortcut: 'Click the badge to inspect and resolve active conflicts.'
        });
      } else if (closestTable) {
        setHoverTip({
          title: 'Operational Schedule Matrix',
          category: 'READING ROOM ROSTER',
          explanation: 'Tabular view of all staffed worklists, physician coverage, hours, and supervisory status for the selected date window.',
          shortcut: 'Click any row or header to inspect details.'
        });
      } else if (closestHeader && (text.includes('rad') || text.includes('dr.') || text.includes('persona'))) {
        setHoverTip({
          title: 'Clinician Persona Selector',
          category: 'USER AUTHENTICATION',
          explanation: 'Switch current user perspective between Department Chief, Attending Radiologists, and Advanced Practitioners to test role-based access control and personal views.',
          shortcut: 'Click to select from current staff roster.'
        });
      } else {
        setHoverTip({
          title: 'Interactive Field Guide',
          category: 'HOVER EXPLANATIONS',
          explanation: 'Move your mouse over buttons, schedule shifts, facility filters, supervisor badges, or table headers to see specific operational how-to guidance.',
          shortcut: 'Press ESC or click Guide Active in header to exit.'
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onClose]);

  if (!isActive) return null;

  return (
    <>
      {/* Floating Active Banner at Bottom of Screen */}
      <aside 
        aria-label="Interactive Field Guide Status Banner"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#1f232c]/95 border-2 border-amber-400 text-white px-4 py-2.5 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-3 sm:gap-4 max-w-[95vw] sm:max-w-2xl animate-in slide-in-from-bottom-4"
      >
        <div className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 animate-pulse">
          <HelpCircle className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-amber-400 uppercase tracking-wider">
              Question Mark Mode Active
            </span>
            <span className="hidden sm:inline text-[10px] bg-amber-400/20 text-amber-300 font-mono px-1.5 py-0.2 rounded font-bold">
              Hover to Inspect
            </span>
          </div>
          <p className="text-xs text-slate-200 truncate">
            Hover over any field, button, or schedule box for explanations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenManual}
            className="px-2.5 py-1 bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-mono font-bold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Manual</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Exit Hover Guide (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Exit</span>
          </button>
        </div>
      </aside>

      {/* Floating Dynamic Tooltip Card near cursor */}
      {hoverTip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            pointerEvents: 'none',
            zIndex: 60
          }}
          className="w-72 bg-[#12141a]/95 text-white border border-amber-400/70 p-3 rounded-lg shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-white/10">
            <span className="text-[9px] font-mono font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400 inline" />
              {hoverTip.category}
            </span>
          </div>
          <div className="text-xs font-bold text-white mb-1">
            {hoverTip.title}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-1.5">
            {hoverTip.explanation}
          </p>
          {hoverTip.shortcut && (
            <div className="text-[10px] font-mono text-[#8eb9dd] font-semibold bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
              {hoverTip.shortcut}
            </div>
          )}
        </div>
      )}
    </>
  );
};
