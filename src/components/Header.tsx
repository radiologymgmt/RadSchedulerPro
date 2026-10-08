import React from 'react';
import { 
  ShieldAlert, 
  Monitor, 
  Smartphone, 
  ChevronDown,
  Sparkles,
  Bot,
  Share2,
  HelpCircle,
  BookOpen,
  ArrowLeftRight,
  Calendar as CalendarIcon,
  Award
} from 'lucide-react';
import { StaffUser, ScheduleConflict } from '../types';

interface HeaderProps {
  activeTab: 'engine' | 'calendar' | 'specialty' | 'analytics' | 'leave' | 'admin';
  setActiveTab: (tab: 'engine' | 'calendar' | 'specialty' | 'analytics' | 'leave' | 'admin') => void;
  currentUser: StaffUser;
  setCurrentUser: (user: StaffUser) => void;
  users: StaffUser[];
  conflicts: ScheduleConflict[];
  onOpenConflicts: () => void;
  onOpenEnvironmentModal?: () => void;
  currentEnv?: 'DEV' | 'SHARED';
  isMobileMode: boolean;
  setIsMobileMode: (val: boolean) => void;
  activeWorkstation: string;
  selectedSitesCount?: number;
  selectedSiteLabel?: string;
  isHoverGuideActive: boolean;
  onToggleHoverGuide: () => void;
  onOpenHelpManual: () => void;
  onOpenShiftSwapModal: () => void;
  onOpenCalendarSyncModal: () => void;
  onOpenCredentialsModal: () => void;
  expiringCredentialsCount?: number;
  openSwapsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  users,
  conflicts,
  onOpenConflicts,
  onOpenEnvironmentModal,
  currentEnv = 'DEV',
  isMobileMode,
  setIsMobileMode,
  activeWorkstation,
  selectedSiteLabel = 'ALL',
  isHoverGuideActive,
  onToggleHoverGuide,
  onOpenHelpManual,
  onOpenShiftSwapModal,
  onOpenCalendarSyncModal,
  onOpenCredentialsModal,
  expiringCredentialsCount = 0,
  openSwapsCount = 0
}) => {
  const criticalCount = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const warningCount = conflicts.filter(c => c.severity === 'WARNING').length;

  return (
    <header 
      style={{ backgroundColor: 'var(--panel)', borderBottom: '2px solid var(--border)' }}
      className="sticky top-0 z-40 bg-[#3d414d] border-b-2 border-[rgba(255,255,255,0.18)] h-16 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-sm"
    >
      
      {/* Brand & Site: Variation 10 Brand Styling */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button 
          onClick={() => setActiveTab('calendar')}
          className="text-left cursor-pointer group bg-transparent border-none p-0 shrink-0"
        >
          <span 
            className="brand font-brand text-lg sm:text-xl font-extrabold uppercase tracking-tight text-[#a0c9eb]"
          >
            RadScheduler Pro
          </span>
        </button>

        {/* Site Scope Telemetry badge - Only rendered if specific sites are selected (ALL removed) */}
        {selectedSiteLabel && selectedSiteLabel !== 'ALL' && (
          <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold text-[#a0c9eb] bg-[#2e313a] px-2 py-0.5 sm:py-1 rounded border border-[rgba(255,255,255,0.18)] truncate max-w-[130px] sm:max-w-none">
            <span className="text-white opacity-80 hidden xs:inline">SITE:</span>
            <span className="text-[#a0c9eb] font-extrabold truncate">{selectedSiteLabel}</span>
          </div>
        )}
      </div>

      {/* Top Telemetry & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        
        {/* Clinician Quick Tools: Shift Swap Marketplace, iCal Feed, Credentials (Desktop) */}
        {!isMobileMode && (
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={onOpenShiftSwapModal}
              className="flex items-center gap-1.5 font-mono text-xs font-bold text-white hover:text-[#a0c9eb] cursor-pointer transition-colors px-2.5 py-1 rounded bg-[#2e313a] border border-[rgba(255,255,255,0.18)] hover:border-[#a0c9eb]"
              title="Clinician-to-Clinician Shift Swap Marketplace"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#a0c9eb]" />
              <span className="hidden lg:inline text-[11px]">Shift Swap</span>
              {openSwapsCount > 0 && (
                <span className="bg-[#a0c9eb] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {openSwapsCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCalendarSyncModal}
              className="flex items-center gap-1.5 font-mono text-xs font-bold text-white hover:text-[#a0c9eb] cursor-pointer transition-colors px-2.5 py-1 rounded bg-[#2e313a] border border-[rgba(255,255,255,0.18)] hover:border-[#a0c9eb]"
              title="Personal iCal / Webcal Subscription Feed"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#a0c9eb]" />
              <span className="hidden xl:inline text-[11px]">iCal Sync</span>
            </button>

            <button
              onClick={onOpenCredentialsModal}
              className={`flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer transition-colors px-2.5 py-1 rounded border ${
                expiringCredentialsCount > 0
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 hover:border-amber-400'
                  : 'bg-[#2e313a] text-white hover:text-[#a0c9eb] border-[rgba(255,255,255,0.18)] hover:border-[#a0c9eb]'
              }`}
              title="Credential & Compliance Expiration Tracking"
            >
              <Award className={`w-3.5 h-3.5 ${expiringCredentialsCount > 0 ? 'text-amber-400' : 'text-[#a0c9eb]'}`} />
              <span className="hidden xl:inline text-[11px]">Credentials</span>
              {expiringCredentialsCount > 0 && (
                <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {expiringCredentialsCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* AI Studio Dual Environment Status Badge (Hidden in Mobile View) */}
        {!isMobileMode && (
          <button
            onClick={onOpenEnvironmentModal}
            className={`hidden 2xl:flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded border transition-all cursor-pointer shadow-xs ${
              currentEnv === 'SHARED'
                ? 'bg-[#142e23] border-[#34d399]/40 text-[#34d399] hover:border-[#34d399]'
                : 'bg-[#2e313a] border-[#a0c9eb]/40 text-[#a0c9eb] hover:border-[#a0c9eb]'
            }`}
            title="AI Studio Dual-Environment Hub: View Dev vs. Shared Testing URLs"
          >
            <span className={`w-2 h-2 rounded-full ${
              currentEnv === 'SHARED' ? 'bg-[#34d399] shadow-[0_0_8px_#34d399]' : 'bg-[#a0c9eb] shadow-[0_0_8px_#a0c9eb]'
            }`} />
            <span className="font-mono font-extrabold uppercase text-[10px]">
              {currentEnv === 'SHARED' ? 'CLINICAL PREVIEW' : 'DEV INSTANCE'}
            </span>
            <Share2 className="w-3 h-3 opacity-80 ml-0.5" />
          </button>
        )}

        {/* Auto-detected Workstation Name (No manual selection, Word "TERMINAL" removed) */}
        {!isMobileMode && (
          <div
            className="hidden lg:flex items-center gap-1.5 font-mono text-xs font-bold text-white px-2.5 py-1 rounded bg-[#2e313a] border border-[rgba(255,255,255,0.18)] select-none"
            title="Auto-detected Client Interpretation Workstation"
          >
            <Monitor className="w-3.5 h-3.5 text-[#a0c9eb]" />
            <strong className="text-[#a0c9eb] font-bold">{activeWorkstation}</strong>
          </div>
        )}

        {/* Conflict Status Tag */}
        <button
          onClick={onOpenConflicts}
          className={`flex items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded border transition-all cursor-pointer ${
            criticalCount > 0 
              ? 'bg-[#3b1820] border-[#ef4444] text-white shadow-[0_0_14px_rgba(239,68,68,0.4)]' 
              : warningCount > 0
                ? 'bg-[#3b2914] border-[#f59e0b] text-white'
                : 'bg-[#2e313a] border-[#a0c9eb]/50 text-white'
          }`}
          title="Click to view real-time compliance conflicts"
        >
          <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
            criticalCount > 0 
              ? 'bg-[#ef4444] shadow-[0_0_10px_#ef4444] animate-pulse' 
              : warningCount > 0 
                ? 'bg-[#f59e0b]' 
                : 'bg-[#a0c9eb]'
          }`} />
          <span className="font-extrabold truncate">
            {criticalCount > 0 
              ? `${criticalCount} CRIT` 
              : warningCount > 0 
                ? `${warningCount} WARN` 
                : 'OK'}
          </span>
        </button>

        {/* Question Mark Function (Desktop View: Interactive Hover Explanations & User Manual) */}
        {!isMobileMode && (
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleHoverGuide}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isHoverGuideActive
                  ? 'bg-[#a0c9eb] text-black border-[#a0c9eb] shadow-[0_0_14px_rgba(160,201,235,0.6)] font-black'
                  : 'bg-[#2e313a] text-white hover:text-[#a0c9eb] border-[rgba(255,255,255,0.18)] hover:border-[#a0c9eb]'
              }`}
              title={isHoverGuideActive ? "Hover Explanation Mode Active (Click to turn off)" : "Turn on Hover Explanations: Hover over any field or area to see how-to guidance"}
            >
              <HelpCircle className="w-4 h-4 text-inherit" />
              <span className="hidden xl:inline text-[11px] uppercase font-bold">
                {isHoverGuideActive ? 'Hover Active' : 'Hover Help (?)'}
              </span>
            </button>

            <button
              onClick={onOpenHelpManual}
              className="p-1.5 rounded border border-[rgba(255,255,255,0.18)] bg-[#2e313a] text-slate-300 hover:text-white hover:border-[#a0c9eb] transition-colors cursor-pointer"
              title="Open Help & User Manual"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#a0c9eb]" />
            </button>
          </div>
        )}

        {/* Mobile Radiologist Companion Toggle (Shows just phone icon) */}
        <button
          onClick={() => setIsMobileMode(!isMobileMode)}
          className={`p-2 rounded border text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
            isMobileMode 
              ? 'bg-[#8eb9dd] text-black border-[#8eb9dd] shadow-sm' 
              : 'bg-[#282d38] text-white border-[rgba(255,255,255,0.16)] hover:border-[#8eb9dd]'
          }`}
          title={isMobileMode ? "Switch to Desktop View" : "Switch to Mobile Radiologist View"}
          aria-label="Toggle Mobile View"
        >
          <Smartphone className="w-4 h-4" />
        </button>

        {/* User Persona Switcher (Hidden in Mobile View) */}
        {!isMobileMode && (
          <div className="relative group hidden sm:block">
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[rgba(255,255,255,0.18)] cursor-pointer">
              <div className="text-right hidden lg:block">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-[10px] font-mono font-bold text-[#8eb9dd] leading-tight flex items-center justify-end gap-1">
                  <span>{currentUser?.role || 'ADMIN'}</span>
                  <span>&bull;</span>
                  <span className="text-slate-300">{currentUser?.title || 'System'}</span>
                </div>
              </div>
              
              <div className="w-8 h-8 rounded bg-[#8eb9dd] text-black flex items-center justify-center font-bold text-xs ring-1 ring-white/20 shadow">
                {(currentUser?.name || 'AD').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) || 'AD'}
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-transform group-hover:rotate-180" />
            </div>

            {/* Persona Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#1f232c] border border-[rgba(255,255,255,0.18)] rounded shadow-2xl p-2 z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-mono font-extrabold uppercase text-slate-300 px-3 py-1.5 border-b border-[rgba(255,255,255,0.1)]">
                Switch User Persona
              </div>
              
              <div className="max-h-64 overflow-y-auto py-1">
                {users.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-400 italic">No users configured. Add staff in Admin Center.</div>
                ) : (
                  users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUser(u)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded flex items-center justify-between cursor-pointer transition-colors ${
                        currentUser?.id === u.id 
                          ? 'bg-[#8eb9dd] text-black font-extrabold' 
                          : 'text-white hover:bg-[#282d38]'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{u.name}</div>
                        <div className={`text-[10px] ${currentUser?.id === u.id ? 'text-black' : 'text-slate-400'}`}>
                          {u.title} &bull; {u.primarySite || 'All Sites'}
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        currentUser?.id === u.id ? 'bg-black text-[#8eb9dd]' : 'bg-[#16181e] text-slate-300'
                      }`}>
                        {u.role === 'CHIEF' ? 'CHIEF' : u.role === 'ATTENDING_RAD' ? 'RAD' : u.role === 'ADVANCED_PRACTITIONER' ? 'AP' : u.role}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>

    </header>
  );
};
