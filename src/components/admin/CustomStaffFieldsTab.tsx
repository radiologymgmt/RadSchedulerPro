import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, Sliders, Hash, Calendar, ToggleLeft, Type, AlertCircle } from 'lucide-react';
import { CustomStaffField, StaffUser } from '../../types';

interface CustomStaffFieldsTabProps {
  customFields: CustomStaffField[];
  onSaveCustomField: (field: CustomStaffField) => void;
  onDeleteCustomField: (id: string) => void;
  users: StaffUser[];
  onUpdateUserCustomField?: (userId: string, key: string, value: any) => void;
}

export const CustomStaffFieldsTab: React.FC<CustomStaffFieldsTabProps> = ({
  customFields,
  onSaveCustomField,
  onDeleteCustomField,
  users
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<CustomStaffField['type']>('text');
  const [isRequired, setIsRequired] = useState(false);

  const handleNameChange = (name: string) => {
    setFieldName(name);
    if (!editingId) {
      // Auto-generate camelCase key
      const key = name
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
      setFieldKey(key);
    }
  };

  const handleStartEdit = (f: CustomStaffField) => {
    setEditingId(f.id);
    setFieldName(f.label);
    setFieldKey(f.key);
    setFieldType(f.type);
    setIsRequired(!!f.required);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFieldName('');
    setFieldKey('');
    setFieldType('text');
    setIsRequired(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || !fieldKey.trim()) return;

    const newField: CustomStaffField = {
      id: editingId || `fld-${Date.now()}`,
      key: fieldKey.trim(),
      label: fieldName.trim(),
      type: fieldType,
      required: isRequired
    };

    onSaveCustomField(newField);
    handleResetForm();
  };

  return (
    <div className="space-y-6 text-xs text-[#eeedea]">
      
      {/* Header Banner */}
      <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="meta-mono text-sm font-bold text-[#8eb9dd] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#8eb9dd]" />
            Dynamic Staff Custom Field & Attribute Schema Generator
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Define practice-specific clinician metadata (e.g. NPI, Hospital Pager, Subspecialty Board Year) that dynamically binds into staff roster profiles.
          </p>
        </div>
        <div className="font-mono text-xs font-bold px-2.5 py-1 bg-[#111113] rounded border border-white/10 text-white shrink-0">
          {customFields.length} Custom Attributes Active
        </div>
      </div>

      {/* Field Creator / Editor */}
      <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-xs text-white">
            {editingId ? 'Edit Attribute Definition' : 'Define New Staff Attribute Field'}
          </span>
          {editingId && (
            <button
              onClick={handleResetForm}
              className="text-xs text-rose-400 hover:underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block meta-mono mb-1 text-[11px] text-slate-300">Attribute Display Label</label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. NPI Number, Pager Ext"
              required
              className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-white focus:outline-none focus:border-[#8eb9dd]"
            />
          </div>

          <div>
            <label className="block meta-mono mb-1 text-[11px] text-slate-300">Property Key (camelCase)</label>
            <input
              type="text"
              value={fieldKey}
              onChange={(e) => setFieldKey(e.target.value)}
              placeholder="e.g. npiNumber"
              required
              className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 font-mono text-[#8eb9dd] focus:outline-none focus:border-[#8eb9dd]"
            />
          </div>

          <div>
            <label className="block meta-mono mb-1 text-[11px] text-slate-300">Data Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as any)}
              className="w-full bg-[#111113] border border-[rgba(238,237,234,0.15)] rounded-xs p-2 text-white focus:outline-none focus:border-[#8eb9dd]"
            >
              <option value="text">Text (String)</option>
              <option value="number">Number (Integer / Decimal)</option>
              <option value="date">Date (Calendar Picker)</option>
              <option value="boolean">Boolean (Yes / No Toggle)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2 text-[11px] text-slate-300 font-mono">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="rounded accent-[#8eb9dd] w-4 h-4 cursor-pointer"
              />
              <span>Mandatory Field</span>
            </label>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold py-2 px-3 rounded-xs shadow-xs cursor-pointer h-9 flex items-center justify-center gap-1 font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Update Field' : 'Add to Schema'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Schema Attributes Table */}
      <div className="bg-[#1c1c1f] rounded-xs border border-[rgba(238,237,234,0.1)] overflow-hidden">
        <div className="p-3 bg-[#111113] border-b border-white/10 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-white">Current Staff Custom Schema</span>
          <span className="text-[11px] text-slate-400">Available across {users.length} clinician profiles</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#242429] text-[rgba(238,237,234,0.5)] uppercase meta-mono border-b border-[rgba(238,237,234,0.08)]">
              <th className="p-3">Attribute Label</th>
              <th className="p-3">Schema Key</th>
              <th className="p-3">Data Type</th>
              <th className="p-3">Requirement</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(238,237,234,0.06)] font-medium">
            {customFields.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400 font-mono">
                  No custom attributes defined yet. Create your first staff attribute above.
                </td>
              </tr>
            ) : (
              customFields.map(f => (
                <tr key={f.id} className="hover:bg-[rgba(238,237,234,0.02)] transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    {f.type === 'number' ? <Hash className="w-3.5 h-3.5 text-amber-400" /> :
                     f.type === 'date' ? <Calendar className="w-3.5 h-3.5 text-emerald-400" /> :
                     f.type === 'boolean' ? <ToggleLeft className="w-3.5 h-3.5 text-sky-400" /> :
                     <Type className="w-3.5 h-3.5 text-[#8eb9dd]" />}
                    <span>{f.label}</span>
                  </td>
                  <td className="p-3 font-mono text-[#8eb9dd] text-[11px]">{f.key}</td>
                  <td className="p-3 font-mono uppercase text-[10px] text-slate-300">
                    <span className="bg-[#111113] px-2 py-0.5 rounded border border-white/10">
                      {f.type}
                    </span>
                  </td>
                  <td className="p-3">
                    {f.required ? (
                      <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                        REQUIRED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded">
                        OPTIONAL
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStartEdit(f)}
                        className="p-1 hover:text-[#8eb9dd] text-slate-400 cursor-pointer"
                        title="Edit Schema Attribute"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove custom attribute "${f.label}" from schema?`)) {
                            onDeleteCustomField(f.id);
                          }
                        }}
                        className="p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
                        title="Delete Schema Attribute"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
