import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Grid3X3, 
  Layers, 
  BarChart3, 
  CalendarX2, 
  ShieldCheck,
  Search,
  Syringe,
  Copy,
  FileSpreadsheet
} from 'lucide-react';
import { Specialty, ClinicalSite, UserRole, ClinicalSpecialty } from '../types';

interface SidebarProps {
  activeTab: 'engine' | 'calendar' | 'specialty' | 'analytics' | 'leave' | 'admin';
  setActiveTab: (tab: 'engine' | 'calendar' | 'specialty' | 'analytics' | 'leave' | 'admin') => void;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  setActiveDate: (date: string) => void;
  selectedDates: Set<string>;
  onOpenDateFilterModal: () => void;
  onResetDateFilter: () => void;
  sites: Record<string, ClinicalSite>;
  selectedSites: Set<string>;
  setSelectedSites: React.Dispatch<React.SetStateAction<Set<string>>>;
  activeSpecialty?: Specialty | 'ALL';
  setActiveSpecialty?: (spec: Specialty | 'ALL') => void;
  selectedSpecialties?: Set<string>;
  setSelectedSpecialties?: React.Dispatch<React.SetStateAction<Set<string>>>;
  specialtiesList?: ClinicalSpecialty[];
  selectedRoleFilter: UserRole | 'ALL';
  setSelectedRoleFilter: (role: UserRole | 'ALL') => void;
  onOpenShiftModal: () => void;
  onOpenContrastModal: () => void;
  onOpenCopyModal: () => void;
  onExportCsv: () => void;
  displayMode: 'GRID' | 'SLOTS' | 'MOBILE';
  setDisplayMode: (mode: 'GRID' | 'SLOTS' | 'MOBILE') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdmin: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeMonth,
  setActiveMonth,
  setActiveDate,
  selectedDates,
  onOpenDateFilterModal,
  onResetDateFilter,
  sites,
  selectedSites,
  setSelectedSites,
  activeSpecialty = 'ALL',
  setActiveSpecialty,
  selectedSpecialties = new Set(),
  setSelectedSpecialties,
  specialtiesList = [],
  selectedRoleFilter,
  setSelectedRoleFilter,
  onOpenShiftModal,
  onOpenContrastModal,
  onOpenCopyModal,
  onExportCsv,
  displayMode,
  setDisplayMode,
  searchQuery,
  setSearchQuery,
  isAdmin
}) => {

  const toggleSpecialty = (specId: string) => {
    if (setSelectedSpecialties) {
      setSelectedSpecialties(prev => {
        const next = new Set(prev);
        if (next.has(specId)) next.delete(specId);
        else next.add(specId);
        return next;
      });
    } else if (setActiveSpecialty) {
      setActiveSpecialty(activeSpecialty === specId ? 'ALL' : specId as any);
    }
  };

  const selectAllSpecialties = () => {
    if (setSelectedSpecialties) {
      setSelectedSpecialties(new Set());
    } else if (setActiveSpecialty) {
      setActiveSpecialty('ALL');
    }
  };

  const toggleSite = (siteKey: string) => {
    const next = new Set(selectedSites);
    if (next.has(siteKey)) next.delete(siteKey);
    else next.add(siteKey);
    setSelectedSites(next);
  };

  const selectAllSites = () => {
    setSelectedSites(new Set());
  };

  return (
    <aside 
      style={{ backgroundColor: 'var(--panel)', borderRight: '2px solid var(--border)', width: '280px' }}
      className="w-full lg:w-[280px] bg-[#3d414d] border-r-2 border-[rgba(255,255,255,0.18)] p-6 flex flex-col justify-between overflow-y-auto shrink-0 space-y-6"
    >
      
      <div className="space-y-6">
        
        {/* Section 1: Timeline Control */}
        <div>
          <span className="section-label">
            Timeline
          </span>
          <select 
            value={activeMonth}
            onChange={(e) => {
              setActiveMonth(e.target.value);
              setActiveDate(`${e.target.value}-01`);
            }}
            className="w-full bg-[#2e313a] text-white border border-[rgba(255,255,255,0.18)] rounded p-2 text-xs font-mono focus:outline-none focus:border-[#a0c9eb] transition-colors"
          >
            <option value="2026-09" className="bg-[#2e313a] text-white">September 2026</option>
            <option value="2026-10" className="bg-[#2e313a] text-white">October 2026</option>
            <option value="2026-11" className="bg-[#2e313a] text-white">November 2026</option>
            <option value="2026-12" className="bg-[#2e313a] text-white">December 2026</option>
            <option value="2027-01" className="bg-[#2e313a] text-white">January 2027</option>
          </select>

          {/* Multi-Date Scope Trigger */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onOpenDateFilterModal}
              className="flex-1 bg-[#2e313a] hover:bg-[#343842] text-white hover:text-[#a0c9eb] border border-[rgba(255,255,255,0.18)] hover:border-[#a0c9eb] text-xs font-mono py-2 px-3 rounded transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>{selectedDates.size === 0 ? 'ALL MONTH DATES' : `${selectedDates.size} DATES FILTERED`}</span>
              <CalendarIcon className="w-3.5 h-3.5 text-[#a0c9eb]" />
            </button>
            {selectedDates.size > 0 && (
              <button
                onClick={onResetDateFilter}
                className="bg-[#3b1820] text-rose-300 hover:text-white border border-rose-500 text-xs font-mono font-bold px-2.5 py-2 rounded cursor-pointer"
                title="Reset Date Filter"
              >
                RESET
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Navigation Buttons */}
        <div>
          <span className="section-label">
            Navigation
          </span>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('engine')}
              className={`nav-btn w-full text-left py-2.5 px-3 text-xs rounded border transition-all cursor-pointer flex justify-between items-center ${
                activeTab === 'engine' 
                  ? 'bg-[rgba(255,255,255,0.1)] border-[#a0c9eb] text-white font-bold' 
                  : 'bg-transparent border-transparent text-[#fdfdfd] hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#a0c9eb] shadow-[0_0_8px_#a0c9eb]" />
                Outpatient Ops Engine
              </span>
              <span className="font-mono text-xs text-[#a0c9eb]">{activeTab === 'engine' ? '→' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`nav-btn w-full text-left py-2.5 px-3 text-xs rounded border transition-all cursor-pointer flex justify-between items-center ${
                activeTab === 'calendar' 
                  ? 'bg-[rgba(255,255,255,0.1)] border-[#a0c9eb] text-white font-bold' 
                  : 'bg-transparent border-transparent text-[#fdfdfd] hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-[#a0c9eb]" /> Grid Overview
              </span>
              <span className="font-mono text-xs text-[#a0c9eb]">{activeTab === 'calendar' ? '→' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('specialty')}
              className={`nav-btn w-full text-left py-2.5 px-3 text-xs rounded border transition-all cursor-pointer flex justify-between items-center ${
                activeTab === 'specialty' 
                  ? 'bg-[rgba(255,255,255,0.1)] border-[#a0c9eb] text-white font-bold' 
                  : 'bg-transparent border-transparent text-[#fdfdfd] hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#a0c9eb]" /> Matrix & Quotas
              </span>
              <span className="font-mono text-xs text-[#a0c9eb]">{activeTab === 'specialty' ? '→' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`nav-btn w-full text-left py-2.5 px-3 text-xs rounded border transition-all cursor-pointer flex justify-between items-center ${
                activeTab === 'analytics' 
                  ? 'bg-[rgba(255,255,255,0.1)] border-[#a0c9eb] text-white font-bold' 
                  : 'bg-transparent border-transparent text-[#fdfdfd] hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#a0c9eb]" /> Workload Stats
              </span>
              <span className="font-mono text-xs text-[#a0c9eb]">{activeTab === 'analytics' ? '→' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('leave')}
              className={`nav-btn w-full text-left py-2.5 px-3 text-xs rounded border transition-all cursor-pointer flex justify-between items-center ${
                activeTab === 'leave' 
                  ? 'bg-[rgba(255,255,255,0.1)] border-[#a0c9eb] text-white font-bold' 
                  : 'bg-transparent border-transparent text-[#fdfdfd] hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <CalendarX2 className="w-4 h-4 text-[#a0c9eb]" /> PTO & CME Portal
              </span>
              <span className="font-mono text-xs text-[#a0c9eb]">{activeTab === 'leave' ? '→' : ''}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`nav-btn w-full text-left py-2.5 px-3 text-xs rounded border transition-all cursor-pointer flex justify-between items-center ${
                  activeTab === 'admin' 
                    ? 'bg-[rgba(255,255,255,0.1)] border-[#a0c9eb] text-white font-bold' 
                    : 'bg-transparent border-transparent text-[#fdfdfd] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#a0c9eb]" /> Administrative
                </span>
                <span className="font-mono text-xs text-[#a0c9eb]">{activeTab === 'admin' ? '→' : ''}</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 3: Schedule View Format (When Calendar active) */}
        {activeTab === 'calendar' && (
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
              View Format
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setDisplayMode('GRID')}
                className={`py-2 px-2 text-xs font-mono font-bold border rounded transition-colors cursor-pointer text-center ${
                  displayMode === 'GRID' 
                    ? 'border-[#8eb9dd] text-[#8eb9dd] bg-[#1e2128] font-black' 
                    : 'border-[rgba(255,255,255,0.18)] text-white bg-[#333844] hover:bg-[#3d4352]'
                }`}
              >
                GRID
              </button>
              <button
                onClick={() => setDisplayMode('SLOTS')}
                className={`py-2 px-2 text-xs font-mono font-bold border rounded transition-colors cursor-pointer text-center ${
                  displayMode === 'SLOTS' 
                    ? 'border-[#8eb9dd] text-[#8eb9dd] bg-[#1e2128] font-black' 
                    : 'border-[rgba(255,255,255,0.18)] text-white bg-[#333844] hover:bg-[#3d4352]'
                }`}
              >
                HOURLY
              </button>
              <button
                onClick={() => setDisplayMode('MOBILE')}
                className={`py-2 px-2 text-xs font-mono font-bold border rounded transition-colors cursor-pointer text-center ${
                  displayMode === 'MOBILE' 
                    ? 'border-[#8eb9dd] text-[#8eb9dd] bg-[#1e2128] font-black' 
                    : 'border-[rgba(255,255,255,0.18)] text-white bg-[#333844] hover:bg-[#3d4352]'
                }`}
              >
                STREAM
              </button>
            </div>
          </div>
        )}

        {/* Section 4: Text Search */}
        <div>
          <div 
            style={{ color: '#d8d8e4' }}
            className="font-mono text-xs font-bold uppercase tracking-wider text-[#d8d8e4] mb-2"
          >
            Search Directory & Shifts
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clinician, modality, site..."
              className="w-full bg-[#1e2128] text-xs font-bold text-white border border-[rgba(255,255,255,0.22)] rounded pl-9 pr-3 py-2.5 font-mono focus:outline-none focus:border-[#8eb9dd] placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-300 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Section 5: Modality & Subspecialty Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span 
              style={{ color: '#d8d8e4' }}
              className="font-mono text-xs font-bold uppercase tracking-wider text-[#d8d8e4]"
            >
              Subspecialty Filter
            </span>
            {selectedSpecialties.size > 0 && (
              <span className="text-[10px] font-mono text-[#8eb9dd] font-bold">
                {selectedSpecialties.size} active
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={selectAllSpecialties}
              style={{ backgroundColor: '#5f636f', borderWidth: '0px', borderRadius: '0px', borderStyle: 'none' }}
              className={`font-mono text-xs uppercase px-2.5 py-1 transition-colors cursor-pointer font-bold ${
                selectedSpecialties.size === 0 && activeSpecialty === 'ALL'
                  ? 'border-[#8eb9dd] text-black bg-[#8eb9dd] font-extrabold shadow-sm'
                  : 'border-[rgba(255,255,255,0.2)] text-white bg-[#333844] hover:border-[#8eb9dd] hover:text-[#8eb9dd]'
              }`}
            >
              ALL
            </button>
            {(specialtiesList.length > 0 
              ? specialtiesList.map(s => ({ id: s.id, name: s.name }))
              : (['Body', 'Neuro', 'MSK', 'Breast', 'Breast MRI', 'Interventional', 'PET'] as const).map(s => ({ id: s, name: s }))
            ).map(spec => {
              const isSelected = selectedSpecialties.has(spec.id) || activeSpecialty === spec.id;
              return (
                <button
                  key={spec.id}
                  onClick={() => toggleSpecialty(spec.id)}
                  className={`font-mono text-xs uppercase px-2.5 py-1 rounded border transition-colors cursor-pointer font-bold ${
                    isSelected
                      ? 'border-[#8eb9dd] text-black bg-[#8eb9dd] font-extrabold shadow-sm'
                      : 'border-[rgba(255,255,255,0.2)] text-white bg-[#333844] hover:border-[#8eb9dd] hover:text-[#8eb9dd]'
                  }`}
                >
                  {spec.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 6: Clinical Facilities Filter */}
        <div>
          <div 
            style={{ color: '#d8d8e4' }}
            className="font-mono text-xs font-bold uppercase tracking-wider text-[#d8d8e4] mb-2"
          >
            Facility Filter
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={selectAllSites}
              style={{ backgroundColor: '#5f636f', borderRadius: '0px', borderWidth: '0px', borderStyle: 'none' }}
              className={`font-mono text-xs uppercase px-2.5 py-1 transition-colors cursor-pointer font-bold ${
                selectedSites.size === 0
                  ? 'border-[#8eb9dd] text-black bg-[#8eb9dd] font-extrabold shadow-sm'
                  : 'border-[rgba(255,255,255,0.2)] text-white bg-[#333844] hover:border-[#8eb9dd] hover:text-[#8eb9dd]'
              }`}
            >
              ALL SITES
            </button>
            {Object.values(sites).map(st => {
              const isSelected = selectedSites.has(st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => toggleSite(st.id)}
                  title={st.name}
                  className={`font-mono text-xs uppercase px-2.5 py-1 rounded border transition-colors cursor-pointer font-bold ${
                    isSelected
                      ? 'border-[#8eb9dd] text-black bg-[#8eb9dd] font-extrabold shadow-sm'
                      : 'border-[rgba(255,255,255,0.2)] text-white bg-[#333844] hover:border-[#8eb9dd] hover:text-[#8eb9dd]'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 7: Role Scope */}
        <div>
          <div 
            style={{ color: '#d8d8e4' }}
            className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 mb-2"
          >
            Role Scope
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            <button
              onClick={() => setSelectedRoleFilter('ALL')}
              style={{ backgroundColor: '#5f636f', borderWidth: '0px', borderStyle: 'none' }}
              className={`py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer text-center ${
                selectedRoleFilter === 'ALL'
                  ? 'border-[#8eb9dd] text-black bg-[#8eb9dd] font-extrabold'
                  : 'border-[rgba(255,255,255,0.18)] text-white bg-[#333844] hover:bg-[#3d4352]'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setSelectedRoleFilter('CHIEF')}
              className={`py-1.5 text-xs font-mono font-bold border rounded transition-colors cursor-pointer text-center ${
                selectedRoleFilter === 'CHIEF'
                  ? 'border-amber-400 text-black bg-amber-400 font-extrabold'
                  : 'border-[rgba(255,255,255,0.18)] text-amber-300 bg-[#333844] hover:bg-[#3d4352]'
              }`}
            >
              CHIEF
            </button>
            <button
              onClick={() => setSelectedRoleFilter('ADMIN')}
              className={`py-1.5 text-xs font-mono font-bold border rounded transition-colors cursor-pointer text-center ${
                selectedRoleFilter === 'ADMIN'
                  ? 'border-[#8eb9dd] text-black bg-[#8eb9dd] font-extrabold'
                  : 'border-[rgba(255,255,255,0.18)] text-[#8eb9dd] bg-[#333844] hover:bg-[#3d4352]'
              }`}
            >
              ADMIN
            </button>
            <button
              onClick={() => setSelectedRoleFilter('ATTENDING_RAD')}
              className={`py-1.5 text-xs font-mono font-bold border rounded transition-colors cursor-pointer text-center ${
                selectedRoleFilter === 'ATTENDING_RAD'
                  ? 'border-[#38bdf8] text-black bg-[#38bdf8] font-extrabold'
                  : 'border-[rgba(255,255,255,0.18)] text-white bg-[#333844] hover:bg-[#3d4352]'
              }`}
            >
              ATTENDING
            </button>
            <button
              onClick={() => setSelectedRoleFilter('ADVANCED_PRACTITIONER')}
              className={`py-1.5 text-xs font-mono font-bold border rounded transition-colors cursor-pointer text-center ${
                selectedRoleFilter === 'ADVANCED_PRACTITIONER'
                  ? 'border-[#34d399] text-black bg-[#34d399] font-extrabold'
                  : 'border-[rgba(255,255,255,0.18)] text-white bg-[#333844] hover:bg-[#3d4352]'
              }`}
            >
              RPA / NP
            </button>
          </div>
        </div>

      </div>

      {/* Section 8: Bottom Actions */}
      <div className="pt-6 border-t border-[rgba(255,255,255,0.18)] space-y-2.5">
        <button
          onClick={onOpenShiftModal}
          className="w-full bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold text-xs py-3 px-4 rounded cursor-pointer transition-colors shadow-sm flex items-center justify-between font-mono"
        >
          <span>+ NEW ASSIGNMENT</span>
          <span className="bg-black text-[#a0c9eb] px-2 py-0.5 rounded text-[10px] font-extrabold">RAD/AP</span>
        </button>

        <button
          onClick={onOpenContrastModal}
          className="w-full bg-[#2e313a] hover:bg-[#343842] border border-[rgba(255,255,255,0.18)] text-white hover:text-[#a0c9eb] text-xs font-bold py-2.5 px-3 rounded cursor-pointer transition-colors flex items-center justify-between font-mono"
        >
          <span className="flex items-center gap-2">
            <Syringe className="w-4 h-4 text-[#a0c9eb]" /> Contrast Supervisor
          </span>
          <span className="text-[#a0c9eb] font-black">ACR</span>
        </button>

        <button
          onClick={onOpenCopyModal}
          className="w-full bg-[#2e313a] hover:bg-[#343842] border border-[rgba(255,255,255,0.18)] text-white text-xs font-bold py-2.5 px-3 rounded cursor-pointer transition-colors flex items-center justify-between font-mono"
        >
          <span className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-[#a0c9eb]" /> Copy Schedule Pattern
          </span>
          <span className="text-slate-300 font-bold">W/M</span>
        </button>

        <button
          onClick={onExportCsv}
          className="w-full bg-transparent hover:bg-[#2e313a] border border-dashed border-[rgba(255,255,255,0.25)] hover:border-[#a0c9eb] text-white hover:text-[#a0c9eb] text-xs font-mono font-bold py-2 px-3 rounded cursor-pointer transition-colors flex items-center justify-between"
        >
          <span>EXPORT OPERATIONS CSV</span>
          <FileSpreadsheet className="w-4 h-4 text-[#a0c9eb]" />
        </button>
      </div>

    </aside>
  );
};
