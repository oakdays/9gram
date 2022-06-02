export function validateLine(
  hints: Array<number>,
  values: Array<number>
): boolean {
  let currentHint = hints[0]
  let currentHintIndex = 0
  let consecutiveActiveCells = 0

  const isSoloZero = hints.length === 1 && hints[0] === 0
  let hasZerosOnly = true

  for (let i = 0; i < values.length; i++) {
    if (!values[i] || values[i] === 2) {
      if (!consecutiveActiveCells) continue

      if (currentHint !== consecutiveActiveCells) return false
      if (currentHintIndex === hints.length - 1) return true

      consecutiveActiveCells = 0
      currentHintIndex++
      currentHint = hints[currentHintIndex]
    } else {
      if (hasZerosOnly) hasZerosOnly = false
      consecutiveActiveCells++
    }

    if (i === values.length - 1) {
      if (currentHint !== consecutiveActiveCells) return false
      if (currentHintIndex === hints.length - 1) return true
      return false
    }
  }

  if (isSoloZero && hasZerosOnly) return true
  return false
}
