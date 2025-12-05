// ID generation utilities for @msw/data v1.x
// Since primaryKey() no longer exists, we handle ID generation here

let idCounter = 1;

export function generateId() {
  return String(idCounter++);
}

export function resetIdCounter() {
  idCounter = 1;
}
