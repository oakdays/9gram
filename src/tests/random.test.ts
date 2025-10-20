import { describe, expect, it } from "vitest"
import { getRandomNumberBetween } from "@/utils/random"

describe("random", () => {
  describe("getRandomNumberBetween", () => {
    it("returns number within specified range", () => {
      // Test multiple times due to randomness
      for (let i = 0; i < 100; i++) {
        const result = getRandomNumberBetween(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it("handles single value range", () => {
      for (let i = 0; i < 50; i++) {
        const result = getRandomNumberBetween(5, 5)
        expect(result).toBe(5)
      }
    })

    it("handles negative ranges", () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomNumberBetween(-10, -5)
        expect(result).toBeGreaterThanOrEqual(-10)
        expect(result).toBeLessThanOrEqual(-5)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it("handles ranges spanning zero", () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomNumberBetween(-5, 5)
        expect(result).toBeGreaterThanOrEqual(-5)
        expect(result).toBeLessThanOrEqual(5)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it("handles large ranges", () => {
      for (let i = 0; i < 50; i++) {
        const result = getRandomNumberBetween(1, 1000000)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(1000000)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it("produces reasonable distribution", () => {
      const counts = { low: 0, high: 0 }
      const trials = 1000

      for (let i = 0; i < trials; i++) {
        const result = getRandomNumberBetween(1, 10)
        if (result <= 5) counts.low++
        else counts.high++
      }

      // Should be roughly evenly distributed (allow for statistical variance)
      // Using a loose bound of 30-70% for each half
      expect(counts.low / trials).toBeGreaterThan(0.3)
      expect(counts.low / trials).toBeLessThan(0.7)
      expect(counts.high / trials).toBeGreaterThan(0.3)
      expect(counts.high / trials).toBeLessThan(0.7)
    })

    it("covers all values in small range", () => {
      const seen = new Set<number>()
      const min = 1,
        max = 3

      // Try enough times to likely see all values
      for (let i = 0; i < 200; i++) {
        seen.add(getRandomNumberBetween(min, max))
      }

      // Should have seen all possible values
      expect(seen.has(1)).toBe(true)
      expect(seen.has(2)).toBe(true)
      expect(seen.has(3)).toBe(true)
      expect(seen.size).toBe(3)
    })

    it("handles edge case ranges for nonogram grid generation", () => {
      // Test ranges used in the game
      const minRows = 4,
        maxRows = 8
      const minCols = 4,
        maxCols = 8

      for (let i = 0; i < 100; i++) {
        const rows = getRandomNumberBetween(minRows, maxRows)
        const cols = getRandomNumberBetween(minCols, maxCols)

        expect(rows).toBeGreaterThanOrEqual(minRows)
        expect(rows).toBeLessThanOrEqual(maxRows)
        expect(cols).toBeGreaterThanOrEqual(minCols)
        expect(cols).toBeLessThanOrEqual(maxCols)
      }
    })

    it("handles binary choice generation", () => {
      const results = new Set<number>()

      for (let i = 0; i < 100; i++) {
        const result = getRandomNumberBetween(0, 1)
        results.add(result)
        expect([0, 1]).toContain(result)
      }

      // Should see both 0 and 1
      expect(results.has(0)).toBe(true)
      expect(results.has(1)).toBe(true)
    })
  })
})
