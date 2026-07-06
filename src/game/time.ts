export function adjustDeadline(deadlineMs: number, deltaMs: number, nowMs: number): number {
  return Math.max(nowMs, deadlineMs + deltaMs);
}

export function remainingFromDeadline(deadlineMs: number, nowMs: number): number {
  return Math.max(0, deadlineMs - nowMs);
}
