export function formatTimeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `${diffMins} דק'`;
  if (diffHours < 24) return `${diffHours} שעות`;
  if (diffDays === 1) return 'אתמול';
  return `${diffDays} ימים`;
}
