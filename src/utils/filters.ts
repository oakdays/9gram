export function removeZeros(hints: Array<number>[]): Array<number>[] {
  hints.forEach((hintGroup, index) => {
    hints[index] = hintGroup.filter((hint) => hint > 0)
    if (!hints[index].length) hints[index] = [0]
  })

  return hints
}
