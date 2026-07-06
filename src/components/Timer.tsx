interface Props {
  remainingMs: number;
}

export function Timer({ remainingMs }: Props) {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const progress = Math.max(0, remainingMs / 60_000);
  return (
    <div
      className={`timer ${seconds <= 10 ? 'urgent' : ''}`}
      aria-label={`${seconds} seconds remaining`}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="timer-track" cx="22" cy="22" r="18" />
        <circle
          className="timer-progress"
          cx="22"
          cy="22"
          r="18"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - progress}
        />
      </svg>
      <span>{seconds}</span>
    </div>
  );
}
