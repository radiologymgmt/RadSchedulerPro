import { 
  Shift, 
  StaffUser, 
  ClinicalSite, 
  LeaveRequest, 
  ComplianceRule, 
  ScheduleConflict 
} from '../types';

/**
 * Parses time window e.g. "07:30 - 16:00" into numeric start and end minutes from midnight.
 */
export function parseTimeWindow(hoursStr: string): { start: number; end: number } | null {
  if (!hoursStr) return null;
  const match = hoursStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const start = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  const end = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
  return { start, end };
}

/**
 * Checks if two time windows overlap
 */
export function doTimesOverlap(h1: string, h2: string): boolean {
  const t1 = parseTimeWindow(h1);
  const t2 = parseTimeWindow(h2);
  if (!t1 || !t2) return true; // If flexible or full day, assume overlap
  return Math.max(t1.start, t2.start) < Math.min(t1.end, t2.end);
}

/**
 * Evaluates real-time schedule conflicts across all shifts, staff, leaves, and rules.
 */
export function detectAllConflicts(
  shifts: Shift[],
  users: StaffUser[],
  sites: Record<string, ClinicalSite>,
  leaves: LeaveRequest[],
  rules: ComplianceRule[],
  filterDate?: string
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  // Group shifts by date
  const shiftsByDate: Record<string, Shift[]> = {};
  for (const s of shifts) {
    if (filterDate && s.date !== filterDate) continue;
    if (!shiftsByDate[s.date]) shiftsByDate[s.date] = [];
    shiftsByDate[s.date].push(s);
  }

  // Map users by ID for rapid lookup
  const userMap = new Map<string, StaffUser>();
  for (const u of users) {
    userMap.set(u.id, u);
  }

  // Iterate over each date
  for (const [date, dayShifts] of Object.entries(shiftsByDate)) {
    const dayOfWeek = new Date(date + 'T12:00:00Z').getUTCDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 1. WORKSTATION COLLISION: multiple providers on the same physical workstation at the same time
    const wsUsage: Record<string, Shift[]> = {};
    for (const shift of dayShifts) {
      if (shift.radId === 'NO_RAD_NEEDED') continue;
      if (shift.workstationId && shift.workstationId !== 'NO_WORKSTATION_REQUIRED' && !shift.workstationId.includes('HOME')) {
        if (!wsUsage[shift.workstationId]) wsUsage[shift.workstationId] = [];
        wsUsage[shift.workstationId].push(shift);
      }
    }

    for (const [wsId, wsShifts] of Object.entries(wsUsage)) {
      if (wsShifts.length > 1) {
        for (let i = 0; i < wsShifts.length; i++) {
          for (let j = i + 1; j < wsShifts.length; j++) {
            const s1 = wsShifts[i];
            const s2 = wsShifts[j];
            if (doTimesOverlap(s1.hours, s2.hours)) {
              const u1 = userMap.get(s1.radId)?.name || 'Provider A';
              const u2 = userMap.get(s2.radId)?.name || 'Provider B';
              conflicts.push({
                id: `conflict-ws-${date}-${wsId}-${s1.id}-${s2.id}`,
                type: 'WORKSTATION_COLLISION',
                severity: 'CRITICAL',
                date: date,
                site: s1.site,
                shiftId: s2.id,
                message: `Workstation Contention: ${wsId}`,
                details: `${u1} (${s1.hours}) and ${u2} (${s2.hours}) are simultaneously assigned to ${wsId} at ${s1.site}.`,
                suggestedAction: `Reassign ${u2} to an alternative open reading pod at ${s1.site} or adjust shift windows.`
              });
            }
          }
        }
      }
    }

    // 2. DOUBLE BOOKING & LOCATION CLASH
    const providerShifts: Record<string, Shift[]> = {};
    for (const shift of dayShifts) {
      if (shift.radId === 'NO_RAD_NEEDED') continue;
      if (!providerShifts[shift.radId]) providerShifts[shift.radId] = [];
      providerShifts[shift.radId].push(shift);
    }

    for (const [radId, pShifts] of Object.entries(providerShifts)) {
      if (pShifts.length > 1) {
        const user = userMap.get(radId);
        const name = user?.name || 'Staff Provider';

        for (let i = 0; i < pShifts.length; i++) {
          for (let j = i + 1; j < pShifts.length; j++) {
            const s1 = pShifts[i];
            const s2 = pShifts[j];

            // If they are at different physical sites and not marked as a clean split
            if (s1.site !== s2.site && (!s1.isSplit || !s2.isSplit)) {
              conflicts.push({
                id: `conflict-site-double-${date}-${radId}-${s1.id}-${s2.id}`,
                type: 'DOUBLE_BOOKING',
                severity: 'CRITICAL',
                date: date,
                site: s1.site,
                radId: radId,
                shiftId: s2.id,
                message: `Dual Facility Assignment: ${name}`,
                details: `${name} is scheduled at two distinct physical facilities on ${date}: ${s1.site} and ${s2.site}.`,
                suggestedAction: `Consolidate shifts into a single facility or enable 'Split Assignment' with distinct time blocks.`
              });
            } else if (doTimesOverlap(s1.hours, s2.hours)) {
              conflicts.push({
                id: `conflict-overlap-${date}-${radId}-${s1.id}-${s2.id}`,
                type: 'DOUBLE_BOOKING',
                severity: 'CRITICAL',
                date: date,
                site: s1.site,
                radId: radId,
                shiftId: s2.id,
                message: `Overlapping Shifts: ${name}`,
                details: `${name} has overlapping reading hours (${s1.hours} vs ${s2.hours}) on ${date}.`,
                suggestedAction: `Adjust the hours or remove the duplicate shift entry.`
              });
            }
          }
        }
      }
    }

    // 3. LEAVE / PTO OVERLAP
    for (const shift of dayShifts) {
      if (shift.radId === 'NO_RAD_NEEDED') continue;
      const matchingLeave = leaves.find(l => 
        l.radId === shift.radId && 
        l.status === 'Approved' && 
        date >= l.startDate && 
        date <= l.endDate
      );

      if (matchingLeave) {
        const user = userMap.get(shift.radId);
        const name = user?.name || 'Provider';
        conflicts.push({
          id: `conflict-leave-${date}-${shift.id}-${matchingLeave.id}`,
          type: 'LEAVE_OVERLAP',
          severity: 'CRITICAL',
          date: date,
          site: shift.site,
          radId: shift.radId,
          shiftId: shift.id,
          message: `Scheduled During Approved Leave: ${name}`,
          details: `${name} has approved ${matchingLeave.category} (${matchingLeave.startDate} to ${matchingLeave.endDate}) but is scheduled for ${shift.specialty} at ${shift.site}.`,
          suggestedAction: `Reassign shift to backup colleague ${matchingLeave.backupDoc || 'Pool'} or unassign provider.`
        });
      }
    }

    // 4. MISSING ON-SITE CONTRAST SUPERVISOR
    // Check every physical site that requires contrast supervision
    for (const [siteKey, siteObj] of Object.entries(sites)) {
      if (siteKey === 'REMOTE' || siteKey === 'NO_ASSIGNMENT' || !siteObj.requiresContrast) continue;

      const activeShiftsAtSite = dayShifts.filter(s => s.site === siteKey && s.radId !== 'NO_RAD_NEEDED');
      if (activeShiftsAtSite.length > 0) {
        const supervisorShift = activeShiftsAtSite.find(s => s.isSupervisor);
        if (!supervisorShift) {
          conflicts.push({
            id: `conflict-contrast-${date}-${siteKey}`,
            type: 'MISSING_CONTRAST_SUPERVISOR',
            severity: 'CRITICAL',
            date: date,
            site: siteKey,
            message: `Missing Contrast Supervisor: ${siteObj.label || siteKey}`,
            details: `Active imaging is scheduled at ${siteObj.name} on ${date}, but no credentialed On-Site Contrast Supervisor is designated.`,
            suggestedAction: `Designate one of the on-site radiologists or credentialed APs as the physical Contrast Supervisor.`
          });
        }
      }
    }

    // 5. ADVANCED PRACTITIONER (RPA) SUPERVISION OVERSIGHT
    // In radiology, RPAs / NPs doing procedures or contrast supervision must have an Attending Radiologist on-site or in-network
    const apShiftsAtSite: Record<string, Shift[]> = {};
    const mdShiftsAtSite: Record<string, Shift[]> = {};

    for (const shift of dayShifts) {
      if (shift.radId === 'NO_RAD_NEEDED') continue;
      const user = userMap.get(shift.radId);
      if (user?.role === 'ADVANCED_PRACTITIONER') {
        if (!apShiftsAtSite[shift.site]) apShiftsAtSite[shift.site] = [];
        apShiftsAtSite[shift.site].push(shift);
      } else if (user?.role === 'ATTENDING_RAD' || user?.role === 'CHIEF' || user?.role === 'ADMIN') {
        if (!mdShiftsAtSite[shift.site]) mdShiftsAtSite[shift.site] = [];
        mdShiftsAtSite[shift.site].push(shift);
      }
    }

    for (const [siteKey, apList] of Object.entries(apShiftsAtSite)) {
      if (siteKey === 'REMOTE' || siteKey === 'NO_ASSIGNMENT') continue;
      const mdList = mdShiftsAtSite[siteKey] || [];

      if (mdList.length === 0) {
        for (const apShift of apList) {
          const apUser = userMap.get(apShift.radId);
          conflicts.push({
            id: `conflict-ap-unsupervised-${date}-${siteKey}-${apShift.id}`,
            type: 'AP_UNSUPERVISED',
            severity: 'CRITICAL',
            date: date,
            site: siteKey,
            radId: apShift.radId,
            shiftId: apShift.id,
            message: `Unsupervised Advanced Practitioner: ${apUser?.name || 'RPA'}`,
            details: `${apUser?.name} (${apUser?.title || 'RPA'}) is performing ${apShift.procedureType || apShift.modality} at ${siteKey} with NO Attending Radiologist (MD/DO) physically on-site.`,
            suggestedAction: `Assign an Attending Radiologist to ${siteKey} on ${date} for supervisory compliance.`
          });
        }
      }
    }

    // 6. SPECIALTY QUOTA DEFICITS (e.g. at least 1 Neuro and 1 Breast on weekdays)
    for (const rule of rules) {
      let isApplicable = false;
      if (rule.days === 'EVERYDAY') isApplicable = true;
      else if (rule.days === 'WEEKDAYS' && isWeekday) isApplicable = true;
      else if (rule.days === 'WEEKENDS' && isWeekend) isApplicable = true;

      if (!isApplicable) continue;

      if (rule.type === 'SPECIALTY_QUOTA') {
        const count = dayShifts.filter(s => s.specialty === rule.target && s.radId !== 'NO_RAD_NEEDED').length;
        if (count < rule.minCount) {
          conflicts.push({
            id: `conflict-quota-${date}-${rule.target}`,
            type: 'SPECIALTY_QUOTA_DEFICIT',
            severity: 'WARNING',
            date: date,
            message: `Subspecialty Quota Shortfall: ${rule.target}`,
            details: `Required minimum readers for ${rule.target} is ${rule.minCount}, but currently ${count} reader(s) scheduled on ${date}.`,
            suggestedAction: `Assign an additional ${rule.target} specialist or cross-cover from teleradiology pool.`
          });
        }
      }
    }

    // 7. PURE OUTPATIENT OPERATING HOURS ENFORCEMENT
    // Standard operating window: Mon-Fri (07:00-19:00), Sat (08:00-13:00), Sun closed
    for (const shift of dayShifts) {
      if (shift.radId === 'NO_RAD_NEEDED') continue;
      const tw = parseTimeWindow(shift.hours);

      // Sunday Check: Pure Outpatient org is closed on Sundays (no inpatient/ER coverage)
      if (dayOfWeek === 0) {
        conflicts.push({
          id: `conflict-op-sun-${date}-${shift.id}`,
          type: 'OPERATING_HOURS_VIOLATION',
          severity: 'CRITICAL',
          date: date,
          site: shift.site,
          radId: shift.radId,
          shiftId: shift.id,
          message: `Sunday Shift Prohibited (Outpatient Org Closed)`,
          details: `Pure Outpatient constraint: No Sunday clinical operations. Shift #${shift.id} is scheduled outside operational charter.`,
          suggestedAction: `Move shift to Monday–Saturday outpatient operating window.`
        });
      } else if (dayOfWeek === 6) {
        // Saturday Check: 08:00 to 13:00 (480 to 780 mins)
        if (tw && (tw.start < 480 || tw.end > 780)) {
          conflicts.push({
            id: `conflict-op-sat-${date}-${shift.id}`,
            type: 'OPERATING_HOURS_VIOLATION',
            severity: 'WARNING',
            date: date,
            site: shift.site,
            radId: shift.radId,
            shiftId: shift.id,
            message: `Saturday Operating Window Exceeded (${shift.hours})`,
            details: `Saturday outpatient center operating window is strictly 08:00–13:00. Shift extends beyond clinic closing hours.`,
            suggestedAction: `Adjust Saturday clinic hours to fall within 08:00–13:00.`
          });
        }
      } else {
        // Weekday Mon-Fri: 07:00 to 19:00 (420 to 1140 mins)
        if (tw && (tw.start < 420 || tw.end > 1140)) {
          conflicts.push({
            id: `conflict-op-wk-${date}-${shift.id}`,
            type: 'OPERATING_HOURS_VIOLATION',
            severity: 'CRITICAL',
            date: date,
            site: shift.site,
            radId: shift.radId,
            shiftId: shift.id,
            message: `Outpatient Hours Exceeded (${shift.hours})`,
            details: `Outpatient operations are restricted to 07:00–19:00. Pure outpatient practice has NO inpatient or overnight call.`,
            suggestedAction: `Reschedule hours to fall within 07:00–19:00.`
          });
        }
      }

      // 8. MQSA MAMMOGRAPHY SUBSPECIALTY QUALIFICATION
      // Mammography / Breast imaging requires dedicated MQSA-certified readers
      if (shift.specialty === 'Breast' || shift.specialty === 'Breast MRI' || shift.modality.toLowerCase().includes('mammo')) {
        const rad = userMap.get(shift.radId);
        const isQualified = rad?.isMqsaQualified || rad?.specialties.includes('Breast') || rad?.specialties.includes('Breast MRI');
        if (!isQualified && (rad?.role === 'ATTENDING_RAD' || rad?.role === 'CHIEF')) {
          conflicts.push({
            id: `conflict-mqsa-${date}-${shift.id}`,
            type: 'MQSA_MAMMOGRAPHY_VIOLATION',
            severity: 'CRITICAL',
            date: date,
            site: shift.site,
            radId: shift.radId,
            shiftId: shift.id,
            message: `MQSA Credentialing Breach: ${rad?.name || 'Reader'}`,
            details: `FDA/MQSA mandates dedicated qualified breast imaging readers. ${rad?.name} does not hold active MQSA mammography credentials.`,
            suggestedAction: `Reassign Breast/Mammo shift to an MQSA-qualified radiologist (e.g. Dr. Rostova or Dr. Foster).`
          });
        }
      }
    }
  }

  // 9. POST-SHIFT FATIGUE GUARDRAILS:
  // Enforce maximum of 5 consecutive full-day reader shifts per radiologist unless explicitly waived
  const allActiveDates = Array.from(new Set(shifts.filter(s => s.radId !== 'NO_RAD_NEEDED').map(s => s.date))).sort();
  
  for (const user of users) {
    if (user.role !== 'ATTENDING_RAD' && user.role !== 'ADVANCED_PRACTITIONER') continue;

    const userShifts = shifts.filter(s => s.radId === user.id);
    const userShiftDates = new Set(userShifts.map(s => s.date));

    // Scan for consecutive runs of dates
    const sortedUserDates = Array.from(userShiftDates).sort();
    let consecutiveCount = 0;
    let runDates: string[] = [];

    for (let i = 0; i < sortedUserDates.length; i++) {
      const curDateStr = sortedUserDates[i];
      if (i === 0) {
        consecutiveCount = 1;
        runDates = [curDateStr];
      } else {
        const prevDate = new Date(sortedUserDates[i - 1] + 'T00:00:00Z');
        const curDate = new Date(curDateStr + 'T00:00:00Z');
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          consecutiveCount++;
          runDates.push(curDateStr);
        } else {
          consecutiveCount = 1;
          runDates = [curDateStr];
        }
      }

      if (consecutiveCount > 5) {
        // Check if any shift in this run has isFatigueWaived
        const isWaived = userShifts.some(s => runDates.includes(s.date) && s.isFatigueWaived);
        if (!isWaived) {
          const offendingDate = curDateStr;
          if (!filterDate || filterDate === offendingDate) {
            conflicts.push({
              id: `conflict-fatigue-${user.id}-${offendingDate}`,
              type: 'FATIGUE_OVERLOAD',
              severity: 'WARNING',
              date: offendingDate,
              radId: user.id,
              message: `Fatigue Guardrail: ${user.name} (${consecutiveCount} Consecutive Shifts)`,
              details: `Post-shift fatigue guardrail: ${user.name} is scheduled for ${consecutiveCount} consecutive days without a rest day (Max allowed: 5 days).`,
              suggestedAction: `Introduce a rest day, substitute with a remote teleradiology reader, or apply an authorized fatigue waiver.`
            });
          }
        }
      }
    }
  }

  return conflicts;
}
