import { LIMITS } from '../config/features.js';

export function hasFullAccess(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.isPremium();
}

export function getLimits(user) {
  return hasFullAccess(user) ? LIMITS.premium : LIMITS.free;
}

export function resetUsageIfNeeded(usage) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const dayKey = now.toISOString().slice(0, 10);

  if (usage.downloadsMonthKey !== monthKey) {
    usage.resumeDownloads = 0;
    usage.downloadsMonthKey = monthKey;
  }
  if (usage.chatDayKey !== dayKey) {
    usage.chatMessagesToday = 0;
    usage.chatDayKey = dayKey;
  }
  return usage;
}
