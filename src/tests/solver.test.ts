import { describe, expect, it } from "vitest"
import {
  computeColumnHints,
  computeRowHints,
  countNonogramSolutions,
  hasUniqueSolution,
} from "@/utils/solver"

describe("solver", () => {
  describe("computeRowHints", () => {
    it("computes hints for a simple grid", () => {
      const solution = [
        [1, 1, 0],
        [0, 1, 1],
        [1, 0, 1],
      ]
      expect(computeRowHints(solution)).toEqual([[2], [2], [1, 1]])
    })

    it("returns [0] for an empty row", () => {
      expect(computeRowHints([[0, 0, 0]])).toEqual([[0]])
    })

    it("handles a fully filled row", () => {
      expect(computeRowHints([[1, 1, 1, 1]])).toEqual([[4]])
    })

    it("handles alternating cells", () => {
      expect(computeRowHints([[1, 0, 1, 0, 1]])).toEqual([[1, 1, 1]])
    })
  })

  describe("computeColumnHints", () => {
    it("computes hints for columns", () => {
      const solution = [
        [1, 0],
        [1, 1],
        [0, 1],
      ]
      expect(computeColumnHints(solution)).toEqual([[2], [2]])
    })

    it("returns [0] for an empty column", () => {
      const solution = [
        [0, 1],
        [0, 1],
      ]
      expect(computeColumnHints(solution)).toEqual([[0], [2]])
    })

    it("returns empty array for empty solution", () => {
      expect(computeColumnHints([])).toEqual([])
    })

    it("matches what GameGrid would compute", () => {
      const solution = [
        [1, 0, 1],
        [1, 1, 0],
        [0, 1, 1],
      ]
      // col0: [1,1,0] → [2], col1: [0,1,1] → [2], col2: [1,0,1] → [1,1]
      expect(computeColumnHints(solution)).toEqual([[2], [2], [1, 1]])
    })
  })

  describe("countNonogramSolutions", () => {
    it("returns 1 for a uniquely solvable puzzle", () => {
      // Solution: [[1,1],[1,0]]
      // rowHints: [[2],[1]], colHints: [[2],[1]]
      // Only one grid satisfies both
      expect(countNonogramSolutions([[2], [1]], [[2], [1]])).toBe(1)
    })

    it("returns 2 for the classic ambiguous 2x2 pattern", () => {
      // Both [[1,0],[0,1]] and [[0,1],[1,0]] satisfy row/col hints [[1],[1]]
      expect(countNonogramSolutions([[1], [1]], [[1], [1]])).toBe(2)
    })

    it("returns 1 for a fully filled grid", () => {
      // All-filled: row hints [n], col hints [m] → only one solution
      expect(countNonogramSolutions([[3], [3]], [[2], [2], [2]])).toBe(1)
    })

    it("returns 1 for a fully empty grid", () => {
      expect(countNonogramSolutions([[0], [0]], [[0], [0]])).toBe(1)
    })

    it("stops counting at maxCount", () => {
      // The [[1],[1]] x [[1],[1]] puzzle has exactly 2 solutions; asking for
      // maxCount=1 should return 1 (stops early)
      expect(countNonogramSolutions([[1], [1]], [[1], [1]], 1)).toBe(1)
    })

    it("returns 0 for an unsatisfiable puzzle", () => {
      // 2 rows, 2 cols: row hint demands 2 filled in each row (total 4),
      // but col hint demands only 1 filled in each col (total 2) — impossible
      expect(countNonogramSolutions([[2], [2]], [[1], [1]])).toBe(0)
    })

    it("handles larger unique puzzle (4x4)", () => {
      const solution = [
        [1, 0, 0, 1],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 1, 1],
      ]
      const rh = computeRowHints(solution)
      const ch = computeColumnHints(solution)
      expect(countNonogramSolutions(rh, ch)).toBe(1)
    })
  })

  describe("hasUniqueSolution", () => {
    it("returns true for a uniquely solvable puzzle", () => {
      // [[1,1],[1,0]] — unique
      expect(hasUniqueSolution([[2], [1]], [[2], [1]])).toBe(true)
    })

    it("returns false for the classic ambiguous 2x2 swap", () => {
      expect(hasUniqueSolution([[1], [1]], [[1], [1]])).toBe(false)
    })

    it("returns true for an all-filled puzzle", () => {
      expect(hasUniqueSolution([[4], [4], [4]], [[3], [3], [3], [3]])).toBe(
        true,
      )
    })

    it("returns true for an all-empty puzzle", () => {
      expect(hasUniqueSolution([[0], [0], [0]], [[0], [0], [0]])).toBe(true)
    })

    it("returns false for another ambiguous pattern", () => {
      // 3x3 with row hints [[1,1],[1,1],[0]] and col hints [[1,1],[0],[1,1]]
      // Solution A: [[1,0,1],[1,0,1],[0,0,0]]
      // (swap the filled cells within each row → ambiguous)
      // Actually let me use a known ambiguous case:
      // row hints [[1],[1],[1]], col hints [[1],[1],[1]] has many solutions
      expect(hasUniqueSolution([[1], [1], [1]], [[1], [1], [1]])).toBe(false)
    })

    it("returns true for solution derived from a known grid", () => {
      const solution = [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 1],
        [1, 0, 0, 1],
      ]
      expect(
        hasUniqueSolution(
          computeRowHints(solution),
          computeColumnHints(solution),
        ),
      ).toBe(true)
    })
  })
})
