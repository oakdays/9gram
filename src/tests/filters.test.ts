import { describe, expect, it, test } from "vitest"
import { removeZeros } from "@/utils/filters"

describe("filters", () => {
  describe("removeZeros", () => {
    it("removes zeros from input with zeros", () => {
      expect(
        removeZeros([
          [1, 0, 1],
          [0, 0, 0],
        ]),
      ).toEqual([[1, 1], [0]])

      expect(
        removeZeros([
          [2, 0, 3, 0, 1],
          [3, 0, 4, 0, 1],
        ]),
      ).toEqual([
        [2, 3, 1],
        [3, 4, 1],
      ])
    })

    it("handles arrays without zeros", () => {
      expect(
        removeZeros([
          [1, 2, 3],
          [4, 5, 6],
        ]),
      ).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ])

      expect(removeZeros([[5, 3, 1, 2]])).toEqual([[5, 3, 1, 2]])
    })

    it("handles arrays with only zeros", () => {
      expect(removeZeros([[0, 0, 0], [0], [0, 0]])).toEqual([[0], [0], [0]])
    })

    it("handles mixed scenarios", () => {
      expect(
        removeZeros([
          [1, 2], // No zeros
          [0, 0, 0], // All zeros
          [3, 0, 4], // Mixed
          [0, 5, 0, 6, 0], // Multiple zeros
        ]),
      ).toEqual([[1, 2], [0], [3, 4], [5, 6]])
    })

    it("handles edge cases", () => {
      // Empty input
      expect(removeZeros([])).toEqual([])

      // Empty subarrays become [0]
      expect(removeZeros([[], []])).toEqual([[0], [0]])

      // Single elements
      expect(removeZeros([[0], [1], [2]])).toEqual([[0], [1], [2]])

      // Large arrays
      const largeInput = [
        [1, 0, 2, 0, 3, 0, 4, 0, 5],
        Array(20).fill(0),
        [10, 0, 0, 0, 20, 0, 0, 30],
      ]
      expect(removeZeros(largeInput)).toEqual([
        [1, 2, 3, 4, 5],
        [0],
        [10, 20, 30],
      ])
    })

    it("mutates the input array (current behavior)", () => {
      const input = [
        [1, 0, 2],
        [3, 4, 5],
      ]
      const result = removeZeros(input)

      // Function mutates the input array and returns the same reference
      expect(input).toEqual([
        [1, 2],
        [3, 4, 5],
      ])
      expect(result).toEqual([
        [1, 2],
        [3, 4, 5],
      ])
      expect(result).toBe(input) // Same reference
    })

    it("handles nonogram hint generation patterns", () => {
      // Simulates typical hint patterns from nonogram generation
      expect(
        removeZeros([
          [2, 0, 1, 0, 3], // Row with filled, empty, filled, empty, filled segments
          [0, 0, 4, 0, 0], // Row with only one filled segment in middle
          [1, 0, 0, 0, 1], // Row with filled segments at edges
          [0, 0, 0, 0, 0], // Row with no filled segments
        ]),
      ).toEqual([[2, 1, 3], [4], [1, 1], [0]])
    })
  })
})
