export const initialStates = [];
export const initialStatesEnemy = [];
const size = 8;

for (let i = 0; i < size; i++) {
  initialStates.push(i * size);
  initialStates.push(i * size + 1);
  initialStatesEnemy.push((i + 1) * size - 1);
  initialStatesEnemy.push((i + 1) * size - 2);
}
