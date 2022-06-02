import { describe, expect, it } from "vitest"
import { removeZeros } from "@/utils/filters"

describe("filters", () => {
  describe("removeZeros", () => {
    it("removes zeros from input with zeros", () => {
      expect(
        removeZeros([
          [1, 0, 1],
          [0, 0, 0],
        ])
      ).toEqual([[1, 1], [0]])

      expect(
        removeZeros([
          [2, 0, 3, 0, 1],
          [3, 0, 4, 0, 1],
        ])
      ).toEqual([
        [2, 3, 1],
        [3, 4, 1],
      ])
    })
  })
})
