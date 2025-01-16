export function arrayFilledWith<T>(itemGenerator: () => T, numItems = 1): T[] {
  return Array(numItems)
    .fill(null)
    .map(() => itemGenerator());
}

export function shuffleArrayInPlace<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
