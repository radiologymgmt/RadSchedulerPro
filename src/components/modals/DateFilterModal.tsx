import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseISODate } from '../../utils/formatters';

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: Set<string>;
  onApplyDates: (dates: Set<string>) => void;
  onResetDates: () => void;
  initialYear?: number;
  initialMonth?: number; // 0-indexed
}

export const DateFilterModal: React.FC<DateFilterModalProps> = ({
  isOpen,
  onClose,
  selectedDates,
  onApplyDates,
  onResetDates,
  initialYear = 2026,
  initialMonth = 9 // October
}) => {
  const [year, setYear] = useState<number>(initialYear);
  const [month, setMonth] = useState<number>(initialMonth);
  const [tempDates, setTempDates] = useState<Set<string>>(new Set(selectedDates));

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const toggleDate = (dateStr: string) => {
    const next = new Set(tempDates);
    if (next.has(dateStr)) next.delete(dateStr);
    else next.add(dateStr);
    setTempDates(next);
  };

  const selectWeekdays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const next = new Set(tempDates);
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dow = parseISODate(dStr).getDay();
      if (dow >= 1 && dow <= 5) next.add(dStr);
    }
    setTempDates(next);
  };

  const firstDayIdx = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-sm overflow-hidden shadow-2xl text-[#fdfdfd]">
        
        <div className="bg-[#2e313a] px-4 py-3 border-b border-white/15 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#a0c9eb]" />
            <h3 className="meta-mono text-xs font-bold text-[#fdfdfd]">
              Select Multi-Calendar Dates
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-300 hover:text-white cursor-pointer p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          
          {/* Month Navigation & Presets */}
          <div className="flex justify-between items-center pb-2 border-b border-white/15">
            <div className="flex items-center gap-1.5">
              <button 
                type="button" 
                onClick={handlePrevMonth}
                className="p-1 rounded-xs bg-[#444957] hover:bg-[#4f5565] text-white cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="meta-mono text-xs font-bold text-[#a0c9eb] min-w-[120px] text-center">
                {monthNames[month]} {year}
              </span>
              <button 
                type="button" 
                onClick={handleNextMonth}
                className="p-1 rounded-xs bg-[#444957] hover:bg-[#4f5565] text-white cursor-pointer transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button 
                type="button" 
                onClick={selectWeekdays}
                className="meta-mono text-[9px] bg-[#a0c9eb]/20 border border-[#a0c9eb]/40 text-[#a0c9eb] px-1.5 py-0.5 rounded-xs cursor-pointer font-bold hover:bg-[#a0c9eb]/30 transition-colors"
              >
                Weekdays
              </button>
              <button 
                type="button" 
                onClick={() => setTempDates(new Set())}
                className="meta-mono text-[9px] bg-[#444957] text-slate-200 hover:text-white px-1.5 py-0.5 rounded-xs cursor-pointer transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center meta-mono text-[9px] text-slate-300 font-bold uppercase">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayIdx }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = tempDates.has(dStr);
              const isWeekend = parseISODate(dStr).getDay() === 0 || parseISODate(dStr).getDay() === 6;

              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => toggleDate(dStr)}
                  className={`h-7 rounded-xs text-xs font-mono transition-all flex items-center justify-center border cursor-pointer ${
                    isSelected 
                      ? 'bg-[#a0c9eb] text-[#111] border-[#a0c9eb] font-bold shadow-xs' 
                      : isWeekend 
                        ? 'bg-[#282b35] text-slate-400 border-white/10 hover:border-white/20' 
                        : 'bg-[#2e313a] text-slate-100 border-white/15 hover:border-[#a0c9eb]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/15 meta-mono">
            <span className="text-slate-300 text-xs">
              Active: <strong className="text-[#a0c9eb]">{tempDates.size === 0 ? 'All Month' : `${tempDates.size} date(s)`}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetDates();
                  onClose();
                }}
                className="px-2 py-1 text-[11px] text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyDates(tempDates);
                  onClose();
                }}
                className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold text-[11px] py-1 px-3 rounded-xs shadow-xs cursor-pointer transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
