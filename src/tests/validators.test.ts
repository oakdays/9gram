import { describe, expect, it } from "vitest"
import { validateLine } from "@/utils/validators"

describe("validators", () => {
  describe("validateLine", () => {
    it("returns true with valid input", () => {
      expect(validateLine([1, 1], [1, 0, 1])).toBe(true)
      expect(validateLine([1, 2], [1, 0, 1, 1])).toBe(true)
      expect(validateLine([1, 2], [1, 0, 0, 1, 1])).toBe(true)
      expect(validateLine([3, 1, 3], [1, 1, 1, 0, 1, 0, 1, 1, 1])).toBe(true)
      expect(validateLine([3, 1], [1, 1, 1, 0, 1])).toBe(true)
      expect(validateLine([3, 1], [1, 1, 1, 0, 0, 1])).toBe(true)
      expect(validateLine([2, 2], [1, 1, 0, 1, 1])).toBe(true)
      expect(validateLine([2, 1], [1, 1, 0, 0, 1, 0, 0, 0])).toBe(true)
      expect(validateLine([4, 1, 1], [1, 1, 1, 1, 0, 1, 0, 1])).toBe(true)
      expect(validateLine([5, 1], [0, 1, 1, 1, 1, 1, 0, 1])).toBe(true)
      expect(validateLine([1, 1, 1], [0, 1, 0, 1, 0, 1, 0, 0])).toBe(true)
      expect(validateLine([2], [1, 1, 0, 0])).toBe(true)
      expect(validateLine([4], [1, 1, 1, 1])).toBe(true)
      expect(validateLine([2], [0, 1, 1, 0])).toBe(true)
      expect(validateLine([1, 1], [1, 0, 1, 0])).toBe(true)
      expect(validateLine([3], [0, 1, 1, 1])).toBe(true)
      expect(validateLine([0], [0, 0, 0, 0])).toBe(true)
      expect(validateLine([1], [0, 1, 0, 0, 0, 0, 0])).toBe(true)
      expect(validateLine([3, 1], [1, 1, 1, 0, 1, 0, 0])).toBe(true)
      expect(validateLine([2], [0, 0, 0, 0, 1, 1, 0])).toBe(true)
      expect(validateLine([1, 1], [0, 1, 0, 0, 1, 0, 0])).toBe(true)
      expect(validateLine([1, 1], [0, 1, 0, 1, 0])).toBe(true)
      expect(validateLine([0], [0, 0, 0, 0, 0])).toBe(true)
      expect(validateLine([0], [2, 2, 2, 2, 2])).toBe(true)
      expect(validateLine([4], [0, 1, 1, 1, 1])).toBe(true)
      expect(validateLine([1], [0, 0, 1, 0, 0])).toBe(true)
      expect(validateLine([1, 1], [0, 1, 0, 1])).toBe(true)
      expect(validateLine([1], [0, 0, 0, 1])).toBe(true)
    })

    it("returns false with invalid input", () => {
      expect(validateLine([1, 1], [1, 1])).toBe(false)
      expect(validateLine([1, 2], [1, 0, 1])).toBe(false)
      expect(validateLine([1, 2], [1, 0, 1, 0])).toBe(false)
      expect(validateLine([1, 2], [1])).toBe(false)
      expect(validateLine([3, 2, 1], [1, 1, 0, 1, 1, 0, 1])).toBe(false)
      expect(validateLine([1, 3, 1], [1, 0, 1, 1, 1, 0, 1, 1])).toBe(false)
    })

    it("prevents ambiguous solutions - exact group count required", () => {
      // Too few groups
      expect(validateLine([1, 1, 1], [1, 0, 1])).toBe(false)
      expect(validateLine([2, 2], [1, 1, 1, 1])).toBe(false)

      // Too many groups
      expect(validateLine([2], [1, 0, 1])).toBe(false)
      expect(validateLine([1], [1, 0, 1, 0, 1])).toBe(false)

      // Wrong group sizes
      expect(validateLine([3], [1, 1])).toBe(false)
      expect(validateLine([2], [1])).toBe(false)
      expect(validateLine([1, 2], [2, 0, 1])).toBe(false)
    })

    it("prevents ambiguous solutions - no partial matches", () => {
      // Partial solutions should not validate
      expect(validateLine([2, 1], [1, 1])).toBe(false) // Missing second group
      expect(validateLine([1, 3], [1])).toBe(false) // Missing second group entirely
      expect(validateLine([3, 1, 2], [1, 1, 1, 0, 1])).toBe(false) // Missing third group
    })

    it("handles marked cells (value 2) correctly", () => {
      // Marked cells should be treated as empty
      expect(validateLine([1, 1], [1, 2, 1])).toBe(true)
      expect(validateLine([2], [1, 1, 2, 2])).toBe(true)
      expect(validateLine([0], [2, 2, 2])).toBe(true)
      expect(validateLine([1], [2, 1, 2])).toBe(true)

      // Marked cells breaking groups
      expect(validateLine([3], [1, 2, 1, 1])).toBe(false) // 2 breaks the group
      expect(validateLine([1], [1, 2, 1])).toBe(false) // Creates two groups instead of one
    })

    it("handles edge cases correctly", () => {
      // Empty arrays
      expect(validateLine([], [])).toBe(true)

      // Single cell scenarios
      expect(validateLine([1], [1])).toBe(true)
      expect(validateLine([0], [0])).toBe(true)
      expect(validateLine([0], [2])).toBe(true)
      expect(validateLine([1], [0])).toBe(false)
      expect(validateLine([0], [1])).toBe(false)

      // All filled
      expect(validateLine([5], [1, 1, 1, 1, 1])).toBe(true)
      expect(validateLine([4], [1, 1, 1, 1, 1])).toBe(false)

      // All empty
      expect(validateLine([0], [0, 0, 0])).toBe(true)
      expect(validateLine([1], [0, 0, 0])).toBe(false)
    })

    describe("complex patterns", () => {
      it("validates complex multi-group patterns", () => {
        // Large puzzles with many groups
        expect(validateLine([1, 1, 1, 1, 1], [1, 0, 1, 0, 1, 0, 1, 0, 1])).toBe(
          true,
        )
        expect(
          validateLine([2, 3, 2, 1], [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1]),
        ).toBe(true)
        expect(validateLine([1, 1, 1, 1], [1, 0, 1, 0, 1, 0, 1])).toBe(true)

        // Complex patterns with mixed spacing
        expect(
          validateLine([3, 2, 4], [0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1]),
        ).toBe(true)
        expect(validateLine([1, 5, 1], [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1])).toBe(
          true,
        )
      })

      it("rejects complex invalid patterns", () => {
        // Wrong group counts in complex patterns
        expect(validateLine([1, 1, 1, 1, 1], [1, 0, 1, 0, 1, 0, 1])).toBe(false) // Missing groups
        expect(validateLine([2, 3, 2], [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1])).toBe(
          false,
        ) // Extra group

        // Wrong sizes in complex patterns
        expect(validateLine([3, 2, 4], [1, 1, 0, 1, 1, 0, 1, 1, 1, 1])).toBe(
          false,
        ) // Wrong first group
        expect(validateLine([1, 5, 1], [1, 0, 1, 1, 1, 1, 0, 1])).toBe(false) // Wrong middle group
      })
    })

    describe("stress testing with large inputs", () => {
      it("handles very long lines efficiently", () => {
        // Test with 50-cell line
        const hints = [10, 15, 20]
        const values = [
          ...Array(10).fill(1),
          0,
          0,
          ...Array(15).fill(1),
          0,
          ...Array(20).fill(1),
          ...Array(2).fill(0),
        ]
        expect(validateLine(hints, values)).toBe(true)

        // Test rejection of same pattern with wrong hint
        expect(validateLine([10, 15, 19], values)).toBe(false)
      })

      it("handles many small groups", () => {
        // 20 groups of size 1
        const hints = Array(20).fill(1)
        const values = Array(39)
          .fill(0)
          .map((_, i) => (i % 2 === 0 ? 1 : 0))
        expect(validateLine(hints, values)).toBe(true)

        // Wrong number of groups
        expect(validateLine(Array(19).fill(1), values)).toBe(false)
        expect(validateLine(Array(21).fill(1), values)).toBe(false)
      })
    })

    describe("boundary conditions", () => {
      it("handles maximum consecutive groups", () => {
        // Groups at start
        expect(validateLine([3, 2], [1, 1, 1, 0, 1, 1])).toBe(true)

        // Groups at end
        expect(validateLine([2, 3], [1, 1, 0, 1, 1, 1])).toBe(true)

        // Single separators
        expect(validateLine([2, 2, 2], [1, 1, 0, 1, 1, 0, 1, 1])).toBe(true)

        // Multiple separators
        expect(validateLine([1, 1], [1, 0, 0, 0, 1])).toBe(true)
      })

      it("rejects touching groups", () => {
        // Groups must be separated
        expect(validateLine([2, 2], [1, 1, 1, 1])).toBe(false)
        expect(validateLine([1, 1, 1], [1, 1, 1])).toBe(false)
        expect(validateLine([3, 1], [1, 1, 1, 1])).toBe(false)
      })
    })

    describe("marked cells advanced scenarios", () => {
      it("handles complex marked cell patterns", () => {
        // Marked cells as separators
        expect(validateLine([2, 3], [1, 1, 2, 1, 1, 1])).toBe(true)
        expect(validateLine([1, 1, 1], [1, 2, 1, 2, 1])).toBe(true)

        // Marked cells at boundaries
        expect(validateLine([3], [2, 1, 1, 1, 2])).toBe(true)
        expect(validateLine([2, 2], [2, 1, 1, 2, 2, 1, 1, 2])).toBe(true)

        // Mixed empty and marked separators
        expect(validateLine([2, 2], [1, 1, 0, 2, 1, 1])).toBe(true)
        expect(validateLine([1, 2], [1, 2, 0, 1, 1])).toBe(true)
      })

      it("rejects invalid marked cell scenarios", () => {
        // Marked cells breaking valid groups
        expect(validateLine([4], [1, 1, 2, 1, 1])).toBe(false)
        expect(validateLine([3], [1, 2, 1, 1])).toBe(false)

        // Creating wrong group counts with marked cells
        expect(validateLine([3], [1, 2, 1, 2, 1])).toBe(false)
      })
    })

    describe("property-based test scenarios", () => {
      it("validates sum consistency", () => {
        // Sum of hints should match count of filled cells
        const hints = [2, 3, 1]
        const validValues = [1, 1, 0, 1, 1, 1, 0, 1]
        const invalidValues = [1, 1, 0, 1, 1, 1, 0, 1, 1] // Extra filled cell

        expect(validateLine(hints, validValues)).toBe(true)
        expect(validateLine(hints, invalidValues)).toBe(false)
      })

      it("validates minimum line length requirements", () => {
        // Line must be long enough to fit all groups with separators
        const hints = [3, 2, 1]

        // Too short
        expect(validateLine(hints, [1, 1, 1, 0, 1, 1, 0])).toBe(false) // length 7 < 8

        // Just right
        expect(validateLine(hints, [1, 1, 1, 0, 1, 1, 0, 1])).toBe(true) // length 8

        // Longer is fine
        expect(validateLine(hints, [0, 1, 1, 1, 0, 1, 1, 0, 1, 0])).toBe(true)
      })
    })
  })
})
