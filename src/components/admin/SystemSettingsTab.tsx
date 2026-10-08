import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  User, 
  Mail, 
  Globe, 
  Moon, 
  Download, 
  Upload, 
  Check, 
  Save, 
  ShieldAlert
} from 'lucide-react';
import { SystemSettings } from '../../types';

interface SystemSettingsTabProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onExportBackup?: () => void;
  onRestoreBackup?: (data: any) => void;
  addAuditLog: (action: string, details: string) => void;
}

export const SystemSettingsTab: React.FC<SystemSettingsTabProps> = ({
  settings,
  onSaveSettings,
  theme,
  setTheme,
  onExportBackup,
  onRestoreBackup,
  addAuditLog
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    addAuditLog('UPDATE_SETTINGS', `Updated practice settings: ${formData.practiceName}.`);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (onRestoreBackup) {
          onRestoreBackup(data);
          alert('System configuration and database restored successfully!');
        }
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#8eb9dd]" />
            <h3 className="meta-mono text-base font-bold text-white">
              Practice Branding & Platform Configuration
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Customize practice name, department leadership, timezone, default theme, and system backups without touching source code.
          </p>
        </div>

        {isSaved && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xs flex items-center gap-1.5 animate-pulse">
            <Check className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Practice Branding */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-4">
            <div className="flex items-center gap-2 font-bold text-white text-sm border-b border-white/10 pb-2">
              <Building2 className="w-4 h-4 text-[#8eb9dd]" />
              <span>Institutional Branding</span>
            </div>

            <div>
              <label className="block meta-mono text-slate-400 mb-1 text-xs">
                Radiology Practice / Hospital Group Name
              </label>
              <input
                type="text"
                value={formData.practiceName}
                onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                required
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-bold text-xs"
              />
            </div>

            <div>
              <label className="block meta-mono text-slate-400 mb-1 text-xs">
                Department Chief / Medical Director Name
              </label>
              <input
                type="text"
                value={formData.departmentChief}
                onChange={(e) => setFormData({ ...formData, departmentChief: e.target.value })}
                required
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-bold text-xs"
              />
            </div>

            <div>
              <label className="block meta-mono text-slate-400 mb-1 text-xs">
                Administrative / Operations Support Email
              </label>
              <input
                type="email"
                value={formData.adminContactEmail}
                onChange={(e) => setFormData({ ...formData, adminContactEmail: e.target.value })}
                required
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white text-xs"
              />
            </div>
          </div>

          {/* Regional & UI Settings */}
          <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-4">
            <div className="flex items-center gap-2 font-bold text-white text-sm border-b border-white/10 pb-2">
              <Globe className="w-4 h-4 text-[#8eb9dd]" />
              <span>Regional & Interface Setup</span>
            </div>

            <div>
              <label className="block meta-mono text-slate-400 mb-1 text-xs">
                Operational Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-bold text-xs"
              >
                <option value="America/New_York">Eastern Time (US / New York)</option>
                <option value="America/Chicago">Central Time (US / Chicago)</option>
                <option value="America/Denver">Mountain Time (US / Denver)</option>
                <option value="America/Los_Angeles">Pacific Time (US / Los Angeles)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>

            <div>
              <label className="block meta-mono text-slate-400 mb-1 text-xs">
                Active Color Theme
              </label>
              <div className="pt-1">
                <div className="p-3 rounded-xs border border-[#8eb9dd]/40 bg-[#8eb9dd]/10 text-[#8eb9dd] flex items-center justify-between text-xs font-mono font-bold">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-[#8eb9dd]" />
                    <span>Clinical Slate Dark Mode (Active)</span>
                  </div>
                  <span className="text-[10px] bg-[#8eb9dd]/20 px-2 py-0.5 rounded text-[#8eb9dd]">Enforced</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block meta-mono text-slate-400 mb-1 text-xs">
                Conflict Engine Enforcement
              </label>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={formData.strictComplianceMode}
                  onChange={(e) => setFormData({ ...formData, strictComplianceMode: e.target.checked })}
                  className="accent-[#8eb9dd] cursor-pointer"
                />
                <span className="text-xs text-slate-300">
                  Strict Mode: Prevent shift creation if critical compliance conflicts exist
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-extrabold text-xs py-3 px-6 rounded-xs shadow-lg cursor-pointer flex items-center gap-2 font-mono transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save System Branding & Settings</span>
          </button>
        </div>
      </form>

      {/* Snapshot Backup / Restore */}
      <div className="bg-[#1c1c1f] p-5 rounded-xs border border-white/10 space-y-4">
        <div className="flex items-center gap-2 font-bold text-white text-sm border-b border-white/10 pb-2">
          <Download className="w-4 h-4 text-[#8eb9dd]" />
          <span>Complete System Snapshot (Backup & Restore)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Export the entire database, user directory, custom roles, modalities, and shift assignments to a single portable JSON file. Restore at any time with one click.
        </p>

        <div className="flex flex-wrap gap-3">
          {onExportBackup && (
            <button
              onClick={onExportBackup}
              className="bg-[#242429] hover:bg-[#2e2e35] text-white border border-white/20 font-bold text-xs py-2.5 px-4 rounded-xs flex items-center gap-2 cursor-pointer font-mono"
            >
              <Download className="w-4 h-4 text-[#8eb9dd]" />
              <span>Export Full Database Backup JSON</span>
            </button>
          )}

          {onRestoreBackup && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#242429] hover:bg-[#2e2e35] text-white border border-white/20 font-bold text-xs py-2.5 px-4 rounded-xs flex items-center gap-2 cursor-pointer font-mono"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore from JSON File</span>
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
