export async function logUserEvent(eventType: string, eventData: any = {}) {
  // Static site - just log to console
  console.log('[Event]', eventType, eventData);
} 