import { test, expect } from "@playwright/test"

test.describe("Game Completion E2E", () => {
  test("should play a complete round optimally until winning", async ({
    page,
  }) => {
    // Start the dev server and navigate to the game
    await page.goto("http://localhost:5173/")

    // Wait for the game to be initialized (the component has a 500ms delay)
    await page.waitForTimeout(1000)

    // Verify the game board is visible
    await expect(page.locator("main")).toBeVisible()

    // Verify the game is loaded by checking grid structure
    const gridInfo = await page.evaluate(() => {
      // Access the Vue app instance to get the solution
      const app = document.querySelector("main")
      if (!app) return null

      // Find all grid cells (excluding hint cells)
      const gridContainer = app.querySelector("div:has(> div.flex)")
      if (!gridContainer) return null

      // Get rows and columns by counting the grid cells
      const rows = gridContainer.querySelectorAll(".flex")
      const rowCount = rows.length - 1 // Exclude header row with column hints

      if (rowCount === 0) return null

      const firstRow = rows[1] // Skip header row
      const cellsInRow = firstRow.querySelectorAll(".w-7.h-7")
      const colCount = cellsInRow.length

      return { rowCount, colCount }
    })

    expect(gridInfo).not.toBeNull()

    // Extract hints from the page and solve the puzzle
    const hints = await page.evaluate(() => {
      const app = document.querySelector("main")
      if (!app) return null

      // Get row hints
      const rowHints: number[][] = []
      const rowHintElements = app.querySelectorAll(
        ".flex.items-center.justify-end.border p",
      )
      rowHintElements.forEach((element) => {
        const hintText = element.textContent?.trim() || "0"
        const hints = hintText.split(" ").map((n) => parseInt(n))
        rowHints.push(hints)
      })

      // Get column hints
      const columnHints: number[][] = []
      const columnHintDivs = app.querySelectorAll(
        ".flex.flex-col.justify-end.w-7.border.text-center",
      )
      columnHintDivs.forEach((div) => {
        const hints: number[] = []
        const hintElements = div.querySelectorAll("div")
        hintElements.forEach((el) => {
          const hint = parseInt(el.textContent?.trim() || "0")
          hints.push(hint)
        })
        if (hints.length === 0) {
          const text = div.textContent?.trim() || "0"
          hints.push(parseInt(text))
        }
        columnHints.push(hints)
      })

      return { rowHints, columnHints }
    })

    expect(hints).not.toBeNull()
    expect(hints!.rowHints.length).toBeGreaterThan(0)
    expect(hints!.columnHints.length).toBeGreaterThan(0)

    // Solve the puzzle using the nonogram solver
    const solution = solveNonogram(hints!.rowHints, hints!.columnHints)
    expect(solution).not.toBeNull()

    // Get all grid cells (the actual playable cells, not hint cells)
    const gridCells = page.locator(".w-7.h-7.border.transition")
    const cellCount = await gridCells.count()
    expect(cellCount).toBeGreaterThan(0)

    const rows = solution!.length
    const cols = solution![0].length

    // Click cells according to the solution
    let cellIndex = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (solution?.[row]?.[col] === 1) {
          // Click the cell to fill it
          await gridCells.nth(cellIndex).click()
        }
        cellIndex++
      }
    }

    // Wait a bit for the validation to run
    await page.waitForTimeout(500)

    // Check if the game is solved - the "new" button should have a green background
    const newButton = page.locator("button", { hasText: "new" })
    await expect(newButton).toHaveClass(/bg-lime-700/)

    // The timer should have stopped and should show milliseconds
    const timer = page.locator("time")
    const timerText = await timer.textContent()
    expect(timerText).toMatch(/\d{2}:\d{2}:\d+/) // Format: MM:SS:MS

    // The share button should be visible
    await expect(page.locator("button", { hasText: "share" })).toBeVisible()

    // Verify the grid border changed (becomes border-2 when solved)
    const gridContainer = page.locator("div.border-2")
    await expect(gridContainer).toBeVisible()
  })
})

/**
 * Comprehensive nonogram solver using constraint propagation and backtracking
 */
function solveNonogram(
  rowHints: number[][],
  columnHints: number[][],
): number[][] | null {
  const rows = rowHints.length
  const cols = columnHints.length

  // Initialize grid with unknowns (-1)
  const grid: number[][] = Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(-1))

  // Use constraint propagation first
  let changed = true
  let iterations = 0
  const maxIterations = 100

  while (changed && iterations < maxIterations) {
    changed = false
    iterations++

    // Solve rows
    for (let row = 0; row < rows; row++) {
      const oldLine = [...grid[row]]
      const newLine = solveLine(rowHints[row], oldLine)
      for (let col = 0; col < cols; col++) {
        if (oldLine[col] === -1 && newLine[col] !== -1) {
          grid[row][col] = newLine[col]
          changed = true
        }
      }
    }

    // Solve columns
    for (let col = 0; col < cols; col++) {
      const oldLine = grid.map((row) => row[col])
      const newLine = solveLine(columnHints[col], oldLine)
      for (let row = 0; row < rows; row++) {
        if (oldLine[row] === -1 && newLine[row] !== -1) {
          grid[row][col] = newLine[row]
          changed = true
        }
      }
    }
  }

  // If still unsolved, use backtracking
  if (grid.some((row) => row.some((cell) => cell === -1))) {
    return backtrackSolve(grid, rowHints, columnHints, 0, 0)
  }

  return grid
}

/**
 * Solve a single line using constraint propagation
 */
function solveLine(hints: number[], line: number[]): number[] {
  const result = [...line]
  const length = line.length

  // Special case: hints = [0] means all empty
  if (hints.length === 1 && hints[0] === 0) {
    return Array(length).fill(0)
  }

  // Generate all possible valid solutions for this line
  const possibleLines = generateAllValidLines(hints, length)

  // Filter out solutions that conflict with known cells
  const validLines = possibleLines.filter((possible) => {
    for (let i = 0; i < length; i++) {
      if (line[i] !== -1 && line[i] !== possible[i]) {
        return false
      }
    }
    return true
  })

  // Find cells that have the same value in all valid solutions
  if (validLines.length > 0) {
    for (let i = 0; i < length; i++) {
      if (result[i] === -1) {
        const firstValue = validLines[0][i]
        const allSame = validLines.every((line) => line[i] === firstValue)
        if (allSame) {
          result[i] = firstValue
        }
      }
    }
  }

  return result
}

/**
 * Generate all possible valid arrangements of hints in a line
 */
function generateAllValidLines(hints: number[], length: number): number[][] {
  const results: number[][] = []

  // Calculate minimum space needed
  const minSpace = hints.reduce((sum, h) => sum + h, 0) + hints.length - 1
  if (minSpace > length) {
    return [] // Impossible to fit
  }

  function generate(
    hintIndex: number,
    position: number,
    currentLine: number[],
  ) {
    // Base case: all hints placed
    if (hintIndex === hints.length) {
      // Fill remaining cells with 0
      const line = [...currentLine]
      while (line.length < length) {
        line.push(0)
      }
      results.push(line)
      return
    }

    const hint = hints[hintIndex]
    const remainingHints = hints.slice(hintIndex + 1)
    const spaceNeeded =
      remainingHints.reduce((sum, h) => sum + h, 0) + remainingHints.length

    // Try all valid positions for this hint
    const maxPos = length - hint - spaceNeeded
    for (let pos = position; pos <= maxPos; pos++) {
      const line = [...currentLine]

      // Add empty cells before this block
      while (line.length < pos) {
        line.push(0)
      }

      // Add the block of filled cells
      for (let i = 0; i < hint; i++) {
        line.push(1)
      }

      // Add separator if not the last hint
      if (hintIndex < hints.length - 1) {
        line.push(0)
        generate(hintIndex + 1, line.length, line)
      } else {
        generate(hintIndex + 1, line.length, line)
      }
    }
  }

  generate(0, 0, [])
  return results
}

/**
 * Backtracking solver for when constraint propagation isn't enough
 */
function backtrackSolve(
  grid: number[][],
  rowHints: number[][],
  columnHints: number[][],
  row: number,
  col: number,
): number[][] | null {
  const rows = grid.length
  const cols = grid[0].length

  // Find next unknown cell
  let r = row
  let c = col
  let found = false

  for (let i = r; i < rows && !found; i++) {
    for (let j = i === r ? c : 0; j < cols; j++) {
      if (grid[i][j] === -1) {
        r = i
        c = j
        found = true
        break
      }
    }
  }

  // If no unknown cells, check if solution is valid
  if (!found) {
    if (isValidSolution(grid, rowHints, columnHints)) {
      return grid.map((row) => [...row])
    }
    return null
  }

  // Try filling the cell with 0 or 1
  for (const value of [0, 1]) {
    grid[r][c] = value

    // Check if this is still valid
    if (isPartiallyValid(grid, rowHints, columnHints, r, c)) {
      const nextCol = c + 1
      const nextRow = nextCol >= cols ? r + 1 : r
      const result = backtrackSolve(
        grid,
        rowHints,
        columnHints,
        nextRow,
        nextCol % cols,
      )
      if (result) {
        return result
      }
    }

    grid[r][c] = -1 // Backtrack
  }

  return null
}

/**
 * Check if a line is valid given its hints
 */
function isLineValid(line: number[], hints: number[]): boolean {
  // Special case: hints = [0] means no filled cells
  if (hints.length === 1 && hints[0] === 0) {
    return line.every((cell) => cell === 0 || cell === -1)
  }

  const groups: number[] = []
  let currentGroup = 0

  for (const cell of line) {
    if (cell === 1) {
      currentGroup++
    } else if (cell === 0) {
      if (currentGroup > 0) {
        groups.push(currentGroup)
        currentGroup = 0
      }
    } else {
      // Unknown cell (-1) - can't fully validate
      return true
    }
  }

  if (currentGroup > 0) {
    groups.push(currentGroup)
  }

  // Check if groups match hints
  if (groups.length !== hints.length) {
    return false
  }

  for (let i = 0; i < hints.length; i++) {
    if (groups[i] !== hints[i]) {
      return false
    }
  }

  return true
}

/**
 * Check if partially filled grid is still valid
 */
function isPartiallyValid(
  grid: number[][],
  rowHints: number[][],
  columnHints: number[][],
  lastRow: number,
  lastCol: number,
): boolean {
  // Check the affected row
  const row = grid[lastRow]
  if (!row.includes(-1) && !isLineValid(row, rowHints[lastRow])) {
    return false
  }

  // Check the affected column
  const col = grid.map((r) => r[lastCol])
  if (!col.includes(-1) && !isLineValid(col, columnHints[lastCol])) {
    return false
  }

  return true
}

/**
 * Check if complete solution is valid
 */
function isValidSolution(
  grid: number[][],
  rowHints: number[][],
  columnHints: number[][],
): boolean {
  // Check all rows
  for (let r = 0; r < grid.length; r++) {
    if (!isLineValid(grid[r], rowHints[r])) {
      return false
    }
  }

  // Check all columns
  for (let c = 0; c < grid[0].length; c++) {
    const col = grid.map((row) => row[c])
    if (!isLineValid(col, columnHints[c])) {
      return false
    }
  }

  return true
}
