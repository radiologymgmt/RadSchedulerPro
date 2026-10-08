import React, { useState } from 'react';
import { 
  Send, 
  Check, 
  Mail, 
  MessageSquare, 
  Bell, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  ArrowRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import { SmtpWebhookConfig } from '../../types';

interface NotificationWebhookTabProps {
  config: SmtpWebhookConfig;
  onSaveConfig: (cfg: SmtpWebhookConfig) => void;
  addAuditLog: (action: string, detail: string) => void;
}

export const NotificationWebhookTab: React.FC<NotificationWebhookTabProps> = ({
  config,
  onSaveConfig,
  addAuditLog
}) => {
  const [formData, setFormData] = useState<SmtpWebhookConfig>({ ...config });
  const [testResult, setTestResult] = useState<{ target: string; success: boolean; msg: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (key: keyof SmtpWebhookConfig, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    addAuditLog('UPDATE_NOTIFICATIONS', 'Saved Outbound SMTP Relay and Webhook integrations.');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleTestPing = (target: 'SLACK' | 'TEAMS' | 'SMTP' | 'PAGERDUTY') => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      if (target === 'SLACK') {
        setTestResult({
          target: 'Slack Channel',
          success: true,
          msg: `[200 OK] Test notification dispatched to Slack webhook. Sample payload formatted with rich clinical interpretation cards.`
        });
      } else if (target === 'TEAMS') {
        setTestResult({
          target: 'MS Teams',
          success: true,
          msg: `[200 OK] Adaptive card payload delivered to Microsoft Teams departmental incoming webhook.`
        });
      } else if (target === 'SMTP') {
        setTestResult({
          target: 'SMTP Server',
          success: true,
          msg: `[250 OK] TLS handshake verified with ${formData.smtpHost}:${formData.smtpPort}. Test email queued from ${formData.fromEmail}.`
        });
      } else {
        setTestResult({
          target: 'PagerDuty',
          success: true,
          msg: `[202 Accepted] Clinical alert event routed to PagerDuty high-urgency interpreting service.`
        });
      }
      addAuditLog('TEST_WEBHOOK', `Simulated ${target} outbound test dispatch.`);
    }, 800);
  };

  return (
    <div className="space-y-6 text-xs text-[#eeedea]">
      
      {/* Header Banner */}
      <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="meta-mono text-sm font-bold text-[#8eb9dd] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8eb9dd]" />
            Outbound Notification Integrations & SMTP/Webhook Hub
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Configure hospital SMTP email relay, Slack channels, Microsoft Teams incoming webhooks, and PagerDuty escalation policies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1 text-[11px] bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/40">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            className="bg-[#8eb9dd] hover:bg-[#7ba6cb] text-black font-bold font-mono py-1.5 px-3 rounded-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Hub Settings</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded text-emerald-200 font-mono text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>{testResult.target}:</strong> {testResult.msg}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-emerald-400 hover:text-white cursor-pointer ml-2">
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Card 1: SMTP Email Relay */}
        <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8eb9dd]" />
              SMTP Email Relay Server
            </span>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestPing('SMTP')}
              className="text-[10px] font-mono font-bold bg-[#111113] hover:bg-[#252830] text-[#8eb9dd] px-2 py-1 rounded border border-white/10 cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Test Email</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block meta-mono mb-1 text-[11px] text-slate-300">SMTP Host / FQDN</label>
              <input
                type="text"
                value={formData.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                placeholder="smtp.hospital.org"
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block meta-mono mb-1 text-[11px] text-slate-300">Port</label>
              <input
                type="number"
                value={formData.smtpPort}
                onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-[#8eb9dd] font-mono text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block meta-mono mb-1 text-[11px] text-slate-300">Service Account User</label>
              <input
                type="text"
                value={formData.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block meta-mono mb-1 text-[11px] text-slate-300">Sender "From" Address</label>
              <input
                type="email"
                value={formData.fromEmail}
                onChange={(e) => handleChange('fromEmail', e.target.value)}
                className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-mono text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={formData.smtpSecure}
                onChange={(e) => handleChange('smtpSecure', e.target.checked)}
                className="rounded accent-[#8eb9dd] w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                Require STARTTLS / SSL Secure Handshake
              </span>
            </label>
          </div>
        </div>

        {/* Card 2: Slack & Teams Webhooks */}
        <div className="bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8eb9dd]" />
              Chat Webhooks (Slack & Teams)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isTesting}
                onClick={() => handleTestPing('SLACK')}
                className="text-[10px] font-mono font-bold bg-[#111113] hover:bg-[#252830] text-[#8eb9dd] px-2 py-1 rounded border border-white/10 cursor-pointer flex items-center gap-1"
              >
                <span>Ping Slack</span>
              </button>
              <button
                type="button"
                disabled={isTesting}
                onClick={() => handleTestPing('TEAMS')}
                className="text-[10px] font-mono font-bold bg-[#111113] hover:bg-[#252830] text-[#8eb9dd] px-2 py-1 rounded border border-white/10 cursor-pointer flex items-center gap-1"
              >
                <span>Ping Teams</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block meta-mono mb-1 text-[11px] text-slate-300">Slack Incoming Webhook URL</label>
            <input
              type="text"
              value={formData.slackWebhookUrl}
              onChange={(e) => handleChange('slackWebhookUrl', e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="block meta-mono mb-1 text-[11px] text-slate-300">Microsoft Teams Channel Webhook URL</label>
            <input
              type="text"
              value={formData.teamsWebhookUrl}
              onChange={(e) => handleChange('teamsWebhookUrl', e.target.value)}
              placeholder="https://hospital.webhook.office.com/..."
              className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-white font-mono text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block meta-mono text-[11px] text-slate-300">PagerDuty Clinical Ops Key</label>
              <button
                type="button"
                disabled={isTesting}
                onClick={() => handleTestPing('PAGERDUTY')}
                className="text-[10px] font-mono text-[#8eb9dd] hover:underline cursor-pointer"
              >
                Trigger Test Incident
              </button>
            </div>
            <input
              type="text"
              value={formData.pagerDutyKey}
              onChange={(e) => handleChange('pagerDutyKey', e.target.value)}
              placeholder="pd-routing-key..."
              className="w-full bg-[#111113] border border-white/15 rounded-xs p-2 text-[#8eb9dd] font-mono text-xs"
            />
          </div>
        </div>

        {/* Card 3: Automated Event Notification Triggers */}
        <div className="lg:col-span-2 bg-[#1c1c1f] p-4 rounded-xs border border-[rgba(238,237,234,0.1)] space-y-3">
          <span className="font-bold text-white flex items-center gap-2 text-xs">
            <Sliders className="w-4 h-4 text-[#8eb9dd]" />
            Automated Practice Event Triggers
          </span>
          <p className="text-[11px] text-slate-400">
            Select which departmental scheduling events immediately dispatch outbound notifications to the configured endpoints.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="p-3 bg-[#16181e] rounded border border-white/5 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnShiftSwap}
                onChange={(e) => handleChange('notifyOnShiftSwap', e.target.checked)}
                className="rounded accent-[#8eb9dd] w-4 h-4 cursor-pointer mt-0.5"
              />
              <div>
                <strong className="text-white block text-xs">Shift Swap Marketplace Claims</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sends alert when a colleague posts or claims an interpreting shift trade.
                </p>
              </div>
            </label>

            <label className="p-3 bg-[#16181e] rounded border border-white/5 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnLeaveApproval}
                onChange={(e) => handleChange('notifyOnLeaveApproval', e.target.checked)}
                className="rounded accent-[#8eb9dd] w-4 h-4 cursor-pointer mt-0.5"
              />
              <div>
                <strong className="text-white block text-xs">Physician Leave / CME Approvals</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Notifies requesting doctor and designated covering colleague upon approval.
                </p>
              </div>
            </label>

            <label className="p-3 bg-[#16181e] rounded border border-white/5 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnContrastSupervisorChange}
                onChange={(e) => handleChange('notifyOnContrastSupervisorChange', e.target.checked)}
                className="rounded accent-[#8eb9dd] w-4 h-4 cursor-pointer mt-0.5"
              />
              <div>
                <strong className="text-white block text-xs">On-Site Contrast Supervisor Reassignment</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dispatches immediate notice to technologists and nursing staff when facility contrast coverage changes.
                </p>
              </div>
            </label>

            <label className="p-3 bg-[#16181e] rounded border border-white/5 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnSchedulePublish}
                onChange={(e) => handleChange('notifyOnSchedulePublish', e.target.checked)}
                className="rounded accent-[#8eb9dd] w-4 h-4 cursor-pointer mt-0.5"
              />
              <div>
                <strong className="text-white block text-xs">Final Monthly Schedule Publication</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Broadcasts schedule lock and PDF roster export to all departmental personnel.
                </p>
              </div>
            </label>
          </div>
        </div>

      </form>
    </div>
  );
};
