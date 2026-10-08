import React, { useState } from 'react';
import { 
  Palette, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  Check, 
  X, 
  Sparkles,
  Activity,
  Layers as ModalityIcon
} from 'lucide-react';
import { ClinicalSpecialty } from '../../types';

interface SpecialtiesManagerTabProps {
  specialties: ClinicalSpecialty[];
  onSaveSpecialty: (spec: ClinicalSpecialty) => void;
  onDeleteSpecialty: (specId: string) => void;
  modalities: string[];
  onSaveModality: (mod: string) => void;
  onDeleteModality: (mod: string) => void;
}

export const SpecialtiesManagerTab: React.FC<SpecialtiesManagerTabProps> = ({
  specialties,
  onSaveSpecialty,
  onDeleteSpecialty,
  modalities,
  onSaveModality,
  onDeleteModality
}) => {
  // Specialty State
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [specName, setSpecName] = useState('');
  const [specCode, setSpecCode] = useState('');
  const [specColor, setSpecColor] = useState('#38bdf8');
  const [specRvu, setSpecRvu] = useState<number>(1.2);
  const [specDesc, setSpecDesc] = useState('');
  const [isSpecFormOpen, setIsSpecFormOpen] = useState(false);

  // Modality State
  const [newModalityName, setNewModalityName] = useState('');

  const PRESET_COLORS = [
    '#38bdf8', '#a855f7', '#34d399', '#ec4899', 
    '#f43f5e', '#f97316', '#eab308', '#6366f1', '#14b8a6'
  ];

  const handleStartEditSpec = (s: ClinicalSpecialty) => {
    setEditingSpecId(s.id);
    setSpecName(s.name);
    setSpecCode(s.code);
    setSpecColor(s.color);
    setSpecRvu(s.rvuWeight);
    setSpecDesc(s.description);
    setIsSpecFormOpen(true);
  };

  const handleResetSpecForm = () => {
    setEditingSpecId(null);
    setSpecName('');
    setSpecCode('');
    setSpecColor('#38bdf8');
    setSpecRvu(1.2);
    setSpecDesc('');
    setIsSpecFormOpen(false);
  };

  const handleSubmitSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim()) return;

    const id = editingSpecId || specName.trim();
    const code = specCode.trim() || specName.trim().slice(0, 3).toUpperCase();

    onSaveSpecialty({
      id,
      name: specName.trim(),
      code,
      color: specColor,
      description: specDesc.trim() || `${specName} clinical subspecialty`,
      rvuWeight: specRvu
    });

    handleResetSpecForm();
  };

  const handleAddModality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModalityName.trim()) return;
    onSaveModality(newModalityName.trim());
    setNewModalityName('');
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: CLINICAL SPECIALTIES */}
      <div className="space-y-4">
        <div className="bg-[#1c1c1f] p-5 rounded-xs border border-[rgba(238,237,234,0.1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#8eb9dd]" />
              <h3 className="meta-mono text-base font-bold text-[#eeedea]">
                Clinical Specialties Registry
              </h3>
            </div>
            <p className="text-xs text-[rgba(238,237,234,0.6)] mt-1">
              Add, rename, or retire subspecialty tracks. Configure RVU weights and badge branding without modifying application code.
            </p>
          </div>

          {!isSpecFormOpen && (
            <button
              onClick={() => setIsSpecFormOpen(true)}
              className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs py-2 px-3 rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 font-mono"
            >
              <Plus className="w-4 h-4" />
              <span>Add Specialty</span>
            </button>
          )}
        </div>

        {/* Specialty Form */}
        {isSpecFormOpen && (
          <div className="bg-[#1c1c1f] p-5 rounded-xs border-2 border-[#8eb9dd] shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[rgba(238,237,234,0.1)] pb-3">
              <h4 className="meta-mono text-sm font-bold text-[#eeedea]">
                {editingSpecId ? `Edit Specialty: ${specName}` : 'Add Clinical Specialty'}
              </h4>
              <button onClick={handleResetSpecForm} className="text-slate-400 hover:text-white cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSpecialty} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block meta-mono text-slate-400 mb-1">Specialty Display Name</label>
                  <input
                    type="text"
                    value={specName}
                    onChange={(e) => setSpecName(e.target.value)}
                    required
                    placeholder="e.g. Cardiac Imaging"
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block meta-mono text-slate-400 mb-1">Code / Abbreviation</label>
                  <input
                    type="text"
                    value={specCode}
                    onChange={(e) => setSpecCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CMR"
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block meta-mono text-slate-400 mb-1">RVU Weight Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="5.0"
                    value={specRvu}
                    onChange={(e) => setSpecRvu(parseFloat(e.target.value) || 1.0)}
                    required
                    className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block meta-mono text-slate-400 mb-1">Color Accent</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSpecColor(c)}
                        className={`w-6 h-6 rounded-xs cursor-pointer transition-transform ${specColor === c ? 'scale-110 ring-2 ring-white' : 'opacity-70'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block meta-mono text-slate-400 mb-1">Description / Modality Scope</label>
                <input
                  type="text"
                  value={specDesc}
                  onChange={(e) => setSpecDesc(e.target.value)}
                  placeholder="e.g. Advanced cardiac MRI, coronary CT angiography, and calcium scoring"
                  className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleResetSpecForm}
                  className="px-4 py-2 rounded-xs border border-white/20 text-slate-400 hover:text-white cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold px-5 py-2 rounded-xs shadow-md cursor-pointer font-mono flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSpecId ? 'Save Changes' : 'Register Specialty'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Specialty Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialties.map(s => (
            <div 
              key={s.id}
              className="bg-[#1c1c1f] p-4 rounded-xs border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase border"
                    style={{ 
                      backgroundColor: `${s.color}22`, 
                      color: s.color,
                      borderColor: `${s.color}44`
                    }}
                  >
                    {s.code || s.name.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-[#8eb9dd] bg-[#111113] px-2 py-0.5 rounded-xs border border-white/5">
                    {s.rvuWeight}x RVU Multiplier
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white">
                    {s.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleStartEditSpec(s)}
                  className="text-xs font-mono text-[#8eb9dd] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Remove clinical specialty "${s.name}"?`)) {
                      onDeleteSpecialty(s.id);
                    }
                  }}
                  className="text-xs font-mono text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                  title="Delete Specialty"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: IMAGING MODALITIES CATALOG */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#8eb9dd]" />
              <h3 className="meta-mono text-base font-bold text-white">
                Imaging Modalities & Diagnostic Suites
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Add or remove clinical imaging modalities dynamically. These populate site capability tags, shift assignments, and RIS queues.
            </p>
          </div>

          <form onSubmit={handleAddModality} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={newModalityName}
              onChange={(e) => setNewModalityName(e.target.value)}
              placeholder="e.g. Coronary CTA"
              className="bg-[#111113] border border-white/20 rounded-xs px-3 py-1.5 text-xs text-white placeholder:text-slate-500 w-full sm:w-56"
            />
            <button
              type="submit"
              className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold text-xs py-1.5 px-3 rounded-xs font-mono shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {modalities.map(m => (
            <div 
              key={m}
              className="bg-[#1c1c1f] p-3 rounded-xs border border-white/10 flex items-center justify-between text-xs group hover:border-[#8eb9dd]/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8eb9dd]" />
                <span className="font-semibold text-slate-200">{m}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Remove modality "${m}"?`)) {
                    onDeleteModality(m);
                  }
                }}
                className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Remove Modality"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
