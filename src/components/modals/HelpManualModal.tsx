import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  Calendar, 
  ArrowLeftRight, 
  CalendarX2, 
  Smartphone, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  Syringe,
  Monitor,
  MousePointer
} from 'lucide-react';

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateHoverGuide?: () => void;
}

export const HelpManualModal: React.FC<HelpManualModalProps> = ({
  isOpen,
  onClose,
  onActivateHoverGuide
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('START');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const SECTIONS = [
    {
      id: 'START',
      title: '1. Getting Started & Navigation',
      icon: BookOpen,
      content: (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#8eb9dd]">System Overview & Core Modes</h4>
          <p className="text-slate-300 leading-relaxed">
            <strong>RadScheduler Pro</strong> is a specialized clinical interpretation and scheduling platform built specifically for high-volume radiology practices, outpatient imaging centers, and hospital departments.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
            <div className="p-3 bg-black/40 rounded border border-white/10">
              <strong className="text-white block mb-1">Desktop Grid View:</strong>
              <p className="text-slate-400 text-[11px]">
                Comprehensive clinical board displaying reading room shifts by facility, modality, hours, and interpretation volume.
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded border border-white/10">
              <strong className="text-white block mb-1">Mobile Companion:</strong>
              <p className="text-slate-400 text-[11px]">
                Streamlined personal dashboard for physicians on their phone showing daily assignments, contrast duties, and department contact extensions.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Tip: Click the phone icon in the top header anytime to preview the Mobile Radiologist View.
          </p>
        </div>
      )
    },
    {
      id: 'SWAP',
      title: '2. Shift Swap Marketplace',
      icon: ArrowLeftRight,
      content: (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#8eb9dd]">Peer-to-Peer Clinician Shift Trading</h4>
          <p className="text-slate-300 leading-relaxed">
            Need coverage for an upcoming weekend or conference? Radiologists can post their scheduled interpreting shifts to the marketplace without needing administrator intervention.
          </p>
          <div className="space-y-2 text-xs text-slate-300 bg-black/40 p-3 rounded border border-white/10">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8eb9dd]/20 text-[#8eb9dd] flex items-center justify-center font-mono font-bold shrink-0">1</span>
              <div>
                <strong>Post an Offer:</strong> Open the Shift Swap modal from the top menu or schedule board. Select which shift you want to trade and optionally suggest a preferred trade date.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8eb9dd]/20 text-[#8eb9dd] flex items-center justify-center font-mono font-bold shrink-0">2</span>
              <div>
                <strong>Browse & Claim:</strong> Colleagues can view open market requests and click <em>"Claim / Swap Shift"</em> to accept.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8eb9dd]/20 text-[#8eb9dd] flex items-center justify-center font-mono font-bold shrink-0">3</span>
              <div>
                <strong>Automatic Reassignment:</strong> The schedule automatically transfers the shift, updates both rosters, checks compliance rules, and logs an executive audit entry.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'PTO',
      title: '3. PTO, Leave & CME Days',
      icon: CalendarX2,
      content: (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#8eb9dd]">Day-Based Paid Time Off Governance</h4>
          <p className="text-slate-300 leading-relaxed">
            All clinical time off is tracked strictly in <strong>days</strong> (0.5d half-days or 1.0d full days), reflecting clinical physician scheduling conventions.
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <li><strong>Half-Day AM / PM:</strong> Request 0.5 days off for morning or afternoon interpreter duties while interpreting during the opposite shift.</li>
            <li><strong>Consecutive Multi-Day:</strong> Multi-day requests count all continuous calendar days in the block.</li>
            <li><strong>Balance Limit Alert:</strong> The system automatically warns if a request exceeds your available annual allocation and flags the deficit for Chief approval.</li>
            <li><strong>Manager Email Dispatch:</strong> Every submission is automatically routed via notification email to the designated practice administrator.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'SYNC',
      title: '4. Phone Calendar Sync (iCal/Webcal)',
      icon: Calendar,
      content: (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#8eb9dd]">Live Subscription to Apple, Google & Outlook</h4>
          <p className="text-slate-300 leading-relaxed">
            Never miss a reading room assignment or on-site supervisor duty. Each clinician has a personal Webcal subscription feed that updates your phone's native calendar in real-time.
          </p>
          <div className="bg-[#282b35] p-3.5 rounded border border-white/15 space-y-2 text-xs">
            <strong className="text-white block font-mono text-[11px]">How to Subscribe:</strong>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              Open the <strong>Calendar Sync</strong> modal, select your profile, and click <strong>Copy Link</strong>. On an iPhone, go to <em>Settings &rarr; Calendar &rarr; Accounts &rarr; Add Subscribed Calendar</em> and paste the link.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'SUPERVISION',
      title: '5. IV Contrast Supervision & ACR Rules',
      icon: Syringe,
      content: (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#a0c9eb]">ACR Contrast Safety Mandates</h4>
          <p className="text-slate-200 leading-relaxed">
            Every clinical site administering intravenous iodinated or gadolinium-based contrast requires a designated on-site contrast supervisor certified in anaphylactoid resuscitation.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Shifts with supervisor designation display a distinctive green <span className="text-emerald-300 font-bold font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-600/50">SUP</span> badge. The schedule engine detects whenever a facility is open without a supervisor and flags an immediate Critical Conflict.
          </p>
        </div>
      )
    },
    {
      id: 'INSPECT',
      title: '6. Interactive Hover Guide Mode',
      icon: MousePointer,
      content: (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#a0c9eb]">Live Field & Control Explanations</h4>
          <p className="text-slate-200 leading-relaxed">
            Toggle the <strong>Question Mark (?)</strong> button in the top header anytime to turn on <em>Interactive Inspection Guide Mode</em>.
          </p>
          <p className="text-xs text-slate-200 leading-relaxed">
            While active, hovering over buttons, facility filters, quota badges, or shift cells will display an instant floating explanation detailing what the control does and clinical recommendations.
          </p>
          {onActivateHoverGuide && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onActivateHoverGuide();
                  onClose();
                }}
                className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold font-mono text-xs px-4 py-2 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>Turn On Live Hover Guide Now</span>
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  const activeContent = SECTIONS.find(s => s.id === selectedSection)?.content;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-3xl overflow-hidden shadow-2xl text-[#fdfdfd] flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#2e313a] px-5 py-4 border-b border-white/15 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-brand italic text-base text-[#fdfdfd] font-bold">
                RadScheduler Pro &bull; Clinician User Guide & Help Manual
              </h3>
              <p className="text-[11px] font-mono text-slate-300">
                Operating handbook for radiologists, advanced practitioners, fellows, and staff
              </p>
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

        {/* 2-Pane Guide Layout */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          
          {/* Navigation Sidebar */}
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-white/15 bg-[#2e313a] p-3 space-y-1 overflow-y-auto shrink-0">
            <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider px-2 py-1 font-bold">
              Table of Contents
            </div>
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const isActive = selectedSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSection(s.id)}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#a0c9eb] text-[#111] font-bold shadow-xs'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#363a46]">
            {activeContent}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#2e313a] border-t border-white/15 flex items-center justify-between text-xs font-mono shrink-0">
          <span className="text-slate-300 text-[11px] font-medium">
            RadScheduler Pro Version 3.8 &bull; Enterprise Diagnostic Radiology Suite
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xs bg-[#444957] text-white hover:bg-[#4f5565] font-semibold cursor-pointer transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
