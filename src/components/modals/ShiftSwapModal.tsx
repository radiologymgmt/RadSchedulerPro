import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Plus, 
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Shift, StaffUser, ShiftSwapRequest } from '../../types';
import { formatPersonName } from '../../utils/formatters';

interface ShiftSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StaffUser;
  users: StaffUser[];
  shifts: Shift[];
  swapRequests: ShiftSwapRequest[];
  onPostSwapRequest: (req: Omit<ShiftSwapRequest, 'id' | 'createdAt' | 'status'>) => void;
  onAcceptSwap: (swapId: string, claimingRadId: string, offeredShiftId?: string) => void;
  onCancelSwap: (swapId: string) => void;
}

export const ShiftSwapModal: React.FC<ShiftSwapModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  shifts,
  swapRequests,
  onPostSwapRequest,
  onAcceptSwap,
  onCancelSwap
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'MARKETPLACE' | 'POST_SWAP'>('MARKETPLACE');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [desiredDate, setDesiredDate] = useState<string>('');
  const [targetRadId, setTargetRadId] = useState<string>('');
  const [swapNotes, setSwapNotes] = useState<string>('');

  if (!isOpen) return null;

  // Shifts belonging to currentUser that can be posted for swap
  const myUpcomingShifts = shifts.filter(s => s.radId === currentUser.id);

  const handlePostSwap = (e: React.FormEvent) => {
    e.preventDefault();
    const source = shifts.find(s => s.id === selectedShiftId);
    if (!source) {
      alert('Please select a shift you wish to trade.');
      return;
    }

    onPostSwapRequest({
      sourceShiftId: source.id,
      requestingRadId: currentUser.id,
      targetRadId: targetRadId || undefined,
      date: source.date,
      hours: source.hours,
      modality: source.modality,
      site: source.site,
      desiredTradeDate: desiredDate || undefined,
      notes: swapNotes || undefined
    });

    setSelectedShiftId('');
    setDesiredDate('');
    setTargetRadId('');
    setSwapNotes('');
    setActiveSubTab('MARKETPLACE');
  };

  const openSwaps = swapRequests.filter(s => s.status === 'OPEN');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-2xl overflow-hidden shadow-2xl text-[#fdfdfd]">
        
        {/* Header */}
        <div className="bg-[#2e313a] px-5 py-4 border-b border-white/15 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40 flex items-center justify-center font-bold">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-brand italic text-base text-[#fdfdfd] font-bold">
                Clinician-to-Clinician Shift Swap Marketplace
              </h3>
              <p className="text-[11px] font-mono text-slate-300">
                Peer-to-peer shift trading &bull; Instant schedule reassignment &bull; Executive audit logging
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

        {/* Tab Switcher */}
        <div className="flex border-b border-white/15 px-5 pt-3 bg-[#2e313a] gap-2">
          <button
            onClick={() => setActiveSubTab('MARKETPLACE')}
            className={`pb-2.5 px-3 text-xs font-mono font-bold cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'MARKETPLACE'
                ? 'border-[#a0c9eb] text-[#a0c9eb]'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <span>Open Market Trades</span>
            <span className="bg-[#a0c9eb]/25 text-[#a0c9eb] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {openSwaps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('POST_SWAP')}
            className={`pb-2.5 px-3 text-xs font-mono font-bold cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'POST_SWAP'
                ? 'border-[#a0c9eb] text-[#a0c9eb]'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post a Shift for Trade</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {activeSubTab === 'MARKETPLACE' ? (
            <div className="space-y-3">
              {openSwaps.length === 0 ? (
                <div className="p-8 text-center text-slate-200 meta-mono text-xs border border-white/15 rounded-xs bg-[#2e313a]">
                  No open shift swap requests currently on the board.
                  <div className="mt-2">
                    <button
                      onClick={() => setActiveSubTab('POST_SWAP')}
                      className="text-[#a0c9eb] hover:underline font-bold"
                    >
                      Post the first shift swap offer &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                openSwaps.map(req => {
                  const requestingUser = users.find(u => u.id === req.requestingRadId);
                  const isMine = req.requestingRadId === currentUser.id;

                  return (
                    <div 
                      key={req.id} 
                      className="bg-[#2e313a] p-4 rounded-xs border border-white/15 hover:border-white/30 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {requestingUser ? formatPersonName(requestingUser.name, requestingUser.role) : 'Clinician'}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/30 font-bold">
                              {req.modality}
                            </span>
                            {isMine && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-600/50">
                                My Request
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                            {req.notes || 'Looking to swap this shift with a colleague.'}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-600/40 px-2 py-0.5 rounded font-bold">
                            Open for Claim
                          </span>
                        </div>
                      </div>

                      {/* Shift Details Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-[#252833] p-2.5 rounded-xs border border-white/10 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px]">Shift Date:</span>
                          <span className="text-slate-100 font-bold">{req.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">Working Hours:</span>
                          <span className="text-[#a0c9eb] font-bold">{req.hours}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">Facility Site:</span>
                          <span className="text-slate-100 font-bold">{req.site}</span>
                        </div>
                      </div>

                      {req.desiredTradeDate && (
                        <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Preferred Trade Target Date: <strong>{req.desiredTradeDate}</strong></span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                        {isMine ? (
                          <button
                            onClick={() => onCancelSwap(req.id)}
                            className="text-xs font-mono text-rose-300 hover:text-rose-200 flex items-center gap-1 p-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Cancel My Offer</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onAcceptSwap(req.id, currentUser.id)}
                            className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold font-mono text-xs px-3.5 py-1.5 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Claim / Swap Shift</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form onSubmit={handlePostSwap} className="space-y-4 text-xs">
              <div>
                <label className="block meta-mono text-slate-200 mb-1 font-semibold">
                  Select Which of Your Shifts to Trade:
                </label>
                {myUpcomingShifts.length === 0 ? (
                  <p className="p-3 bg-[#252833] border border-amber-600/40 rounded text-amber-300 font-mono text-xs">
                    You have no scheduled shifts on the current calendar.
                  </p>
                ) : (
                  <select
                    value={selectedShiftId}
                    onChange={(e) => setSelectedShiftId(e.target.value)}
                    required
                    className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 font-mono text-white text-xs font-bold outline-none focus:border-[#a0c9eb]"
                  >
                    <option value="" className="bg-[#2e313a] text-white">-- Choose your shift to trade --</option>
                    {myUpcomingShifts.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#2e313a] text-white">
                        {s.date} &bull; {s.modality} ({s.hours}) @ {s.site}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block meta-mono text-slate-200 mb-1 font-semibold">
                    Preferred Trade Date (Optional):
                  </label>
                  <input
                    type="date"
                    value={desiredDate}
                    onChange={(e) => setDesiredDate(e.target.value)}
                    className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2 text-white font-mono text-xs focus:border-[#a0c9eb] outline-none"
                  />
                </div>

                <div>
                  <label className="block meta-mono text-slate-200 mb-1 font-semibold">
                    Direct Colleague Proposal (Optional):
                  </label>
                  <select
                    value={targetRadId}
                    onChange={(e) => setTargetRadId(e.target.value)}
                    className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2 text-white text-xs focus:border-[#a0c9eb] outline-none"
                  >
                    <option value="" className="bg-[#2e313a] text-white">Open to Entire Radiologist Pool</option>
                    {users.filter(u => u.id !== currentUser.id && !u.isArchived).map(u => (
                      <option key={u.id} value={u.id} className="bg-[#2e313a] text-white">
                        {formatPersonName(u.name, u.role, u.title)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block meta-mono text-slate-200 mb-1 font-semibold">
                  Trade Notes / Explanation:
                </label>
                <textarea
                  value={swapNotes}
                  onChange={(e) => setSwapNotes(e.target.value)}
                  placeholder="e.g. Willing to take any upcoming weekend or evening swing in exchange."
                  className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2.5 text-xs text-white h-20 outline-none focus:border-[#a0c9eb] placeholder-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('MARKETPLACE')}
                  className="px-4 py-2 rounded-xs border border-white/20 text-slate-300 hover:text-white font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedShiftId}
                  className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold font-mono text-xs px-4 py-2 rounded-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Publish to Swap Board
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
