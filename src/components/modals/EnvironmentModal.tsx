import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Laptop, 
  Users, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  Share2,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  ENVIRONMENTS, 
  AI_STUDIO_DEV_URL, 
  AI_STUDIO_SHARED_URL, 
  setSimulatedEnvironment 
} from '../../utils/environment';

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEnv: 'DEV' | 'SHARED';
  onEnvironmentChange?: (env: 'DEV' | 'SHARED') => void;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  isOpen,
  onClose,
  currentEnv,
  onEnvironmentChange
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSelectSimulatedEnv = (env: 'DEV' | 'SHARED') => {
    setSimulatedEnvironment(env);
    if (onEnvironmentChange) onEnvironmentChange(env);
  };

  const invitationMessage = `Hi Clinical Team,\n\nPlease review our updated Radiology Operations & Scheduling Engine on our dedicated Clinical Testing environment:\n${AI_STUDIO_SHARED_URL}\n\nThis instance is isolated for physician workflow testing (shift trades, absence approvals, on-site contrast oversight) without developer interruptions.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] border border-white/20 rounded-xl max-w-4xl w-full p-6 space-y-6 shadow-2xl text-xs text-[#fdfdfd] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40">
                <Share2 className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                AI Studio Dual-Environment Topology
              </h2>
            </div>
            <p className="text-slate-300 text-xs">
              Segregated execution architecture for active engineering vs. clinical stakeholder acceptance testing.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Environment Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Development Environment */}
          <div className={`p-5 rounded-lg border transition-all space-y-3 relative ${
            currentEnv === 'DEV'
              ? 'bg-[#2a384e] border-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-1 ring-[#38bdf8]/50'
              : 'bg-[#2e313a] border-white/15 hover:border-white/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#38bdf8]" />
                <span className="font-mono font-extrabold text-sm text-white">Development App</span>
              </div>
              {currentEnv === 'DEV' && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#38bdf8] text-black">
                  CURRENT HOST
                </span>
              )}
            </div>

            <p className="text-slate-200 leading-relaxed text-[11px]">
              {ENVIRONMENTS.DEV.description}
            </p>

            <div className="p-2.5 rounded bg-[#252833] border border-white/15 space-y-1.5 font-mono text-[11px]">
              <span className="text-[10px] uppercase text-slate-300 block font-bold">Target Audience:</span>
              <span className="text-white block font-semibold">{ENVIRONMENTS.DEV.targetAudience}</span>
            </div>

            {/* URL Display & Actions */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase text-slate-300 font-semibold">Environment URL:</span>
              <div className="p-2 rounded bg-[#252833] border border-white/20 flex items-center justify-between gap-2 font-mono text-[11px] text-[#38bdf8] truncate font-bold">
                <span className="truncate">{AI_STUDIO_DEV_URL}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(AI_STUDIO_DEV_URL, 'dev-url')}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedKey === 'dev-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={AI_STUDIO_DEV_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectSimulatedEnv('DEV')}
              className={`w-full py-1.5 px-3 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                currentEnv === 'DEV'
                  ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/50'
                  : 'bg-[#444957] text-white hover:bg-[#4f5565] border border-white/20'
              }`}
            >
              {currentEnv === 'DEV' ? '✓ Active Engineering Instance' : 'Simulate Development View'}
            </button>
          </div>

          {/* Card 2: Shared Clinical Testing Environment */}
          <div className={`p-5 rounded-lg border transition-all space-y-3 relative ${
            currentEnv === 'SHARED'
              ? 'bg-[#224436] border-[#34d399] shadow-[0_0_20px_rgba(52,211,153,0.25)] ring-1 ring-[#34d399]/50'
              : 'bg-[#2e313a] border-white/15 hover:border-white/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#34d399]" />
                <span className="font-mono font-extrabold text-sm text-white">Shared App (Clinical Testing)</span>
              </div>
              {currentEnv === 'SHARED' && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#34d399] text-black">
                  CURRENT HOST
                </span>
              )}
            </div>

            <p className="text-slate-200 leading-relaxed text-[11px]">
              {ENVIRONMENTS.SHARED.description}
            </p>

            <div className="p-2.5 rounded bg-[#252833] border border-white/15 space-y-1.5 font-mono text-[11px]">
              <span className="text-[10px] uppercase text-slate-300 block font-bold">Target Audience:</span>
              <span className="text-white block font-semibold">{ENVIRONMENTS.SHARED.targetAudience}</span>
            </div>

            {/* URL Display & Actions */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase text-slate-300 font-semibold">Environment URL:</span>
              <div className="p-2 rounded bg-[#252833] border border-white/20 flex items-center justify-between gap-2 font-mono text-[11px] text-[#34d399] truncate font-bold">
                <span className="truncate">{AI_STUDIO_SHARED_URL}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(AI_STUDIO_SHARED_URL, 'shared-url')}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedKey === 'shared-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={AI_STUDIO_SHARED_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(invitationMessage, 'invite-msg')}
                className="flex-1 py-1.5 px-2.5 rounded bg-[#2e5343] hover:bg-[#386552] text-[#34d399] border border-[#34d399]/40 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'invite-msg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'invite-msg' ? 'Copied Invitation!' : 'Copy Team Invite Text'}</span>
              </button>

              <button
                onClick={() => handleSelectSimulatedEnv('SHARED')}
                className={`py-1.5 px-3 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  currentEnv === 'SHARED'
                    ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/50'
                    : 'bg-[#444957] text-white hover:bg-[#4f5565] border border-white/20'
                }`}
              >
                {currentEnv === 'SHARED' ? '✓ Active' : 'Simulate View'}
              </button>
            </div>

          </div>

        </div>

        {/* Clinical Coordinator Guidance Note */}
        <div className="p-4 rounded-lg bg-[#282b35] border border-white/15 space-y-2">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <Info className="w-4 h-4 text-[#a0c9eb]" />
            <span>Operational Workflow Distribution Protocol</span>
          </div>
          <p className="text-slate-200 text-[11px] leading-relaxed">
            By sending the <strong>Shared App URL</strong> to clinical supervisors, they can evaluate schedules, test physician swap agreements, and review on-site contrast supervision alerts. Simultaneously, developers continue prompt modifications in the <strong>Development App</strong> without creating runtime flickers or interrupting clinical user testing.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-white/15">
          <span className="font-mono text-[10px] text-slate-300">
            Active Host: <strong className="text-white">{currentEnv === 'DEV' ? 'Development (ais-dev)' : 'Shared (ais-pre)'}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold font-mono text-xs cursor-pointer transition-colors"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
