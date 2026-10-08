import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Award, 
  AlertCircle 
} from 'lucide-react';
import { StaffUser, ClinicianCredential } from '../../types';
import { formatPersonName } from '../../utils/formatters';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: StaffUser[];
  credentials: ClinicianCredential[];
  onSaveCredential: (cred: ClinicianCredential) => void;
  onDeleteCredential: (id: string) => void;
  isAdmin: boolean;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  users,
  credentials,
  onSaveCredential,
  onDeleteCredential,
  isAdmin
}) => {
  const [filterRadId, setFilterRadId] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formRadId, setFormRadId] = useState<string>(users[0]?.id || '');
  const [formTitle, setFormTitle] = useState<string>('State Medical License');
  const [formIdentifier, setFormIdentifier] = useState<string>('');
  const [formExpDate, setFormExpDate] = useState<string>('2027-01-01');
  const [formCases, setFormCases] = useState<number>(0);
  const [formRequiredCases, setFormRequiredCases] = useState<number>(0);

  if (!isOpen) return null;

  const handleStartEdit = (c: ClinicianCredential) => {
    setEditingId(c.id);
    setFormRadId(c.radId);
    setFormTitle(c.title);
    setFormIdentifier(c.identifier);
    setFormExpDate(c.expirationDate);
    setFormCases(c.caseCount || 0);
    setFormRequiredCases(c.requiredCases || 0);
    setIsFormOpen(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFormTitle('State Medical License');
    setFormIdentifier('');
    setFormExpDate('2027-01-01');
    setFormCases(0);
    setFormRequiredCases(0);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIdentifier.trim()) {
      alert('Credential certificate / license identifier is required.');
      return;
    }

    const todayMs = new Date().getTime();
    const expMs = new Date(formExpDate).getTime();
    const daysLeft = Math.round((expMs - todayMs) / (1000 * 3600 * 24));
    let status: ClinicianCredential['status'] = 'ACTIVE';
    if (daysLeft < 0) {
      status = 'EXPIRED';
    } else if (daysLeft <= 60) {
      status = 'EXPIRING_SOON';
    }

    onSaveCredential({
      id: editingId || `cred-${Date.now()}`,
      radId: formRadId,
      title: formTitle.trim(),
      identifier: formIdentifier.trim(),
      expirationDate: formExpDate,
      status,
      caseCount: formCases > 0 ? formCases : undefined,
      requiredCases: formRequiredCases > 0 ? formRequiredCases : undefined
    });

    handleResetForm();
  };

  const filteredCredentials = credentials.filter(c => {
    if (filterRadId !== 'ALL' && c.radId !== filterRadId) return false;
    return true;
  });

  const expiringCount = credentials.filter(c => c.status === 'EXPIRING_SOON').length;
  const expiredCount = credentials.filter(c => c.status === 'EXPIRED').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#363a46] rounded-xs border border-white/20 w-full max-w-2xl overflow-hidden shadow-2xl text-[#fdfdfd]">
        
        {/* Header */}
        <div className="bg-[#2e313a] px-5 py-4 border-b border-white/15 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a0c9eb]/20 text-[#a0c9eb] border border-[#a0c9eb]/40 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-brand italic text-base text-[#fdfdfd] font-bold">
                Credential & Compliance Expiration Alerts
              </h3>
              <p className="text-[11px] font-mono text-slate-300">
                MQSA mammography reads &bull; ACR contrast certification &bull; State medical licenses &bull; DEA
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

        {/* Alerts Banner */}
        {(expiredCount > 0 || expiringCount > 0) && (
          <div className="px-5 py-3 bg-amber-950/60 border-b border-amber-600/40 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>{expiringCount}</strong> credential(s) expiring within 60 days. 
                {expiredCount > 0 && <span className="text-rose-300 ml-1"><strong>{expiredCount}</strong> expired credential!</span>}
              </span>
            </div>
          </div>
        )}

        <div className="p-5 space-y-4 text-xs">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-64">
              <label className="block meta-mono text-slate-200 mb-1 text-[11px] font-semibold">
                Filter by Clinician:
              </label>
              <select
                value={filterRadId}
                onChange={(e) => setFilterRadId(e.target.value)}
                className="w-full bg-[#2e313a] border border-white/25 rounded-xs p-2 text-white font-geist text-xs outline-none focus:border-[#a0c9eb]"
              >
                <option value="ALL" className="bg-[#2e313a] text-white">All Practice Clinicians</option>
                {users.filter(u => !u.isArchived).map(u => (
                  <option key={u.id} value={u.id} className="bg-[#2e313a] text-white">
                    {formatPersonName(u.name, u.role, u.title)}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && !isFormOpen && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold font-mono text-xs px-3.5 py-2 rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Credential</span>
              </button>
            )}
          </div>

          {/* Form */}
          {isFormOpen && (
            <form onSubmit={handleSubmit} className="bg-[#2e313a] p-4 rounded-xs border border-[#a0c9eb]/40 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-white/15 pb-2">
                <span className="font-bold text-white text-xs font-mono">
                  {editingId ? 'Edit Credential' : 'Add Clinician Credential'}
                </span>
                <button type="button" onClick={handleResetForm} className="text-slate-300 hover:text-white p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block meta-mono text-slate-200 mb-1 font-semibold">Staff Clinician</label>
                  <select
                    value={formRadId}
                    onChange={(e) => setFormRadId(e.target.value)}
                    className="w-full bg-[#252833] border border-white/25 rounded-xs p-2 text-white outline-none focus:border-[#a0c9eb]"
                  >
                    {users.filter(u => !u.isArchived).map(u => (
                      <option key={u.id} value={u.id} className="bg-[#252833] text-white">
                        {formatPersonName(u.name, u.role, u.title)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block meta-mono text-slate-200 mb-1 font-semibold">Credential Type</label>
                  <select
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-[#252833] border border-white/25 rounded-xs p-2 text-white outline-none focus:border-[#a0c9eb]"
                  >
                    <option value="State Medical License" className="bg-[#252833]">State Medical License (Full MD/DO)</option>
                    <option value="ACR IV Contrast Supervisor Credential" className="bg-[#252833]">ACR IV Contrast Supervisor Credential</option>
                    <option value="MQSA Mammography Interpreting Physician" className="bg-[#252833]">MQSA Mammography Interpreting Physician</option>
                    <option value="DEA Controlled Substance Registration" className="bg-[#252833]">DEA Controlled Substance Registration</option>
                    <option value="AAPA / Fluoroscopy Operator Permit" className="bg-[#252833]">AAPA / Fluoroscopy Operator Permit</option>
                    <option value="BLS / ACLS Resuscitation Certificate" className="bg-[#252833]">BLS / ACLS Resuscitation Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block meta-mono text-slate-200 mb-1 font-semibold">License / Certificate ID</label>
                  <input
                    type="text"
                    value={formIdentifier}
                    onChange={(e) => setFormIdentifier(e.target.value)}
                    placeholder="e.g. MD-948201 or DEA-FC882"
                    required
                    className="w-full bg-[#252833] border border-white/25 rounded-xs p-2 text-white font-mono placeholder-slate-400 outline-none focus:border-[#a0c9eb]"
                  />
                </div>

                <div>
                  <label className="block meta-mono text-slate-200 mb-1 font-semibold">Expiration Date</label>
                  <input
                    type="date"
                    value={formExpDate}
                    onChange={(e) => setFormExpDate(e.target.value)}
                    required
                    className="w-full bg-[#252833] border border-white/25 rounded-xs p-2 text-white font-mono outline-none focus:border-[#a0c9eb]"
                  />
                </div>

                {formTitle.includes('MQSA') && (
                  <>
                    <div>
                      <label className="block meta-mono text-slate-200 mb-1 font-semibold">Completed Reads (24mo)</label>
                      <input
                        type="number"
                        value={formCases}
                        onChange={(e) => setFormCases(Number(e.target.value))}
                        className="w-full bg-[#252833] border border-white/25 rounded-xs p-2 text-white font-mono outline-none focus:border-[#a0c9eb]"
                      />
                    </div>
                    <div>
                      <label className="block meta-mono text-slate-200 mb-1 font-semibold">Required Minimum Reads</label>
                      <input
                        type="number"
                        value={formRequiredCases}
                        onChange={(e) => setFormRequiredCases(Number(e.target.value))}
                        placeholder="960"
                        className="w-full bg-[#252833] border border-white/25 rounded-xs p-2 text-white font-mono outline-none focus:border-[#a0c9eb]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/15">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-1.5 border border-white/20 text-slate-300 hover:text-white rounded-xs font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#a0c9eb] hover:bg-[#8eb9dd] text-[#111] font-bold font-mono px-4 py-1.5 rounded-xs transition-colors shadow-xs"
                >
                  Save Credential
                </button>
              </div>
            </form>
          )}

          {/* List of Credentials */}
          <div className="divide-y divide-white/10 border border-white/15 rounded-xs bg-[#2e313a] overflow-hidden max-h-[50vh] overflow-y-auto">
            {filteredCredentials.length === 0 ? (
              <div className="p-6 text-center text-slate-200 meta-mono">
                No credentials registered for this clinician filter.
              </div>
            ) : (
              filteredCredentials.map(cred => {
                const clinician = users.find(u => u.id === cred.radId);
                const todayMs = new Date().getTime();
                const expMs = new Date(cred.expirationDate).getTime();
                const daysLeft = Math.round((expMs - todayMs) / (1000 * 3600 * 24));

                return (
                  <div key={cred.id} className="p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {cred.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-300">
                          #{cred.identifier}
                        </span>
                        {daysLeft < 0 ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-600">
                            EXPIRED
                          </span>
                        ) : daysLeft <= 60 ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600">
                            EXPIRING IN {daysLeft}d
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600">
                            ACTIVE ({daysLeft}d)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-300 font-mono">
                        <span>Holder: <strong className="text-white">{clinician?.name || cred.radId}</strong></span>
                        <span>Expires: <strong className="text-slate-100">{cred.expirationDate}</strong></span>
                        {cred.caseCount !== undefined && cred.requiredCases !== undefined && (
                          <span className="text-[#a0c9eb] font-semibold">
                            MQSA Case Count: {cred.caseCount} / {cred.requiredCases} min
                          </span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(cred)}
                          className="p-1 text-slate-300 hover:text-[#a0c9eb] cursor-pointer transition-colors"
                          title="Edit Credential"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove credential "${cred.title}" for ${clinician?.name}?`)) {
                              onDeleteCredential(cred.id);
                            }
                          }}
                          className="p-1 text-slate-300 hover:text-rose-300 cursor-pointer transition-colors"
                          title="Delete Credential"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
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
