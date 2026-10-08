import React from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Syringe, 
  Layers, 
  Monitor, 
  UserX,
  Stethoscope,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import { ScheduleConflict } from '../types';
import { formatDateWithDay } from '../utils/formatters';

interface ConflictDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ScheduleConflict[];
  onResolveConflict: (conflict: ScheduleConflict) => void;
  onJumpToDate: (date: string) => void;
}

export const ConflictDrawer: React.FC<ConflictDrawerProps> = ({
  isOpen,
  onClose,
  conflicts,
  onResolveConflict,
  onJumpToDate
}) => {
  if (!isOpen) return null;

  const criticals = conflicts.filter(c => c.severity === 'CRITICAL');
  const warnings = conflicts.filter(c => c.severity === 'WARNING');

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'OPERATING_HOURS_VIOLATION':
        return <Clock className="w-4 h-4 text-[#ef4444]" />;
      case 'MQSA_MAMMOGRAPHY_VIOLATION':
        return <ShieldAlert className="w-4 h-4 text-[#ef4444]" />;
      case 'FATIGUE_OVERLOAD':
        return <Zap className="w-4 h-4 text-[#f59e0b]" />;
      case 'WORKSTATION_COLLISION':
        return <Monitor className="w-4 h-4 text-[#ef4444]" />;
      case 'MISSING_CONTRAST_SUPERVISOR':
        return <Syringe className="w-4 h-4 text-[#ef4444]" />;
      case 'AP_UNSUPERVISED':
        return <Stethoscope className="w-4 h-4 text-[#ef4444]" />;
      case 'LEAVE_OVERLAP':
        return <UserX className="w-4 h-4 text-[#ef4444]" />;
      case 'SPECIALTY_QUOTA_DEFICIT':
        return <Layers className="w-4 h-4 text-[#f59e0b]" />;
      case 'DOUBLE_BOOKING':
      default:
        return <AlertTriangle className="w-4 h-4 text-[#ef4444]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-[#1f232c] h-full shadow-2xl flex flex-col border-l border-[rgba(255,255,255,0.18)] text-white">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.12)] bg-[#191c23] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_12px_#ef4444] animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight font-brand italic">
                Real-Time Schedule Conflict Engine
              </h2>
              <span className="font-mono text-xs font-bold text-slate-300 block mt-0.5">
                {conflicts.length === 0 
                  ? 'All clinical assignments compliant' 
                  : `${criticals.length} Critical Faults &bull; ${warnings.length} Quota/Fatigue Warnings`}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conflict List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {conflicts.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[rgba(142, 185, 221,0.1)] text-[#8eb9dd] mx-auto flex items-center justify-center border border-[rgba(142, 185, 221,0.3)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#eeedea]">Zero Schedule Faults</h3>
            </div>
          ) : (
            <>
              {criticals.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between meta-mono text-[#ef4444]">
                    <span>Critical Faults ({criticals.length})</span>
                    <span>Immediate Action</span>
                  </div>

                  {criticals.map((c) => (
                    <div 
                      key={c.id}
                      className="p-4 rounded-xs border border-[#7f1d1d] bg-[#271419] space-y-2.5 transition-all shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {getConflictIcon(c.type)}
                          <span className="text-xs font-bold text-[#eeedea]">
                            {c.message}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onJumpToDate(c.date);
                            onClose();
                          }}
                          className="meta-mono text-[#ef4444] hover:underline cursor-pointer shrink-0 font-bold"
                        >
                          {formatDateWithDay(c.date)}
                        </button>
                      </div>

                      <p className="text-xs text-[rgba(238,237,234,0.8)] font-normal leading-relaxed">
                        {c.details}
                      </p>

                      {c.suggestedAction && (
                        <div className="text-[11px] bg-[rgba(0,0,0,0.3)] p-2.5 rounded-xs border border-[rgba(239,68,68,0.2)] text-[rgba(238,237,234,0.8)] space-y-1">
                          <span className="meta-mono text-[#ef4444] block">Recommendation:</span>
                          <p>{c.suggestedAction}</p>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onResolveConflict(c)}
                          className="px-3 py-1.5 rounded-xs bg-[#ef4444] hover:bg-[#dc2626] text-black text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer font-mono"
                        >
                          <span>Resolve Fault</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {warnings.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[rgba(238,237,234,0.1)]">
                  <div className="flex items-center justify-between meta-mono text-[#f59e0b]">
                    <span>Quota Deficits ({warnings.length})</span>
                    <span>Staffing Warning</span>
                  </div>

                  {warnings.map((c) => (
                    <div 
                      key={c.id}
                      className="p-4 rounded-xs border border-[#b45309] bg-[#2a1c0d] space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {getConflictIcon(c.type)}
                          <span className="text-xs font-bold text-[#eeedea]">
                            {c.message}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onJumpToDate(c.date);
                            onClose();
                          }}
                          className="meta-mono text-[#f59e0b] hover:underline cursor-pointer shrink-0 font-bold"
                        >
                          {formatDateWithDay(c.date)}
                        </button>
                      </div>

                      <p className="text-xs text-[rgba(238,237,234,0.8)] leading-relaxed">
                        {c.details}
                      </p>

                      {c.suggestedAction && (
                        <div className="text-[11px] bg-[rgba(0,0,0,0.3)] p-2.5 rounded-xs border border-[rgba(245,158,11,0.2)] text-[rgba(238,237,234,0.8)] space-y-1">
                          <span className="meta-mono text-[#f59e0b] block">Recommendation:</span>
                          <p>{c.suggestedAction}</p>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onResolveConflict(c)}
                          className="px-3 py-1.5 rounded-xs bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer font-mono"
                        >
                          <span>Address Shortfall</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[rgba(238,237,234,0.1)] bg-[#111113] flex items-center justify-between meta-mono">
          <span className="text-[rgba(238,237,234,0.5)]">Continuous evaluation active</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold rounded-xs cursor-pointer transition-colors"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
};
