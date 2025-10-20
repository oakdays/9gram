export function validateLine(
  hints: Array<number>,
  values: Array<number>,
): boolean {
  const isSoloZero = hints.length === 1 && hints[0] === 0

  // Handle special case: hints = [0] means no filled cells allowed
  if (isSoloZero) {
    return values.every((val) => val === 0 || val === 2)
  }

  // Track consecutive filled cells and compare against hints
  const consecutiveGroups: number[] = []
  let currentGroupSize = 0

  for (let i = 0; i < values.length; i++) {
    const cellValue = values[i]

    if (cellValue === 1) {
      // Filled cell
      currentGroupSize++
    } else {
      // Empty or marked cell (0 or 2)
      if (currentGroupSize > 0) {
        consecutiveGroups.push(currentGroupSize)
        currentGroupSize = 0
      }
    }
  }

  // Don't forget the last group if line ends with filled cells
  if (currentGroupSize > 0) {
    consecutiveGroups.push(currentGroupSize)
  }

  // Must have exact same number of groups as hints
  if (consecutiveGroups.length !== hints.length) {
    return false
  }

  // Each group must match its corresponding hint exactly
  for (let i = 0; i < hints.length; i++) {
    if (consecutiveGroups[i] !== hints[i]) {
      return false
    }
  }

  return true
}
