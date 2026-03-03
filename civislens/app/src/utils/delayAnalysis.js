/**
 * Analyze project delays based on fund_start_date and investment_term
 */

export function parseInvestmentTerm(term) {
  if (!term) return null;
  const str = String(term).replace(/\s/g, '');
  if (str.includes('-')) {
    const parts = str.split('-');
    return parseInt(parts[parts.length - 1], 10); // Use max value
  }
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? null : parsed;
}

export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function analyzeProjectDelay(project, today = new Date()) {
  const startDate = project.fund_start_date ? new Date(project.fund_start_date) : null;
  const termMonths = parseInvestmentTerm(project.investment_term);

  if (!startDate || !termMonths) {
    return { status: 'unknown', expectedEnd: null, daysDelayed: null, daysRemaining: null };
  }

  const expectedEnd = addMonths(startDate, termMonths);
  const diffMs = today - expectedEnd;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (project.status === 'CLOSED') {
    return { status: 'closed', expectedEnd, daysDelayed: null, daysRemaining: null };
  }

  if (diffDays > 0) {
    return { status: 'delayed', expectedEnd, daysDelayed: diffDays, daysRemaining: null };
  }

  return { status: 'on_time', expectedEnd, daysDelayed: null, daysRemaining: Math.abs(diffDays) };
}

export function getDelayStats(projects) {
  const today = new Date();

  const analyzed = projects.map(p => ({
    ...p,
    _delayAnalysis: analyzeProjectDelay(p, today),
  }));

  const delayed = analyzed.filter(p => p._delayAnalysis.status === 'delayed');
  const onTime = analyzed.filter(p => p._delayAnalysis.status === 'on_time');
  const closed = analyzed.filter(p => p._delayAnalysis.status === 'closed');
  const unknown = analyzed.filter(p => p._delayAnalysis.status === 'unknown');

  // Calculate delay buckets
  const delayBuckets = {
    '0-3 meses': 0,
    '3-6 meses': 0,
    '6-12 meses': 0,
    '12-24 meses': 0,
    '24+ meses': 0,
  };

  delayed.forEach(p => {
    const months = Math.floor(p._delayAnalysis.daysDelayed / 30);
    if (months < 3) delayBuckets['0-3 meses']++;
    else if (months < 6) delayBuckets['3-6 meses']++;
    else if (months < 12) delayBuckets['6-12 meses']++;
    else if (months < 24) delayBuckets['12-24 meses']++;
    else delayBuckets['24+ meses']++;
  });

  const totalActive = delayed.length + onTime.length;
  const delayRate = totalActive > 0 ? (delayed.length / totalActive) * 100 : 0;

  const avgDelayDays = delayed.length > 0
    ? delayed.reduce((sum, p) => sum + p._delayAnalysis.daysDelayed, 0) / delayed.length
    : 0;

  return {
    delayed,
    onTime,
    closed,
    unknown,
    delayBuckets,
    delayRate,
    avgDelayDays,
    avgDelayMonths: Math.floor(avgDelayDays / 30),
  };
}
