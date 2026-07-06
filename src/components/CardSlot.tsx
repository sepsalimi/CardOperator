import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { NumberCard } from '../game/types';

interface Props {
  index: number;
  card?: NumberCard;
  selected: boolean;
  feedback: 'idle' | 'correct' | 'incorrect';
  onClick: () => void;
}

export function CardSlot({ index, card, selected, feedback, onClick }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${index}` });
  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      className={`card-slot ${card ? 'filled' : ''} ${selected ? 'selected' : ''} ${isOver ? 'over' : ''} ${feedback}`}
      onClick={onClick}
      animate={feedback === 'incorrect' ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.34 }}
      aria-label={
        card ? `Slot ${index + 1}, number ${card.value}. Tap to remove.` : `Empty slot ${index + 1}`
      }
    >
      {card ? <span>{card.value}</span> : <span className="slot-plus">+</span>}
    </motion.button>
  );
}
