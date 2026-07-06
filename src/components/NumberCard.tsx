import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { NumberCard as NumberCardType } from '../game/types';

interface Props {
  card: NumberCardType;
  disabled?: boolean;
  onClick: () => void;
}

export function NumberCard({ card, disabled = false, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled,
  });

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      className="number-card"
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.35 : 1,
      }}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.94 }}
      aria-label={`Number ${card.value}`}
      {...listeners}
      {...attributes}
    >
      <span className="card-spark" aria-hidden="true">
        ✦
      </span>
      <span>{card.value}</span>
    </motion.button>
  );
}
