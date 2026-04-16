import { validateLine } from "./validators"

/**
 * Compute hints from a single row or column of the solution.
 * Returns groups of consecutive filled cells (1s), or [0] if the line is empty.
 */
function computeLineHints(line: number[]): number[] {
  const groups: number[] = []
  let count = 0

  for (const val of line) {
    if (val === 1) {
      count++
    } else {
      if (count > 0) {
        groups.push(count)
        count = 0
      }
    }
  }

  if (count > 0) groups.push(count)
  return groups.length > 0 ? groups : [0]
}

/**
 * Compute row hints from a solution grid.
 */
export function computeRowHints(solution: number[][]): number[][] {
  return solution.map((row) => computeLineHints(row))
}

/**
 * Compute column hints from a solution grid.
 */
export function computeColumnHints(solution: number[][]): number[][] {
  if (solution.length === 0) return []
  const cols = solution[0].length
  const hints: number[][] = []
  for (let j = 0; j < cols; j++) {
    hints.push(computeLineHints(solution.map((row) => row[j])))
  }
  return hints
}

/**
 * Minimum cells needed to fit hints[fromIndex..end] in a line
 * (each group separated by at least one gap).
 */
function minSpaceForHints(hints: number[], fromIndex: number): number {
  if (fromIndex >= hints.length) return 0
  let space = hints[fromIndex]
  for (let i = fromIndex + 1; i < hints.length; i++) {
    space += 1 + hints[i]
  }
  return space
}

/**
 * Check whether a partial line (cells placed so far, each 0 or 1) is still
 * consistent with the given hints and can be completed within totalLength cells.
 */
function isPartialLineConsistent(
  hints: number[],
  partialValues: number[],
  totalLength: number,
): boolean {
  const remaining = totalLength - partialValues.length
  const isSoloZero = hints.length === 1 && hints[0] === 0

  if (isSoloZero) {
    return partialValues.every((v) => v === 0)
  }

  let hintIdx = 0
  let groupSize = 0

  for (const val of partialValues) {
    if (val === 1) {
      groupSize++
      if (hintIdx >= hints.length) return false // more groups than hints
      if (groupSize > hints[hintIdx]) return false // current group too large
    } else {
      if (groupSize > 0) {
        if (groupSize !== hints[hintIdx]) return false // closed group wrong size
        hintIdx++
        groupSize = 0
      }
    }
  }

  // Calculate minimum remaining space still needed
  let minNeeded: number
  if (groupSize > 0) {
    // Mid-group: finish it, then fit any subsequent hints
    const toComplete = hints[hintIdx] - groupSize
    const hasMoreHints = hintIdx + 1 < hints.length
    minNeeded =
      toComplete +
      (hasMoreHints ? 1 + minSpaceForHints(hints, hintIdx + 1) : 0)
  } else {
    minNeeded = minSpaceForHints(hints, hintIdx)
  }

  return remaining >= minNeeded
}

/**
 * Count valid solutions for a nonogram with the given hints using backtracking.
 * Stops after maxCount solutions are found (pass 2 to detect ambiguity cheaply).
 */
export function countNonogramSolutions(
  rowHints: number[][],
  columnHints: number[][],
  maxCount = 2,
): number {
  const rows = rowHints.length
  const cols = columnHints.length

  if (rows === 0 || cols === 0) return 0

  const grid: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0),
  )

  function backtrack(cellIndex: number): number {
    if (cellIndex === rows * cols) return 1

    const row = Math.floor(cellIndex / cols)
    const col = cellIndex % cols

    let count = 0

    for (const value of [0, 1] as const) {
      grid[row][col] = value

      // Row constraint check
      let valid: boolean
      if (col === cols - 1) {
        valid = validateLine(rowHints[row], grid[row])
      } else {
        valid = isPartialLineConsistent(
          rowHints[row],
          grid[row].slice(0, col + 1),
          cols,
        )
      }

      // Column constraint check
      if (valid) {
        const colPartial = grid.slice(0, row + 1).map((r) => r[col])
        if (row === rows - 1) {
          valid = validateLine(columnHints[col], colPartial)
        } else {
          valid = isPartialLineConsistent(columnHints[col], colPartial, rows)
        }
      }

      if (valid) {
        count += backtrack(cellIndex + 1)
        if (count >= maxCount) return count
      }
    }

    grid[row][col] = 0
    return count
  }

  return backtrack(0)
}

/**
 * Returns true if the nonogram described by the given hints has exactly one
 * valid solution.
 */
export function hasUniqueSolution(
  rowHints: number[][],
  columnHints: number[][],
): boolean {
  return countNonogramSolutions(rowHints, columnHints, 2) === 1
}
