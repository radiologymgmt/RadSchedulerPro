import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  Radio, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Shift, StaffUser, LeaveRequest, ClinicalSite } from '../../types';
import { formatPersonName } from '../../utils/formatters';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StaffUser;
  users: StaffUser[];
  shifts: Shift[];
  leaves: LeaveRequest[];
  sites: Record<string, ClinicalSite>;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  shifts,
  leaves,
  sites
}) => {
  const [selectedRadId, setSelectedRadId] = useState<string>(currentUser.id);
  const [copied, setCopied] = useState(false);

  const selectedUser = users.find(u => u.id === selectedRadId) || currentUser;
  const userShifts = useMemo(() => shifts.filter(s => s.radId === selectedRadId), [shifts, selectedRadId]);
  const userLeaves = useMemo(() => leaves.filter(l => l.radId === selectedRadId && l.status === 'Approved'), [leaves, selectedRadId]);

  if (!isOpen) return null;

  // Generate RFC 5545 valid .ics VCALENDAR payload
  const generateIcsContent = () => {
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RadScheduler Pro//Clinical Interpreter Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:RadScheduler - ${selectedUser.name}`
    ];

    // Shifts
    userShifts.forEach(s => {
      const siteObj = sites[s.site];
      const siteLabel = siteObj?.name || s.site;
      const cleanDate = s.date.replace(/-/g, '');
      const times = s.hours.split('-').map(t => t.trim().replace(':', ''));
      const startT = times[0] || '0800';
      const endT = times[1] || '1700';

      ics.push('BEGIN:VEVENT');
      ics.push(`UID:rad-shift-${s.id}@radscheduler.org`);
      ics.push(`DTSTAMP:${cleanDate}T000000Z`);
      ics.push(`DTSTART:${cleanDate}T${startT}00`);
      ics.push(`DTEND:${cleanDate}T${endT}00`);
      ics.push(`SUMMARY:${s.modality} Shift - ${siteObj?.label || s.site}`);
      ics.push(`LOCATION:${siteLabel}`);
      ics.push(`DESCRIPTION:Clinical reading duty: ${s.modality}\\nHours: ${s.hours}\\nWorkstation: ${s.workstationId || 'Pod 1'}${s.isSupervisor ? '\\nRole: ON-SITE CONTRAST SUPERVISOR' : ''}`);
      ics.push('STATUS:CONFIRMED');
      ics.push('END:VEVENT');
    });

    // Leaves
    userLeaves.forEach(l => {
      const startClean = l.startDate.replace(/-/g, '');
      const endClean = l.endDate.replace(/-/g, '');
      ics.push('BEGIN:VEVENT');
      ics.push(`UID:rad-leave-${l.id}@radscheduler.org`);
      ics.push(`DTSTAMP:${startClean}T000000Z`);
      ics.push(`DTSTART;VALUE=DATE:${startClean}`);
      ics.push(`DTEND;VALUE=DATE:${endClean}`);
      ics.push(`SUMMARY:OFF - ${l.category}`);
      ics.push(`DESCRIPTION:Approved clinical leave: ${l.category}\\nDuration: ${l.dayCount || 1} day(s)\\nNotes: ${l.notes || 'None'}`);
      ics.push('STATUS:CONFIRMED');
      ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');
    return ics.join('\r\n');
  };

  const handleDownloadIcs = () => {
    const content = generateIcsContent();
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radscheduler_${selectedUser.name.toLowerCase().replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const webcalUrl = `webcal://radscheduler.hospital.org/api/v1/feed/${selectedRadId}.ics?token=rad_auth_${selectedRadId.toLowerCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webcalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-lg overflow-hidden shadow-2xl text-[#fdfdfd]">
        
        {/* Header */}
        <div className="bg-[#2e313a] px-5 py-4 border-b border-white/15 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-brand italic text-base text-[#fdfdfd] font-bold">
                Personal iCal / Webcal Subscription Feed
              </h3>
              <p className="text-[11px] font-mono text-slate-300">
                Sync shifts, contrast supervisor duties, and approved PTO to your smartphone
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

        <div className="p-5 space-y-4 text-xs">
          
          {/* Clinician Selector */}
          <div>
            <label className="block meta-mono text-slate-200 mb-1 font-semibold">
              Select Physician / Clinician Schedule:
            </label>
            <select
              value={selectedRadId}
              onChange={(e) => setSelectedRadId(e.target.value)}
              className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2 text-white font-bold focus:border-[#a0c9eb] outline-none"
            >
              {users.filter(u => !u.isArchived).map(u => (
                <option key={u.id} value={u.id} className="bg-[#2e313a] text-white">
                  {formatPersonName(u.name, u.role, u.title)}
                </option>
              ))}
            </select>
          </div>

          {/* Sync Stats */}
          <div className="grid grid-cols-2 gap-2 bg-[#2e313a] p-3 rounded-xs border border-white/15 text-center font-mono">
            <div>
              <span className="text-slate-300 text-[10px] block font-semibold uppercase tracking-wider">Upcoming Interpreting Shifts</span>
              <span className="text-lg font-bold text-[#a0c9eb]">{userShifts.length}</span>
            </div>
            <div>
              <span className="text-slate-300 text-[10px] block font-semibold uppercase tracking-wider">Approved Leave Days</span>
              <span className="text-lg font-bold text-emerald-300">{userLeaves.length}</span>
            </div>
          </div>

          {/* 1-Click Actions */}
          <div className="space-y-2">
            <label className="block meta-mono text-slate-200 font-semibold">
              Direct Calendar Subscription URL (Auto-Syncing):
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={webcalUrl}
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs px-3 py-2 text-[11px] font-mono text-slate-100 select-all font-medium"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold font-mono px-3.5 py-2 rounded-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              Paste this link into Apple Calendar, Google Calendar, or Microsoft Outlook as an external subscription.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full bg-[#444957] hover:bg-[#4f5565] border border-white/25 text-white font-mono text-xs py-2.5 px-3 rounded-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs font-semibold"
            >
              <Download className="w-4 h-4 text-[#a0c9eb]" />
              <span>Download Static .ICS Calendar File</span>
            </button>
          </div>

          {/* Device Setup Guides */}
          <div className="bg-[#2e313a] p-3.5 rounded-xs border border-white/15 space-y-2 text-[11px]">
            <div className="font-bold text-[#a0c9eb] flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Smartphone Subscription Guide</span>
            </div>
            <ul className="text-slate-200 space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
              <li><strong className="text-white">iPhone / iPad:</strong> Open Settings &rarr; Calendar &rarr; Accounts &rarr; Add Account &rarr; Other &rarr; Add Subscribed Calendar. Paste the Webcal URL.</li>
              <li><strong className="text-white">Google Calendar:</strong> Open web Google Calendar &rarr; Other calendars (+) &rarr; From URL. Paste the link.</li>
              <li><strong className="text-white">Outlook:</strong> Add calendar &rarr; Subscribe from web. Paste URL.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2 border-t border-white/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xs bg-[#444957] text-white hover:bg-[#4f5565] font-mono text-xs cursor-pointer font-semibold transition-colors"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
