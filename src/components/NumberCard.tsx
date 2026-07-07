import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { useRef, type PointerEvent } from 'react';
import type { NumberCard as NumberCardType } from '../game/types';

const TAP_MOVE_TOLERANCE_PX = 10;

interface Props {
  card: NumberCardType;
  disabled?: boolean;
  onClick: () => void;
}

interface PointerStart {
  x: number;
  y: number;
}

export function NumberCard({ card, disabled = false, onClick }: Props) {
  const pointerStartRef = useRef<PointerStart | null>(null);
  const skipNextClickRef = useRef(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled,
  });

  function handlePointerDownCapture(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === 'mouse') return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUpCapture(event: PointerEvent<HTMLButtonElement>) {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (disabled || event.pointerType === 'mouse' || !start) return;

    const movement = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (movement > TAP_MOVE_TOLERANCE_PX) return;

    skipNextClickRef.current = true;
    onClick();
    window.setTimeout(() => {
      skipNextClickRef.current = false;
    }, 0);
  }

  function handleClick() {
    if (skipNextClickRef.current) {
      skipNextClickRef.current = false;
      return;
    }

    onClick();
  }

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      className="number-card"
      disabled={disabled}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.35 : 1,
      }}
      onClick={handleClick}
      onPointerDownCapture={handlePointerDownCapture}
      onPointerUpCapture={handlePointerUpCapture}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.94 }}
      aria-label={`Number ${card.value}`}
      {...listeners}
      {...attributes}
    >
      <span className="card-spark" aria-hidden="true">
        ?
      </span>
      <span>{card.value}</span>
    </motion.button>
  );
}
