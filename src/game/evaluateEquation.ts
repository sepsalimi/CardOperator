import type { Operator } from './types';

function apply(left: number, operator: Operator, right: number): number {
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '*') return left * right;
  if (right === 0 || left % right !== 0) throw new Error('Division must produce a whole number');
  return left / right;
}

export function evaluateEquation(
  values: [number, number, number],
  operators: [Operator, Operator],
): number {
  const numbers = [...values];
  const ops = [...operators];

  for (let index = 0; index < ops.length;) {
    if (ops[index] === '*' || ops[index] === '/') {
      numbers.splice(index, 2, apply(numbers[index], ops[index], numbers[index + 1]));
      ops.splice(index, 1);
    } else index += 1;
  }

  return ops.reduce(
    (result, operator, index) => apply(result, operator, numbers[index + 1]),
    numbers[0],
  );
}
